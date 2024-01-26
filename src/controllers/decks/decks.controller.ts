import {
  Body,
  Controller,
  Get,
  Header,
  Param,
  Post,
  Query,
} from '@nestjs/common';
import { DecksService } from './decks.service';
import {
  SearchDeckLibraryCategory,
  SearchDeckLibraryDto,
  SearchDeckLibraryPlaystyle,
  SearchDeckLibraryRuneterraArDto,
} from './decks.dto';
import { ApiBody, ApiResponse, ApiTags } from '@nestjs/swagger';
import { ApiImplicitQuery } from '@nestjs/swagger/dist/decorators/api-implicit-query.decorator';
import { RiotLorRegionAbbreviation } from '@gabrielgn-test/runeterra-tools';
import { catchError } from 'rxjs';

@ApiTags('Decks')
@Controller()
export class DecksController {
  constructor(private readonly decksService: DecksService) {}

  @Get('code/:deckCode')
  async getDeckByCode(@Param('deckCode') deckCode: string) {
    return this.decksService.getLoRDeck(deckCode);
  }

  @Get('meta')
  async getMetaDecks() {
    return this.decksService.getMetaDecksOpal().pipe(
      catchError(() => this.decksService.getMetaDecksCitrine()),
      catchError(() => this.decksService.getMetaDecksIndigo()),
      catchError(() => this.decksService.getMetaDecksGranite()),
    );
  }

  @Get('meta-indigo')
  async getMetaDecksIndigo() {
    return this.decksService.getMetaDecksIndigo();
  }

  @Get('meta-granite')
  @Header('content-type', 'application/json')
  async getMetaDecksGranite() {
    return this.decksService.getMetaDecksGranite();
  }

  @Get('meta-opal')
  @Header('content-type', 'application/json')
  async getMetaDecksOpal() {
    return this.decksService.getMetaDecksOpal();
  }

  @Get('meta-citrine')
  @Header('content-type', 'application/json')
  async getMetaDecksCitrine() {
    return this.decksService.getMetaDecksCitrine();
  }

  @Get('trending')
  async getTrendingDecks() {
    return this.decksService
      .getTrendingDecksCarbon()
      .pipe(catchError(() => this.decksService.getTrendingDecksCitrine()));
  }

  @Get('trending-carbon')
  async getTrendingDecksCarbon() {
    return this.decksService.getTrendingDecksCarbon();
  }

  @Get('trending-citrine')
  @ApiImplicitQuery({
    name: 'relatedDecks',
    required: false,
    type: Boolean,
  })
  async getTrendingDecksCitrine(@Query('relatedDecks') relatedDecks: boolean) {
    relatedDecks = `${relatedDecks}`.toLowerCase() === 'true';
    return this.decksService.getTrendingDecksCitrine(relatedDecks);
  }

  @Post('library-indigo')
  @ApiBody({ type: SearchDeckLibraryDto })
  @ApiResponse({
    status: 201,
    description: 'List of decks from mobalytics library',
    schema: {
      type: 'UserDeckQueryResponse',
    },
  })
  async postLibraryDecks(@Body() searchObj: SearchDeckLibraryDto) {
    return this.decksService.getDecksFromLibraryIndigo(searchObj);
  }

  @Get('library-indigo')
  @ApiResponse({
    status: 201,
    description: 'List of decks from mobalytics library',
    schema: {
      type: 'UserDeckQueryResponse',
    },
  })
  async getLibraryDecksIndigo(
    @Query('category') category: SearchDeckLibraryCategory,
    @Query('playStyle') playStyle: SearchDeckLibraryPlaystyle,
    @Query('searchTerm') searchTerm: string,
    @Query('cardIds') cardIds: string[],
    @Query('factions') factions: RiotLorRegionAbbreviation[],
    @Query('keywords') keywords: string[],
    @Query('count') count: number,
    @Query('from') from: number,
  ) {
    category = `${category}`.toUpperCase() as SearchDeckLibraryCategory;
    category = ['BUDGET', 'FEATURED', 'COMMUNITY'].includes(category)
      ? category
      : 'COMMUNITY';

    const searchObj: SearchDeckLibraryDto = {
      category: category,
    };

    if (!!playStyle) {
      searchObj.playStyle =
        `${playStyle}`.toUpperCase() as SearchDeckLibraryPlaystyle;
    }

    if (!!searchTerm) {
      searchObj.searchTerm = `${searchTerm}`;
    }

    if (!!cardIds) {
      cardIds = `${cardIds}`.split(',');
      searchObj.cardIds = cardIds;
    }

    if (!!factions) {
      factions = `${factions}`.split(',') as RiotLorRegionAbbreviation[];
      searchObj.factions = factions;
    }

    if (!!keywords) {
      keywords = `${keywords}`.split(',');
      searchObj.keywords = keywords;
    }

    if (!!count && !isNaN(+count)) {
      searchObj.count = +count;
    }

    if (!!from && !isNaN(+from)) {
      searchObj.from = +from;
    }

    return this.decksService.getDecksFromLibraryIndigo(searchObj);
  }

  @Post('library-carbon')
  @ApiBody({ type: SearchDeckLibraryRuneterraArDto })
  @ApiResponse({
    status: 200,
    description: 'List of decks from runeterra AR library',
    schema: {
      type: 'UserDeckQueryResponse',
    },
  })
  async postDecksFromLibraryCarbon(
    @Body() searchObj: SearchDeckLibraryRuneterraArDto,
  ) {
    return this.decksService.getDecksFromLibraryCarbon(searchObj);
  }

  @Get('library-carbon')
  @ApiImplicitQuery({
    name: 'page',
    required: false,
    type: Number,
  })
  @ApiImplicitQuery({
    name: 'factions',
    required: false,
    isArray: true,
  })
  @ApiImplicitQuery({
    name: 'cardIds',
    required: false,
    isArray: true,
  })
  @ApiResponse({
    status: 200,
    description: 'List of decks from runeterra AR library',
    schema: {
      type: 'UserDeckQueryResponse',
    },
  })
  async getDecksFromLibraryCarbon(
    @Query('page') page: number,
    @Query('factions') factions: string[],
    @Query('cardIds') cardIds: string[],
  ) {
    const searchObj = {};

    if (!!page && !isNaN(+page)) {
      searchObj['page'] = +page;
    }

    if (!!factions) {
      factions = `${factions}`.split(',');
      searchObj['factions'] = factions;
    }

    if (!!cardIds) {
      cardIds = `${cardIds}`.split(',');
      searchObj['cardIds'] = cardIds;
    }

    return this.decksService.getDecksFromLibraryCarbon(searchObj);
  }

  @Get('hidden-gems')
  @ApiImplicitQuery({
    name: 'relatedDecks',
    required: false,
    type: Boolean,
  })
  async getHiddenGems(@Query('relatedDecks') relatedDecks: boolean) {
    relatedDecks = `${relatedDecks}`.toLowerCase() === 'true';
    return this.decksService
      .getHiddenGemsDecksOpal(20, relatedDecks)
      .pipe(
        catchError(() =>
          this.decksService.getHiddenGemsDecksCitrine(20, relatedDecks),
        ),
      );
  }

  @Get('social-media-creators')
  async getSocialMediaCreators() {
    return this.decksService.getSocialMediaCreators();
  }

  @Get('social-media')
  async getSocialMediaDecks() {
    return this.decksService.getSocialMediaDecks();
  }
}
