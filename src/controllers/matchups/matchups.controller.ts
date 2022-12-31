import { Controller, Get, Query } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { MatchupsService } from './matchups.service';
import { ApiImplicitQuery } from '@nestjs/swagger/dist/decorators/api-implicit-query.decorator';

@ApiTags('Matchups')
@Controller()
export class MatchupsController {
  constructor(private readonly matchupsService: MatchupsService) {}

  @Get()
  @ApiImplicitQuery({
    name: 'deckcode',
    required: false,
    type: String,
  })
  async get(@Query('deckcode') deckcode = '') {
    // http://localhost:3000/matchups?deckcode=EUCQCBQABMAQMBAIAEDAYGQBAYDQKBAEA4BF3AQBQMAQIAIFA4LACBQKDUAQMBYEAMCAOJR3QAAQIAIEA4GQCBQBCIAQMBZIAEDAKHY
    return this.matchupsService.getFromDeckCode(deckcode);
  }
}
