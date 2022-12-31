import { Controller, Get } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { ServerInfoService } from './server-info.service';

@ApiTags('ServerInfo')
@Controller()
export class ServerInfoController {
  constructor(private readonly serverInfoService: ServerInfoService) {}

  @Get()
  async get() {
    return this.serverInfoService.get();
  }
}
