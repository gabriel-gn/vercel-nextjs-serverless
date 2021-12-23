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
    getDeckByCode(@Param('deckCode') deckCode: string): { card: any, count: number }[] {
        return this.appService.getDeckByCode(deckCode);
    }
}
