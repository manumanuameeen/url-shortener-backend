import { Body, Controller, Get, Post, Req, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import type { Request } from 'express';
import type { Url } from '@prisma/client';
import { UrlsService } from './urls.service';
import { CreateUrlDto } from './dto/create-url.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import type { JwtValidatedUser } from '../auth/strategies/jwt.strategy';

interface AuthenticatedRequest extends Request {
  user: JwtValidatedUser;
}

@ApiTags('URLs')
@ApiBearerAuth()
@Controller('urls')
export class UrlsController {
  constructor(private readonly urlsService: UrlsService) {}

  @ApiOperation({ summary: 'Create a new short URL' })
  @UseGuards(JwtAuthGuard)
  @Post()
  create(@Req() req: AuthenticatedRequest, @Body() createUrlDto: CreateUrlDto): Promise<Url> {
    const userId = req.user.userId;
    return this.urlsService.createShortUrl(userId, createUrlDto);
  }

  @ApiOperation({ summary: 'Get all URLs created by the current user' })
  @UseGuards(JwtAuthGuard)
  @Get()
  findAll(@Req() req: AuthenticatedRequest): Promise<Url[]> {
    const userId = req.user.userId;
    return this.urlsService.findAllByUser(userId);
  }
}
