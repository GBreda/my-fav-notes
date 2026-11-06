import { ConflictException, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Prisma, User } from '@prisma/client';
import { LoginInput, PublicUser, RegisterInput } from '@depois/shared';
import bcrypt from 'bcryptjs';
import { PrismaService } from '../prisma/prisma.service';
import { AuthUser } from './auth.types';

@Injectable()
export class AuthService {
  private dummyHash?: Promise<string>;

  constructor(
    private readonly prisma: PrismaService,
    private readonly jwt: JwtService,
  ) {}

  async register(input: RegisterInput) {
    const passwordHash = await bcrypt.hash(input.password, 12);
    try {
      const user = await this.prisma.user.create({
        data: {
          name: input.name,
          email: input.email,
          passwordHash,
        },
      });
      return this.session(user);
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
        throw new ConflictException({ code: 'EMAIL_IN_USE' });
      }
      throw error;
    }
  }

  async login(input: LoginInput) {
    const user = await this.prisma.user.findUnique({ where: { email: input.email } });
    const hash = user?.passwordHash ?? (await this.placeholderHash());
    const matches = await bcrypt.compare(input.password, hash);
    if (!user || !matches) {
      throw new UnauthorizedException({ code: 'INVALID_CREDENTIALS' });
    }
    return this.session(user);
  }

  async me(userId: string): Promise<PublicUser> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, name: true, email: true },
    });
    if (!user) {
      throw new UnauthorizedException({ code: 'UNAUTHORIZED' });
    }
    return user;
  }

  verify(token: string): AuthUser {
    const payload = this.jwt.verify<{ sub: string; email: string }>(token);
    if (!payload?.sub || !payload.email) {
      throw new UnauthorizedException({ code: 'UNAUTHORIZED' });
    }
    return { id: payload.sub, email: payload.email };
  }

  private placeholderHash() {
    this.dummyHash ??= bcrypt.hash('depois-placeholder-password', 12);
    return this.dummyHash;
  }

  private session(user: User) {
    return {
      token: this.jwt.sign({ sub: user.id, email: user.email }),
      user: { id: user.id, name: user.name, email: user.email } satisfies PublicUser,
    };
  }
}
