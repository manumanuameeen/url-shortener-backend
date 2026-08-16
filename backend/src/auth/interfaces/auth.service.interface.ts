import { RegisterDto } from '../dto/register.dto';
import { LoginDto } from '../dto/login.dto';
import type { User } from '@prisma/client';

export type SafeUser = Omit<User, 'passwordHash' | 'hashedRefreshToken'>;

export interface RegisterResponse extends SafeUser {}

export interface LoginResponse {
  user: SafeUser;
  access_token: string;
  refresh_token: string;
}

export abstract class IAuthService {
  abstract register(registerDto: RegisterDto): Promise<RegisterResponse>;
  abstract login(loginDto: LoginDto): Promise<LoginResponse>;
  abstract logout(userId: string): Promise<void>;
  abstract refreshTokens(refreshToken: string): Promise<{ access_token: string, refresh_token: string }>;
  abstract updateRefreshToken(userId: string, refreshToken: string): Promise<void>;
  abstract getTokens(userId: string, email: string): Promise<{ access_token: string, refresh_token: string }>;
}
