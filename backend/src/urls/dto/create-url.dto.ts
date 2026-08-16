import { IsNotEmpty, IsUrl } from 'class-validator';
import { MESSAGES } from '../../common/constants/messages.constant';

export class CreateUrlDto {
  @IsUrl({}, { message: MESSAGES.ERRORS.INVALID_URL })
  @IsNotEmpty()
  originalUrl: string;
}
