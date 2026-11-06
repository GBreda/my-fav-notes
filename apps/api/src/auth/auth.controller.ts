import { Body, Controller, Get, HttpCode, Post, Res } from '@nestjs/common';
import { loginSchema, registerSchema } from '@depois/shared';
import type { Response } from 'express';
import { CurrentUser } from '../common/current-user.decorator';
import { Public } from '../common/public.decorator';
import { ZodValidationPipe } from '../common/zod-validation.pipe';
import { AuthService } from './auth.service';
import { AuthUser } from './auth.types';
import { COOKIE_NAME, cookieOptions } from './cookie';

@Controller('auth')
export class AuthController {
  constructor(private readonly auth: AuthService) {}

  @Public()
  @Post('register')
  async register(
    @Body(new ZodValidationPipe(registerSchema)) body: Parameters<AuthService['register']>[0],
    @Res({ passthrough: true }) response: Response,
  ) {
    const session = await this.auth.register(body);
    this.attach(response, session.token);
    return { user: session.user };
  }

  @Public()
  @HttpCode(200)
  @Post('login')
  async login(
    @Body(new ZodValidationPipe(loginSchema)) body: Parameters<AuthService['login']>[0],
    @Res({ passthrough: true }) response: Response,
  ) {
    const session = await this.auth.login(body);
    this.attach(response, session.token);
    return { user: session.user };
  }

  @Public()
  @HttpCode(200)
  @Post('logout')
  logout(@Res({ passthrough: true }) response: Response) {
    response.clearCookie(COOKIE_NAME, { ...cookieOptions(), maxAge: undefined });
    return { ok: true };
  }

  @Get('me')
  me(@CurrentUser() user: AuthUser) {
    return this.auth.me(user.id);
  }

  private attach(response: Response, token: string) {
    response.cookie(COOKIE_NAME, token, cookieOptions());
  }
}
