import {Injectable} from '@nestjs/common';
import {HttpMatchesService} from './http-matches.service';
import {concatMap, forkJoin, map, Observable, tap} from 'rxjs';
import {RiotID} from '../../shared/models/riot-related';
import {LoRMatch, LoRMatchPlayer} from '../../shared/models/lor-matches';
import {getLoRDeck} from '../../shared/utils/deck-utils';
import {isValidDeckCode, LoRDeck} from '@gabrielgn-test/runeterra-tools';
import {isEqual} from "lodash";

@Injectable()
export class MatchesService {
  constructor(public readonly httpMatchesService: HttpMatchesService) {
  }

  public getPlayerMatches(puuid: string, from = 0, count = 0): Observable<LoRMatch[]> {
    let playerData: RiotID;
    return this.httpMatchesService
      .getPlayerDataByPuuid(puuid)
      .pipe(
        map((riotData: RiotID[]) => {
          playerData = riotData[0];
          return playerData;
        }),
        concatMap((riotData: RiotID) =>
          this.httpMatchesService.getPlayerMatches(
            riotData.puuid,
            playerData.activeShard,
          ),
        ),
        concatMap((matchIds: string[]) => {
          // FILTRA AS PARTIDAS QUE SERÃO RETORNADAS
          const to = !!count ? from + count : matchIds.length;
          matchIds = matchIds.slice(from, to); // caso vá diminuir o número de resultados
          return forkJoin(
            matchIds.map((matchId) => {
              return this.httpMatchesService.getMatchData(
                matchId,
                playerData.activeShard,
              );
            }),
          );
        }),
      );
  }

  public proccessMatchesData(playerMatches$: Observable<LoRMatch[]>): Observable<LoRMatch[]> {
    let puuids: string[] = [];
    let riotIds: RiotID[] = [];
    let playerMatches: LoRMatch[] = [];
    let deckCodes: string[] = [];
    let decks: LoRDeck[] = [];

    return playerMatches$.pipe(
      // mapeia todos os puuids dos jogadores
      tap((matches: LoRMatch[]) => {
        playerMatches = matches
        const playersPuuids = matches.map((match: LoRMatch) => match.info.players.map(p => p.puuid)).flat();
        const uniquePuuids = [...new Set(playersPuuids)];
        puuids = uniquePuuids;
      }),
      // faz chamada pra API da riot buscando todos os dados completos do PUUID dos jogadores
      concatMap((matches: LoRMatch[]) => {
        return forkJoin(
          puuids.map(puuid => {
            return this.httpMatchesService.getPlayerDataByPuuid(puuid)
              .pipe(map(riotIds => riotIds[0]))
          })
        )
      }),
      // adiciona RiotID para cada "player" de cada "match"
      tap((riotIdsResponse: RiotID[]) => {
        riotIds = riotIdsResponse;
        playerMatches.forEach((match: LoRMatch) => {
          match.info.players.forEach((player: LoRMatchPlayer) => {
            player.riotId = riotIds.find(id => isEqual(id.puuid, player.puuid));
          })
        })
      }),
      // mapeia todos os decks das partidas
      tap(() => {
        const matchesDeckCodes = playerMatches.map((match: LoRMatch) => match.info.players.map(p => p.deck_code)).flat();
        const uniqueDeckCodes = [...new Set(matchesDeckCodes)];
        deckCodes = uniqueDeckCodes.filter(c => isValidDeckCode(c));
      }),
      // faz converte todos os deckCodes em LoRDeck e mapeia o deck code pra coincidir com o original
      concatMap(() => {
        return forkJoin(
          deckCodes.map(deckCode => {
            return getLoRDeck(deckCode).pipe(map(lorDeck => {
              return {...lorDeck, code: deckCode}; // faz isso para manter o mesmo deck code inputado
            }))
          })
        )
      }),
      // adiciona deck para cada "player" de cada "match"
      tap((lorDeckResponse: LoRDeck[]) => {
        decks = lorDeckResponse;
        playerMatches.forEach((match: LoRMatch) => {
          match.info.players.forEach((player: LoRMatchPlayer) => {
            // @ts-ignore
            player.deck = decks.find((deck) => deck.code === player.deck_code) ?? null;
          })
        })
      }),
      map(() => playerMatches)
    );
  }
}
