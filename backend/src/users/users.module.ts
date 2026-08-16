import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { IUsersService } from './interfaces/users.service.interface';

@Module({
  providers: [
    {
      provide: IUsersService,
      useClass: UsersService,
    },
  ],
  exports: [IUsersService],
})
export class UsersModule {}
