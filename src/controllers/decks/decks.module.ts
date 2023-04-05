import { Module } from '@nestjs/common';
import { DecksService } from './decks.service';
import { DecksController } from './decks.controller';
import { HttpDecksService } from './http-decks.service';
import { HttpModule } from '@nestjs/axios';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { LanguageInterceptor } from '../../shared/interceptors/language.interceptor';

@Module({
  imports: [HttpModule],
  controllers: [DecksController],
  providers: [
    DecksService,
    HttpDecksService,
    {
      provide: APP_INTERCEPTOR,
      useClass: LanguageInterceptor,
    },
  ],
})
export class DecksModule {}
