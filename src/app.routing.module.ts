import { Module, DynamicModule } from '@nestjs/common';
import { RouterModule } from '@nestjs/core';
import { DecksModule } from './controllers/decks/decks.module';
import { MatchesModule } from './controllers/matches/matches.module';
import { CardsModule } from './controllers/cards/cards.module';
import { RiotAssetsModule } from './controllers/riot-assets/riot-assets.module';

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
        RiotAssetsModule,
        RouterModule.register([
          {
            path: '/riot-assets',
            module: RiotAssetsModule,
          },
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
