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
  @ApiImplicitParam({
    name: 'queryType',
    required: true,
    enum: SearchCardsQuery,
  })
  @ApiImplicitQuery({
    name: 'exact',
    required: false,
    type: Boolean,
  })
  @ApiImplicitQuery({
    name: 'collectible',
    required: false,
    type: Boolean,
  })
  @ApiImplicitQuery({
    name: 'minify',
    required: false,
    type: Boolean,
  })
  @ApiImplicitQuery({
    name: 'limit',
    required: false,
    type: Number,
  })
  async searchCard(
    @Param('queryType') queryType: SearchCardsQueryType,
    @Query('q') query: string,
    @Query('exact') exactMatch: boolean,
    @Query('collectible') onlyCollectible: boolean = true,
    @Query('minify') minify: boolean = true,
    @Query('limit') limit: number = 5,
  ) {
    exactMatch = `${exactMatch}`.toLowerCase() == 'false';
    onlyCollectible = `${onlyCollectible}`.toLowerCase() === 'true';
    minify = `${minify}`.toLowerCase() === 'true';
    return this.cardsService.searchCard(query, queryType, !exactMatch, onlyCollectible, minify, +limit);
  }
}
