import { IsNotEmpty, IsUrl } from 'class-validator';

export class CreateUrlDto {
  @IsUrl({}, { message: 'Must be a valid URL (e.g. https://google.com)' })
  @IsNotEmpty()
  originalUrl: string;
}
