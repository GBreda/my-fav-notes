import { ConflictException, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Prisma } from '@prisma/client';
import bcrypt from 'bcryptjs';
import { AuthService } from './auth.service';

describe('AuthService', () => {
  const prisma = {
    user: {
      create: jest.fn(),
      findUnique: jest.fn(),
    },
  };
  const jwt = { sign: jest.fn().mockReturnValue('signed-token'), verify: jest.fn() };
  const service = new AuthService(prisma as never, jwt as unknown as JwtService);

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('stores a hash and returns the user without the password', async () => {
    prisma.user.create.mockImplementation(async ({ data }: { data: { passwordHash: string } }) => ({
      id: 'user-1',
      name: 'Ana',
      email: 'ana@example.com',
      passwordHash: data.passwordHash,
    }));

    const result = await service.register({
      name: 'Ana',
      email: 'ana@example.com',
      password: 'senha1234',
    });

    const stored = prisma.user.create.mock.calls[0][0].data.passwordHash as string;
    expect(stored).not.toBe('senha1234');
    expect(await bcrypt.compare('senha1234', stored)).toBe(true);
    expect(result.user).toEqual({ id: 'user-1', name: 'Ana', email: 'ana@example.com' });
    expect(result.token).toBe('signed-token');
    expect(JSON.stringify(result)).not.toContain(stored);
  });

  it('rejects an email that is already registered', async () => {
    const error = new Prisma.PrismaClientKnownRequestError('duplicate', {
      code: 'P2002',
      clientVersion: 'test',
    });
    prisma.user.create.mockRejectedValue(error);

    await expect(
      service.register({ name: 'Ana', email: 'ana@example.com', password: 'senha1234' }),
    ).rejects.toBeInstanceOf(ConflictException);
  });

  it('rejects a wrong password', async () => {
    prisma.user.findUnique.mockResolvedValue({
      id: 'user-1',
      name: 'Ana',
      email: 'ana@example.com',
      passwordHash: await bcrypt.hash('senha1234', 4),
    });

    await expect(
      service.login({ email: 'ana@example.com', password: 'errada123' }),
    ).rejects.toBeInstanceOf(UnauthorizedException);
  });

  it('still spends a hash comparison when the email does not exist', async () => {
    prisma.user.findUnique.mockResolvedValue(null);
    await expect(
      service.login({ email: 'missing@example.com', password: 'senha1234' }),
    ).rejects.toBeInstanceOf(UnauthorizedException);
  });

  it('signs in with the user id', async () => {
    prisma.user.findUnique.mockResolvedValue({
      id: 'user-1',
      name: 'Ana',
      email: 'ana@example.com',
      passwordHash: await bcrypt.hash('senha1234', 4),
    });

    const result = await service.login({ email: 'ana@example.com', password: 'senha1234' });
    expect(jwt.sign).toHaveBeenCalledWith({ sub: 'user-1', email: 'ana@example.com' });
    expect(result.user.email).toBe('ana@example.com');
  });
});
