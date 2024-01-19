import { Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { concatMap, map, Observable, tap } from "rxjs";
import {
  LoRServerRegion,
  RiotID,
  RiotLoRAPIEndpoints,
} from '../../shared/models/riot-related';
import { LoRMatch } from '../../shared/models/lor-matches';
import { AxiosRequestConfig } from 'axios';

@Injectable()
export class HttpMatchesService {
  constructor(private http: HttpService) {}

  private getRiotHeadersConfig(): {
    headers: { [stringName: string]: string };
  } {
    const headers = { 'X-Riot-Token': `RGAPI-bd65e23d-fdf6-4531-b4ce-a0e465651362` };
    return { headers: headers };
  }

  public getPlayerData(
    gameName: string,
    tagLine: string,
    region: LoRServerRegion,
  ): Observable<RiotID> {
    return this.http
      .get(
        `${
          RiotLoRAPIEndpoints[region.toUpperCase()]
        }/riot/account/v1/accounts/by-riot-id/${gameName}/${tagLine}`,
        this.getRiotHeadersConfig() as AxiosRequestConfig<any>,
      )
      .pipe(
        map((response) => response.data),
        concatMap((response: RiotID) => {
          return this.getPlayerActiveShard(response.puuid, region).pipe(
            map((activeShard) => {
              return { ...response, ...{ activeShard: activeShard } } as RiotID;
            }),
          );
        }),
      );
  }

  public getPlayerDataByPuuid(puuid: string, region: LoRServerRegion) {
    return this.http
      .get(
        `${
          RiotLoRAPIEndpoints[region.toUpperCase()]
        }/riot/account/v1/accounts/by-puuid/${puuid}`,
        this.getRiotHeadersConfig(),
      )
      .pipe(
        map((response) => response.data),
        concatMap((response: RiotID) => {
          return this.getPlayerActiveShard(response.puuid, region).pipe(
            map((activeShard) => {
              return { ...response, ...{ activeShard: activeShard } } as RiotID;
            }),
          );
        }),
      );
  }

  public getPlayerActiveShard(
    puuid: string,
    region: LoRServerRegion,
  ): Observable<LoRServerRegion> {
    return this.http
      .get(
        `${
          RiotLoRAPIEndpoints[region.toUpperCase()]
        }/riot/account/v1/active-shards/by-game/lor/by-puuid/${puuid}`,
        this.getRiotHeadersConfig(),
      )
      .pipe(
        map((response) => response.data.activeShard), // o http do axios da pau se não der .pipe(map(response => response.data))
      );
  }

  public getPlayerMatches(
    puuid: string,
    region: LoRServerRegion,
  ): Observable<string[]> {
    return this.http
      .get(
        `${
          RiotLoRAPIEndpoints[region.toUpperCase()]
        }/lor/match/v1/matches/by-puuid/${puuid}/ids`,
        this.getRiotHeadersConfig(),
      )
      .pipe(
        map((response) => response.data), // o http do axios da pau se não der .pipe(map(response => response.data))
      );
  }

  public getMatchData(
    matchId: string,
    region: LoRServerRegion,
  ): Observable<LoRMatch> {
    return this.http
      .get(
        `${
          RiotLoRAPIEndpoints[region.toUpperCase()]
        }/lor/match/v1/matches/${matchId}`,
        this.getRiotHeadersConfig(),
      )
      .pipe(
        map((response) => response.data), // o http do axios da pau se não der .pipe(map(response => response.data))
      );
  }
}
