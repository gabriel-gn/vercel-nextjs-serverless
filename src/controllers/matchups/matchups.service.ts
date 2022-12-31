import { Injectable } from '@nestjs/common';
import { concatMap, from, map, Observable } from 'rxjs';
import { parse } from 'csv-parse';
import * as fs from 'fs';
import * as path from 'path';
import { getLoRDeck } from '../../shared/utils/deck-utils';
import { generateDeckName, LoRDeck, RiotLoRCard } from "@gabrielgn-test/runeterra-tools";
import _ from 'lodash';
import { getCards } from "../../shared/utils/card-utils";

@Injectable()
export class MatchupsService {
  constructor() {}

  private getCsvContent(
    csvPath: string,
    removeHeaders = true,
  ): Observable<any> {
    const csvFilePath = path.resolve(__dirname, csvPath);
    const headers = [
      'playerDeck', // deck’s archetype of the playerDeck
      'opponentDeck', // deck’s archetype of the opponentDeck
      'muWin', // min number of wins for a match-up
      'muGames', // min number of games for a match-up
      'muWR', // matchup winrate 0-1
      'okCI', // se está dentro do intervalo de confiança aceitável "TRUE" | "FALSE"
      'direction', // simply if the MU is positive (win rate > 50%) or negative (win rate < 50%) for the ‘Player’ or tie (win rate = 50%)
      'CI',
      'mirror', // hide or include mirror match-ups
      'playrate',
      'opponentPR',
    ];
    const fileContent = fs.readFileSync(csvFilePath, { encoding: 'utf-8' });
    return from(
      new Promise((resolve, reject) => {
        parse(
          fileContent,
          { delimiter: ',', columns: headers },
          (error, result: any[]) => {
            if (error) {
              reject(error);
            } else {
              resolve(result);
            }
          },
        );
      }),
    ).pipe(
      map((result: any[]) => {
        if (removeHeaders) {
          return result.splice(1);
        } else {
          return result;
        }
      }),
    );
  }

  public get(): Observable<any> {
    return this.getCsvContent(
      '../../assets/matchups_data/3_21/3_21_diamond.csv',
    );
  }

  public getCI: (any) => number = (matchupEntry: any) => {
    const LCI_LCU = `${matchupEntry.CI}` // eg: (47.7% - 62.7%)
      .replaceAll('(', '')
      .replaceAll(')', '')
      .replaceAll('%', '')
      .split(' - ');
    return +LCI_LCU[1] - +LCI_LCU[0];
  };

  public isOkCI: (any) => boolean = (matchupEntry) => {
    const CI_OK = 15; // %
    return this.getCI(matchupEntry) <= CI_OK;
  };

  public getFromDeckCode(deckCode: string): Observable<any> {
    let csvContent = [];
    return this.get().pipe(
      // retorna LoR Deck
      concatMap((result) => {
        csvContent = result;
        return getLoRDeck(deckCode);
      }),
      // retorna campeões do deck em ordem alfabética como string (eg. Ezreal/Seraphine)
      map((lorDeck: LoRDeck) => {
        return generateDeckName(lorDeck)
          .split('/')
          .sort()
          .join('/')
          .replaceAll(' ', '');
      }),
      // retorna entradas do csv em que o jogador usou deck inputado E ESTÁ DENTRO de intervalo de confiança aceitável
      map((deckName: string) => {
        return csvContent.filter((matchupEntry: any) => {
          return (
            matchupEntry.playerDeck.includes(deckName) &&
            this.isOkCI(matchupEntry)
            // `${matchupEntry.okCI}`.toUpperCase() === 'TRUE'
          );
        });
      }),
      // ordena por taxa de vitórias e adiciona o range do intervalo de confiança no winRate
      map((matchupEntries: any) => {
        matchupEntries = _.orderBy(matchupEntries, ['muWR'], ['desc']);
        matchupEntries = matchupEntries.map((entry: any) => {
          return { ...entry, ...{ ciRange: this.getCI(entry) } };
        });
        return matchupEntries;
      }),
      // transforma os nomes dos campeões nas chaves em seu código de carta
      concatMap((matchupEntries: any) => {
        const toAlphaNum = (str) => {
          return `${str}`.toLowerCase().replace(/[^a-z0-9]/gi,'');
        };

        return getCards().pipe(
          map((allCards: RiotLoRCard[]) => {
            const keysToConvert = ['opponentDeck', 'playerDeck'];
            matchupEntries.forEach((entry: any) => {
              keysToConvert.forEach((key: string) => {
                const championNames = `${entry[key]}`
                  .split(' ')[0] // pega apenas os nomes de champs
                  .split('/')
                  .map((champName) => allCards.find((c) => toAlphaNum(c.name) === toAlphaNum(champName))?.cardCode)
                  .join('/');
                entry[key] = `${championNames} ` + `${entry[key]}`.split(' ')[1];
              });
            });
            return matchupEntries;
          }),
        );
      }),
    );
  }
}
