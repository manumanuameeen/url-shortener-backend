import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import type { Url } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateUrlDto } from './dto/create-url.dto';
import { nanoid } from 'nanoid';
import { IUrlsService } from './interfaces/urls.service.interface';
import { MESSAGES } from '../common/constants/messages.constant';

@Injectable()
export class UrlsService implements IUrlsService {
  constructor(private prisma: PrismaService) {}

  async createShortUrl(userId: string, createUrlDto: CreateUrlDto): Promise<Url> {
    const { originalUrl } = createUrlDto;

    // check protocol
    if (!originalUrl.startsWith('http://') && !originalUrl.startsWith('https://')) {
      throw new BadRequestException(MESSAGES.ERRORS.INVALID_PROTOCOL);
    }

    // prevent loop
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
    if (originalUrl.includes(frontendUrl) || originalUrl.includes('localhost:3000')) {
      throw new BadRequestException(MESSAGES.ERRORS.CANNOT_SHORTEN_SELF);
    }

    // check duplicate
    const existingUrl = await this.prisma.url.findFirst({
      where: {
        originalUrl,
        userId,
      },
    });

    if (existingUrl) {
      return existingUrl;
    }

    const shortCode = nanoid(6);
    return this.prisma.url.create({
      data: {
        originalUrl,
        shortCode,
        userId,
      },
    });
  }

  async findAllByUser(userId: string): Promise<Url[]> {
    return this.prisma.url.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findByShortCode(shortCode: string): Promise<Url> {
    const url = await this.prisma.url.findUnique({
      where: { shortCode },
    });
    if (!url) {
      throw new NotFoundException(MESSAGES.ERRORS.SHORT_URL_NOT_FOUND);
    }
    return url;
  }
}
