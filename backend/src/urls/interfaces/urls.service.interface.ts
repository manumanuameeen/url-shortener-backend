import { Url } from '@prisma/client';
import { CreateUrlDto } from '../dto/create-url.dto';

export abstract class IUrlsService {
  abstract createShortUrl(userId: string, createUrlDto: CreateUrlDto): Promise<Url>;
  abstract findAllByUser(userId: string): Promise<Url[]>;
  abstract findByShortCode(shortCode: string): Promise<Url>;
  abstract removeUrl(userId: string, id: string): Promise<void>;
}
