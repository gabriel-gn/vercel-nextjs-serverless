import { Controller, Get } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { TpocService } from './tpoc.service';
import {RiotAssetsService} from "../riot-assets/riot-assets.service";

@ApiTags('Path of Champions')
@Controller()
export class TpocController {
  constructor(
    private readonly tpocService: TpocService,
    private readonly riotAssetsService: RiotAssetsService
  ) {}

  @Get()
  async get() {
    return this.tpocService.get();
  }

  @Get('items')
  async getTpocItems() {
    return this.riotAssetsService.getLoRTPoCAssets();
  }

  @Get('champion-builds')
  async getOptimalTpocChampionBuilds() {
    return this.tpocService.getOptimalTpocChampionBuilds();
  }
}
