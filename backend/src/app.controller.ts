import { Controller, Get, Param, Res, NotFoundException } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiParam } from '@nestjs/swagger';
import { AppService } from './app.service';
import { UrlsService } from './urls/urls.service';
import type { Response } from 'express';
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
  @Get(':shortCode')
  async redirect(
    @Param('shortCode') shortCode: string,
    @Res() res: Response,
  ) {
    const url = await this.urlsService.findByShortCode(shortCode);
    return res.redirect(url.originalUrl);
  }
}
