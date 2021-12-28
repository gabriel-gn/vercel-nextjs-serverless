import { Body, Controller, Get, Param, Post } from "@nestjs/common";
import {AppService} from './app.service';
import { SearchDeckLibraryDto } from "./deck-library.dto";

@Controller()
export class AppController {
    constructor(private readonly appService: AppService) {
    }

    @Get()
    getHealthcheck() {
        return `Healthcheck Ok`;
    }

    @Get('deck/:deckCode')
    async getDeckByCode(@Param('deckCode') deckCode: string) {
        return this.appService.getLoRDeck(deckCode);
    }

    @Get('meta')
    async getMetaDecks() {
        return this.appService.getMetaDecks();
    }

    @Post('library')
    async getLibraryDecks(@Body() searchObj: SearchDeckLibraryDto) {
        return this.appService.getDecksFromLibrary(searchObj);
    }
}
