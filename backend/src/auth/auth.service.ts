import { ConflictException, Injectable, UnauthorizedException } from '@nestjs/common';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import * as bcrypt from 'bcryptjs';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { IAuthService, RegisterResponse, LoginResponse } from './interfaces/auth.service.interface';
import { IUsersService } from '../users/interfaces/users.service.interface';
import { MESSAGES } from '../common/constants/messages.constant';

@Injectable()
export class AuthService implements IAuthService {
  constructor(
    private usersService: IUsersService,
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {}

  async register(registerDto: RegisterDto): Promise<RegisterResponse> {
    const { name, email, password } = registerDto;
    const existingUser = await this.usersService.findByEmail(email);
    if (existingUser) {
      throw new ConflictException(MESSAGES.ERRORS.EMAIL_IN_USE);
    }
    
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);
    const user = await this.usersService.createUser({
      name,
      email,
      passwordHash,
    });
    const { passwordHash: _, hashedRefreshToken: __, ...result } = user;
    return result;
  }

  async login(loginDto: LoginDto): Promise<LoginResponse> {
    const { email, password } = loginDto;
    const user = await this.usersService.findByEmail(email);
    if (!user) {
      throw new UnauthorizedException(MESSAGES.ERRORS.INVALID_CREDENTIALS);
    }
    const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
    if (!isPasswordValid) {
      throw new UnauthorizedException(MESSAGES.ERRORS.INVALID_CREDENTIALS);
    }
    
    const tokens = await this.getTokens(user.id, user.email);
    await this.updateRefreshToken(user.id, tokens.refresh_token);

    const { passwordHash: _, hashedRefreshToken: __, ...result } = user;
    return {
      user: result,
      ...tokens,
    };
  }

  async logout(userId: string) {
    await this.usersService.updateUser(userId, {
      hashedRefreshToken: null,
    });
  }

  async refreshTokens(refreshToken: string): Promise<{ access_token: string, refresh_token: string }> {
    let payload;
    try {
      payload = await this.jwtService.verifyAsync(refreshToken, {
        secret: this.configService.get<string>('JWT_REFRESH_SECRET') || this.configService.get<string>('JWT_SECRET'),
      });
    } catch {
      throw new UnauthorizedException(MESSAGES.ERRORS.ACCESS_DENIED);
    }

    const userId = payload.sub;
    const user = await this.usersService.findById(userId);
    if (!user || !user.hashedRefreshToken) {
      throw new UnauthorizedException(MESSAGES.ERRORS.ACCESS_DENIED);
    }
    const refreshTokenMatches = await bcrypt.compare(
      refreshToken,
      user.hashedRefreshToken,
    );
    if (!refreshTokenMatches) {
      throw new UnauthorizedException(MESSAGES.ERRORS.ACCESS_DENIED);
    }
    const tokens = await this.getTokens(user.id, user.email);
    await this.updateRefreshToken(user.id, tokens.refresh_token);
    return tokens;
  }

  async updateRefreshToken(userId: string, refreshToken: string) {
    const salt = await bcrypt.genSalt(10);
    const hashedRefreshToken = await bcrypt.hash(refreshToken, salt);
    await this.usersService.updateUser(userId, {
      hashedRefreshToken,
    });
  }

  async getTokens(userId: string, email: string) {
    const jwtPayload = {
      sub: userId,
      email: email,
    };
    const [access_token, refresh_token] = await Promise.all([
      this.jwtService.signAsync(jwtPayload, {
        secret: this.configService.get<string>('JWT_SECRET'),
        expiresIn: '15m',
      }),
      this.jwtService.signAsync(jwtPayload, {
        secret: this.configService.get<string>('JWT_REFRESH_SECRET') || this.configService.get<string>('JWT_SECRET'),
        expiresIn: '7d',
      }),
    ]);

    return {
      access_token,
      refresh_token,
    };
  }
}
