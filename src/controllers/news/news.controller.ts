import { Controller, Get, Query } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { NewsService } from './news.service';
import { ApiImplicitQuery } from '@nestjs/swagger/dist/decorators/api-implicit-query.decorator';

@ApiTags('News')
@Controller()
export class NewsController {
  constructor(private readonly newsService: NewsService) {}

  @Get()
  @ApiImplicitQuery({
    name: 'deckcode',
    required: false,
    type: String,
  })
  async get(@Query('deckcode') deckcode = '') {
    return this.newsService.get();
  }
}
