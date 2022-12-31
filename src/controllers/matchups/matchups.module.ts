import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { MatchupsController } from './matchups.controller';
import { MatchupsService } from './matchups.service';

@Module({
  imports: [HttpModule],
  controllers: [MatchupsController],
  providers: [MatchupsService],
})
export class MatchupsModule {}
