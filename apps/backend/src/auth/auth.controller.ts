import {
  Controller,
  Get,
  Post,
  Res,
  UseGuards,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AuthService } from './auth.service';
import { AuthGuard } from '@nestjs/passport/dist/auth.guard';
import { CurrentUser } from '../decorators/currentUser.decorator';
import type { UserPayload } from '@repo/shared-types';
import express from 'express';
import type { Response } from 'express';
import { BearerToken } from 'src/decorators/bearerToken.decorator';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly configService: ConfigService,
  ) {}

  @Post('google/sign-in')
  @UsePipes(new ValidationPipe())
  async googleAuth(
    @BearerToken() token: string,
    @Res({ passthrough: true }) res: express.Response,
  ): Promise<{ jwtToken: string }> {
    const { jwtToken } = await this.authService.googleAuth(token);

    res.cookie('auth-session', jwtToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    return { jwtToken };
  }

  @Post('sign-out')
  signOut(@Res({ passthrough: true }) res: Response): {
    message: string;
  } {
    res.clearCookie('auth-session', this.authService.getAuthCookieOptions());
    return { message: 'success' };
  }

  @Get('current-user')
  @UseGuards(AuthGuard())
  getCurrentUser(@CurrentUser() user: UserPayload): UserPayload {
    return this.authService.getCurrentUser(user);
  }
}
