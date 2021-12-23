import {Controller, Get, Param} from '@nestjs/common';
import {AppService} from './app.service';

@Controller()
export class AppController {
    constructor(private readonly appService: AppService) {
    }

    @Get()
    rootPath() {
        return `Healthcheck Ok`;
    }

    @Get('deck/:deckCode')
    getDeckByCode(@Param('deckCode') deckCode: string): { card: any, count: number }[] {
        return this.appService.getDeckByCode(deckCode);
    }
}
