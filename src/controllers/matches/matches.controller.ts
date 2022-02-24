import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { ApiBody, ApiResponse, ApiTags } from '@nestjs/swagger';
import { MatchesService } from './matches.service';

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

  @Get('by-player')
  async getMatchesByPlayer() {
    return this.matchesService.getPlayerMatches(0, 5);
  }
}
