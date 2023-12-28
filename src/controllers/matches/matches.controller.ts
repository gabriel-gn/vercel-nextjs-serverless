import {Body, Controller, Get, Param, Post, Query} from '@nestjs/common';
import {ApiBody, ApiOperation, ApiResponse, ApiTags} from '@nestjs/swagger';
import { MatchesService } from './matches.service';
import {concatMap, Observable} from "rxjs";
import {LoRServerRegion, LoRServerRegionQuery, RiotID} from "../../shared/models/riot-related";
import {ApiImplicitParam} from "@nestjs/swagger/dist/decorators/api-implicit-param.decorator";
import {SearchCardsQuery} from "@controllers/cards/cards.dto";
import {LoRMatch} from "../../shared/models/lor-matches";

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
  @ApiOperation({ description: 'retrieves player data from riot' })
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
  @ApiOperation({ description: 'needs to provide (gameName && tagLine) or (puuid)' })
  @ApiImplicitParam({
    name: 'gameName',
    required: false,
    type: String,
  })
  @ApiImplicitParam({
    name: 'tagLine',
    required: false,
    type: String,
  })
  @ApiImplicitParam({
    name: 'region',
    required: false,
    enum: LoRServerRegionQuery,
  })
  @ApiImplicitParam({
    name: 'puuid',
    required: false,
    type: String,
  })
  @ApiImplicitParam({
    name: 'fullData',
    required: false,
    type: Boolean,
  })
  async getMatchesByPlayer(
      @Query('gameName') gameName: string,
      @Query('tagLine') tagLine: string,
      @Query('region') region: LoRServerRegion,
      @Query('puuid') puuid: string,
      @Query('fullData') fullData: boolean,
  ): Promise<Observable<LoRMatch[]>> {
    region = LoRServerRegionQuery.includes(region) ? region : undefined;
    fullData = `${fullData}`.toLowerCase() === 'true';

    const from: number = 0;
    const count: number = 4;
    let result: Observable<LoRMatch[]>;
    if (!puuid) {
      result = this.matchesService.httpMatchesService.getPlayerData(gameName, tagLine, region)
          .pipe(
              concatMap(resp => this.matchesService.getPlayerMatches(resp[0].puuid, from, count))
          )
    } else {
      result = this.matchesService.getPlayerMatches(puuid, from, count);
    }
    if (fullData) {
      result = this.matchesService.proccessMatchesData(result);
    }
    return result;
  }
}
