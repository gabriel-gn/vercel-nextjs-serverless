import {Body, Controller, Get, Param, Post, Query} from '@nestjs/common';
import { ApiBody, ApiResponse, ApiTags } from '@nestjs/swagger';
import { MatchesService } from './matches.service';
import {Observable} from "rxjs";
import {LoRServerRegion, LoRServerRegionQuery, RiotID} from "../../shared/models/riot-related";
import {ApiImplicitParam} from "@nestjs/swagger/dist/decorators/api-implicit-param.decorator";
import {SearchCardsQuery} from "@controllers/cards/cards.dto";

@ApiTags('Matches')
@Controller()
export class MatchesController {
  constructor(
    private readonly matchesService: MatchesService
  ) {}

  @Get()
  getMatches() {
    return ':D';
  }

  @Get('player')
  @ApiImplicitParam({
    name: 'gameName',
    required: true,
    type: String,
  })
  @ApiImplicitParam({
    name: 'tagLine',
    required: true,
    type: String,
  })
  @ApiImplicitParam({
    name: 'region',
    required: false,
    enum: LoRServerRegionQuery,
  })
  async getPlayerData(
      @Query('gameName') gameName: string,
      @Query('tagLine') tagLine: string,
      @Query('region') region: LoRServerRegion,
  ): Promise<Observable<RiotID[]>> {
    region = LoRServerRegionQuery.includes(region) ? region : undefined;
    return this.matchesService.httpMatchesService.getPlayerData(gameName, tagLine, region);
  }

  @Get('by-player')
  async getMatchesByPlayer() {
    return this.matchesService.getPlayerMatchesWithDeck(0, 4);
  }
}
