import { Injectable } from "@nestjs/common";
import { HttpMatchesService } from "./http-matches.service";
import { concatMap, forkJoin, map, Observable, tap, of } from "rxjs";
import { LoRServerRegion, RiotID } from "../../shared/models/riot-related";
import { LoRMatch } from "../../shared/models/lor-matches";
import { getLoRDecks } from "../../shared/utils/deck-utils";
import { LoRDeck } from "../../shared/models";

@Injectable()
export class MatchesService {
  constructor(
    private readonly httpMatchesService: HttpMatchesService
  ) {
  }

  public getPlayerMatches(from: number = 0, count: number = 0): Observable<LoRMatch[]> {
    let playerData: RiotID;
    return this.httpMatchesService.getPlayerData('Book', 'Teemo', 'americas').pipe(
      tap((riotData: RiotID) => {playerData = riotData;}),
      concatMap((riotData: RiotID) => this.httpMatchesService.getPlayerMatches(riotData.puuid, playerData.activeShard)),
      concatMap((matchIds: string[]) => { // FILTRA AS PARTIDAS QUE SERÃO RETORNADAS
        const to = !!count ? from + count : matchIds.length;
        matchIds = matchIds.slice(from, to); // caso vá diminuir o número de resultados
        return forkJoin(matchIds.map(matchId => {
          return this.httpMatchesService.getMatchData(matchId, playerData.activeShard);
        }));
      }),
      concatMap((lorMatches: LoRMatch[]) => { // ESSE CONCAT MAP MELHORA AS INFORMAÇÕES DE PLAYERS!!
        return forkJoin(lorMatches.map(lorMatch => {
          const playerPuuids = lorMatch.info.players.map(player => player.puuid);
          const playerInfoRequests = forkJoin(playerPuuids.map(puuid => {
            if (puuid === playerData.puuid) {
              return of(playerData);
            } else {
              return this.httpMatchesService.getPlayerDataByPuuid(puuid, playerData.activeShard)
            }
          }));
          return playerInfoRequests.pipe(
            map((players: RiotID[]) => {
              const completePlayersInfo = lorMatch.info.players.map(playerInfo => {
                return { ...playerInfo, ...{ riotId: players.find(x => x.puuid === playerInfo.puuid) } }
              });
              const result = lorMatch;
              lorMatch.info.players = completePlayersInfo;
              return result as LoRMatch;
            })
          );
        }));
      })
    );
  }

  public getPlayerMatchesWithDeck(from: number = 0, count: number = 0): Observable<LoRMatch[]> {
    return this.getPlayerMatches(from, count).pipe(
      concatMap((playerMatches: LoRMatch[]) => forkJoin(playerMatches.map(playerMatch => {
        const deckCodes = playerMatch.info.players.map(player => player.deck_code);
        return getLoRDecks(deckCodes).pipe(
          map((decks: LoRDeck[], index) => {
            let result = playerMatch;
            result.info.players = result.info.players.map((playerInfo, index) => {
              return {...playerInfo, ...{deck: decks[index]}};
            });
            return result as LoRMatch;
          })
        )
      })))
    );
  }
}
