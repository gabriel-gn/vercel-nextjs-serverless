import {Controller, Get, Query} from '@nestjs/common';
import {ApiTags} from '@nestjs/swagger';
import {TpocService} from './tpoc.service';
import {RiotAssetsService} from "../riot-assets/riot-assets.service";
import {ApiImplicitQuery} from "@nestjs/swagger/dist/decorators/api-implicit-query.decorator";
import {from, of} from "rxjs";

@ApiTags('Path of Champions')
@Controller()
export class TpocController {
  constructor(
    private readonly tpocService: TpocService,
    private readonly riotAssetsService: RiotAssetsService
  ) {
  }

  @Get()
  async get() {
    return this.tpocService.get();
  }

  @Get('items')
  async getTpocItems() {
    return this.riotAssetsService.getLoRTPoCAssets();
  }

  @Get('champion-builds')
  @ApiImplicitQuery({
    name: 'raw',
    description: 'if true, use the google sheet to get real time state of updates',
    required: false,
    type: Boolean,
  })
  async getOptimalTpocChampionBuilds(@Query('raw') raw: boolean = false) {
    raw = `${raw}`.toLowerCase() === 'true';
    if (raw) {
      return this.tpocService.getOptimalTpocChampionBuilds();
    } else {
      return of(require(`../../assets/tpoc/static/champion_builds.json`));
    }
  }
}
