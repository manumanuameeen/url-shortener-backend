import { Injectable, NotFoundException } from '@nestjs/common';
import type { Url } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateUrlDto } from './dto/create-url.dto';
import { nanoid } from 'nanoid';

@Injectable()
export class UrlsService {
  constructor(private prisma: PrismaService) {}

  async createShortUrl(userId: string, createUrlDto: CreateUrlDto): Promise<Url> {
    const { originalUrl } = createUrlDto;
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
      throw new NotFoundException('Short URL not found');
    }
    return url;
  }
}
