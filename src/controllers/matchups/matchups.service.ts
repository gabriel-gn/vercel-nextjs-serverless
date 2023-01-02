import { Injectable } from '@nestjs/common';
import { concatMap, map, Observable, of, tap } from 'rxjs';
import { getLoRDeck } from '../../shared/utils/deck-utils';
import { LoRDeck } from '@gabrielgn-test/runeterra-tools';
import { intersection, orderBy } from 'lodash';
import { LoRMatchup } from '../../shared/models/lor-matchups';

@Injectable()
export class MatchupsService {
  constructor() {}

  public isOkCI: (any) => boolean = (matchupEntry) => {
    const CI_OK = 15; // %
    return matchupEntry.ciRange <= CI_OK;
  };

  public getFromDeckCode(deckCode: string, limit = 10): Observable<LoRMatchup[]> {
    return getLoRDeck(deckCode).pipe(
      // retorna entradas do arquivo em que o jogador usou deck inputado E ESTÁ DENTRO de intervalo de confiança aceitável
      concatMap((lorDeck: LoRDeck) => {
        return of(
          require(`../../assets/matchups/latest/latest_diamond.json`),
        ).pipe(
          map((matchups: LoRMatchup[]) => {
            const championCodes = lorDeck.cards.champions.map(
              (c) => c.card.cardCode,
            );
            return matchups.filter((matchupEntry: LoRMatchup) => {
              return (
                intersection(
                  championCodes,
                  matchupEntry.playerDeck.championCodes,
                ).length === championCodes.length && this.isOkCI(matchupEntry)
              );
            });
          }),
        );
      }),
      // limita os resultados, ordena por taxa de vitórias e adiciona o range do intervalo de confiança no winRate
      map((matchupEntries: LoRMatchup[]) => {
        matchupEntries = orderBy(matchupEntries, ['muGames'], ['desc']).splice(
          0,
          limit,
        );
        matchupEntries = orderBy(matchupEntries, ['muWR'], ['desc']);
        return matchupEntries;
      }),
    );
  }
}
