import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { CardsController } from './cards.controller';
import { CardsService } from './cards.service';

@Module({
  imports: [HttpModule],
  controllers: [CardsController],
  providers: [CardsService],
})
export class CardsModule {}
