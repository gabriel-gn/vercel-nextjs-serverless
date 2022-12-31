import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { MatchesController } from './matches.controller';
import { MatchesService } from './matches.service';
import { HttpMatchesService } from './http-matches.service';

@Module({
  imports: [HttpModule],
  controllers: [MatchesController],
  providers: [MatchesService, HttpMatchesService],
})
export class MatchesModule {}
