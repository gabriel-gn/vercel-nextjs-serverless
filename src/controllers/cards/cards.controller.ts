import { Controller, Get, Param, Query } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { CardsService } from './cards.service';
import { ApiImplicitQuery } from '@nestjs/swagger/dist/decorators/api-implicit-query.decorator';
import { SearchCardsQuery, SearchCardsQueryType } from './cards.dto';
import { ApiImplicitParam } from "@nestjs/swagger/dist/decorators/api-implicit-param.decorator";

@ApiTags('Cards')
@Controller()
export class CardsController {
  constructor(private readonly cardsService: CardsService) {}

  @Get()
  getCards() {
    return '';
  }

  @Get('by-code/:cardCode')
  async getCardByCode(@Param('cardCode') cardCode: string) {
    return this.cardsService.getCardByCode(cardCode);
  }

  @Get(`search/by-:queryType`)
  @ApiImplicitQuery({
    name: 'exact',
    required: false,
    type: Boolean,
  })
  @ApiImplicitParam({
    name: 'queryType',
    required: true,
    enum: SearchCardsQuery,
  })
  async searchCard(
    @Param('queryType') queryType: SearchCardsQueryType,
    @Query('q') query: string,
    @Query('exact') exactMatch: boolean,
  ) {
    const match: boolean = `${exactMatch}`.toLowerCase() == 'false';
    return this.cardsService.searchCard(query, queryType, !match);
  }
}
