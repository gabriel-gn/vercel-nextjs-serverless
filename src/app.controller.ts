import { Controller, Get } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

@Controller()
export class AppController {
  constructor() {}

  @Get()
  getHealthcheck() {
    return `Healthcheck Ok`;
  }
}

@ApiTags('Models')
@Controller()
export class ModelsController {
  constructor() {}
}
