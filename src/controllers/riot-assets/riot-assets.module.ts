import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { RiotAssetsController } from './riot-assets.controller';
import { RiotAssetsService } from './riot-assets.service';

@Module({
  imports: [HttpModule],
  controllers: [RiotAssetsController],
  providers: [RiotAssetsService],
})
export class RiotAssetsModule {}
