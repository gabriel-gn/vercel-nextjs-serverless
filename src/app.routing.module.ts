import { Module, DynamicModule } from '@nestjs/common';
import { RouterModule } from '@nestjs/core';
import { DecksModule } from './controllers/decks/decks.module';
import { MatchesModule } from './controllers/matches/matches.module';
import { CardsModule } from "./controllers/cards/cards.module";

@Module({})
export class AppRoutingModule {
  static forRoot(): DynamicModule {
    return {
      module: AppRoutingModule,
      imports: [
        // NÃO ESQUECER DE IMPORTAR O MODULO DO ROUTER AQUI TBM!
        DecksModule,
        MatchesModule,
        CardsModule,
        RouterModule.register([
          {
            path: '/decks',
            module: DecksModule,
          },
          {
            path: '/matches',
            module: MatchesModule,
          },
          {
            path: '/cards',
            module: CardsModule,
          },
        ]),
      ],
    };
  }
}
