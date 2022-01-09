import { Body, Controller, Get, Param, Post } from "@nestjs/common";
import { DecksService } from "./decks.service";
import { SearchDeckLibraryDto } from "./decks.models";

@Controller()
export class DecksController {

  constructor(private readonly decksService: DecksService) {}

  @Get("code/:deckCode")
  async getDeckByCode(@Param("deckCode") deckCode: string) {
    return this.decksService.getLoRDeck(deckCode);
  }

  @Get("meta")
  async getMetaDecks() {
    return this.decksService.getMetaDecks();
  }

  @Post("library")
  async getLibraryDecks(@Body() searchObj: SearchDeckLibraryDto) {
    return this.decksService.getDecksFromLibrary(searchObj);
  }

}
