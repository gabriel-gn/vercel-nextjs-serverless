import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { DecksService } from './decks.service';
import { SearchDeckLibraryDto } from './decks.dto';
import { ApiBody, ApiResponse, ApiTags } from '@nestjs/swagger';

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
    return this.decksService.getMetaDecks();
  }

  @Get('trending')
  async getTrendingDecks() {
    return this.decksService.getTrendingDecks();
  }

  @Post('library')
  @ApiBody({ type: SearchDeckLibraryDto })
  @ApiResponse({
    status: 201,
    description: 'List of decks from mobalytics library',
    schema: {
      type: 'UserDeckQueryResponse',
    },
  })
  async getLibraryDecks(@Body() searchObj: SearchDeckLibraryDto) {
    return this.decksService.getDecksFromLibrary(searchObj);
  }
}
