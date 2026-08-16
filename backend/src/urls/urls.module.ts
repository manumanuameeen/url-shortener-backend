import { Module } from '@nestjs/common';
import { UrlsService } from './urls.service';
import { UrlsController } from './urls.controller';
import { IUrlsService } from './interfaces/urls.service.interface';

@Module({
  providers: [
    {
      provide: IUrlsService,
      useClass: UrlsService,
    },
  ],
  controllers: [UrlsController],
  exports: [IUrlsService],
})
export class UrlsModule {}
