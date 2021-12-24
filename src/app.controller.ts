import {Controller, Get, Param} from '@nestjs/common';
import {AppService} from './app.service';

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
        return this.appService.getDeckByCode(deckCode);
    }
}
