import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { NewsController } from './news.controller';
import { NewsService } from './news.service';
import { HttpNewsService } from './http-news.service';

@Module({
  imports: [HttpModule],
  controllers: [NewsController],
  providers: [NewsService, HttpNewsService],
})
export class NewsModule {}
