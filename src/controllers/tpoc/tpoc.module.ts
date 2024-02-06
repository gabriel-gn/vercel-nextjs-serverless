import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { TpocService } from './tpoc.service';
import { TpocController } from './tpoc.controller';
import { RiotAssetsService } from "../riot-assets/riot-assets.service";

@Module({
  imports: [HttpModule],
  controllers: [TpocController],
  providers: [TpocService, RiotAssetsService],
})
export class TpocModule {}
