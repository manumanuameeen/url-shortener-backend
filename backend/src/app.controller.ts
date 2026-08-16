import { Controller, Get, Param, Res, NotFoundException, Inject, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiParam, ApiResponse } from '@nestjs/swagger';
import { AppService } from './app.service';
import type { Response } from 'express';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import type { Cache } from 'cache-manager';

import { IUrlsService } from './urls/interfaces/urls.service.interface';
import { MESSAGES } from './common/constants/messages.constant';

@ApiTags('Redirect')
@Controller()
export class AppController {
  constructor(
    private readonly appService: AppService,
    private readonly urlsService: IUrlsService,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
  ) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  @ApiOperation({ summary: 'Redirect a short code to the original URL' })
  @ApiParam({ name: 'shortCode', description: 'The 6-character short code', example: 'aB3xZ9' })
  @ApiResponse({ status: HttpStatus.FOUND, description: 'Redirects to the original URL' })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: MESSAGES.ERRORS.SHORT_URL_NOT_FOUND })
  @Get(':shortCode')
  async redirect(
    @Param('shortCode') shortCode: string,
    @Res() res: Response,
  ): Promise<void> {
    const cacheKey = `url_${shortCode}`;
    let originalUrl = await this.cacheManager.get<string>(cacheKey);

    if (!originalUrl) {
      const url = await this.urlsService.findByShortCode(shortCode);
      originalUrl = url.originalUrl;
      // Cache for 10 minutes (600 seconds) - cache-manager v5+ uses milliseconds
      await this.cacheManager.set(cacheKey, originalUrl, 600000); 
    }

    res.redirect(originalUrl);
  }
}
