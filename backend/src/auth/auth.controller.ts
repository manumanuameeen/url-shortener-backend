import { Body, Controller, Post, Res, Req, UseGuards, Get, HttpStatus } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { IAuthService, LoginResponse, RegisterResponse } from './interfaces/auth.service.interface';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import type { Response, Request } from 'express';
import { JwtAuthGuard } from './guards/jwt-auth.guard';

import { MESSAGES } from '../common/constants/messages.constant';

export interface LogoutResponse {
  message: string;
}

export interface RequestWithUser extends Request {
  user: {
    userId: string;
  };
}

@ApiTags('Authentication')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: IAuthService) {}

  @ApiOperation({ summary: 'Register a new user' })
  @ApiResponse({ status: HttpStatus.CREATED, description: 'User created successfully' })
  @ApiResponse({ status: HttpStatus.CONFLICT, description: MESSAGES.ERRORS.EMAIL_IN_USE })
  @Post('register')
  register(@Body() registerDto: RegisterDto): Promise<RegisterResponse> {
    return this.authService.register(registerDto);
  }

  @ApiOperation({ summary: 'Login and get JWT token' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Returns user object and JWT access token' })
  @ApiResponse({ status: HttpStatus.UNAUTHORIZED, description: MESSAGES.ERRORS.INVALID_CREDENTIALS })
  @Post('login')
  async login(@Body() loginDto: LoginDto, @Res({ passthrough: true }) res: Response) {
    const loginData = await this.authService.login(loginDto);
    res.cookie('refreshToken', loginData.refresh_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });
    return {
      user: loginData.user,
      access_token: loginData.access_token,
    };
  }

  @ApiOperation({ summary: 'Refresh access token' })
  @Post('refresh')
  async refresh(@Req() req: Request, @Res({ passthrough: true }) res: Response) {
    const refreshToken = req.cookies['refreshToken'];
    if (!refreshToken) {
      return res.status(HttpStatus.UNAUTHORIZED).json({ message: MESSAGES.ERRORS.REFRESH_TOKEN_NOT_FOUND });
    }
    
    try {
      const tokens = await this.authService.refreshTokens(refreshToken);
      res.cookie('refreshToken', tokens.refresh_token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      });
      return res.status(HttpStatus.OK).json({ access_token: tokens.access_token });
    } catch (e) {
      res.clearCookie('refreshToken');
      return res.status(HttpStatus.UNAUTHORIZED).json({ message: MESSAGES.ERRORS.INVALID_REFRESH_TOKEN });
    }
  }

  @ApiOperation({ summary: 'Logout' })
  @ApiResponse({ status: HttpStatus.OK, description: MESSAGES.SUCCESS.LOGOUT })
  @UseGuards(JwtAuthGuard)
  @Post('logout')
  async logout(@Req() req: RequestWithUser, @Res({ passthrough: true }) res: Response): Promise<LogoutResponse> {
    const userId = req.user.userId;
    await this.authService.logout(userId);
    res.clearCookie('refreshToken');
    return { message: MESSAGES.SUCCESS.LOGOUT };
  }
}
