import { Controller, Get, Param, Res, NotFoundException } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiParam, ApiResponse } from '@nestjs/swagger';
import { AppService } from './app.service';
import { UrlsService } from './urls/urls.service';
import type { Response } from 'express';

@ApiTags('Redirect')
@Controller()
export class AppController {
  constructor(
    private readonly appService: AppService,
    private readonly urlsService: UrlsService,
  ) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  @ApiOperation({ summary: 'Redirect a short code to the original URL' })
  @ApiParam({ name: 'shortCode', description: 'The 6-character short code', example: 'aB3xZ9' })
  @ApiResponse({ status: 302, description: 'Redirects to the original URL' })
  @ApiResponse({ status: 404, description: 'Short URL not found' })
  @Get(':shortCode')
  async redirect(
    @Param('shortCode') shortCode: string,
    @Res() res: Response,
  ): Promise<void> {
    const url = await this.urlsService.findByShortCode(shortCode);
    res.redirect(url.originalUrl);
  }
}
