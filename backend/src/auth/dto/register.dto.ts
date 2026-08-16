import { IsEmail, IsNotEmpty, IsString, MinLength } from 'class-validator';
import { MESSAGES } from '../../common/constants/messages.constant';

export class RegisterDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsEmail()
  email: string;

  @IsString()
  @MinLength(6, { message: MESSAGES.ERRORS.PASSWORD_TOO_SHORT })
  password: string;
}
