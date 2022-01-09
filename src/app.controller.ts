import { Controller, Get } from "@nestjs/common";

@Controller()
export class AppController {
    constructor() {
    }

    @Get()
    getHealthcheck() {
        return `Healthcheck Ok`;
    }

}
