import { Module, DynamicModule } from "@nestjs/common";
import { RouterModule } from "@nestjs/core";
import { DecksModule } from "./controllers/decks/decks.module";
import { MatchesModule } from "./controllers/matches/matches.module";

@Module({})
export class AppRoutingModule {
  static forRoot(): DynamicModule {
    return {
      module: AppRoutingModule,
      imports: [
        // NÃO ESQUECER DE IMPORTAR O MODULO DO ROUTER AQUI TBM!
        DecksModule,
        MatchesModule,
        RouterModule.register([
          {
            path: "/decks",
            module: DecksModule,
          },
          {
            path: "/matches",
            module: MatchesModule,
          },
        ])
      ]
    };
  }
}
