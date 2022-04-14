import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { ApiBody, ApiResponse, ApiTags } from '@nestjs/swagger';
import { RiotAssetsService } from './riot-assets.service';

@ApiTags('Matches')
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
}
