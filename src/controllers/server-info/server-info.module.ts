import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { ServerInfoService } from './server-info.service';
import { ServerInfoController } from './server-info.controller';

@Module({
  imports: [HttpModule],
  controllers: [ServerInfoController],
  providers: [ServerInfoService],
})
export class ServerInfoModule {}
