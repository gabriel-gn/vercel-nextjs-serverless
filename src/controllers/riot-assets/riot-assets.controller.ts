import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { ApiBody, ApiResponse, ApiTags } from '@nestjs/swagger';
import { RiotAssetsService } from './riot-assets.service';

@ApiTags('Riot Assets')
@Controller()
export class RiotAssetsController {
  constructor(private readonly riotAssetsService: RiotAssetsService) {}

  @Get()
  async get() {
    return this.riotAssetsService.get();
  }

  @Get('globals')
  async getGlobals() {
    return this.riotAssetsService.getLoRGlobals();
  }

  @Get('cards')
  async getCards() {
    return this.riotAssetsService.getLoRCards();
  }

  @Get('tpoc')
  async getLoRTPoCAssets() {
    return this.riotAssetsService.getLoRTPoCAssets();
  }
}
