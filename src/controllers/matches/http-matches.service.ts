import { Injectable } from "@nestjs/common";
import { HttpService } from "@nestjs/axios";
import { map, Observable } from "rxjs";
import { LoRRegions, RiotID, RiotLoRAPIEndpoints } from "../../shared/models/riot-related";
import { LoRMatch } from "../../shared/models/lor-matches";

@Injectable()
export class HttpMatchesService {
  constructor(
    private http: HttpService
  ) {
  }

  private getRiotHeadersConfig() {
    const headers = {"X-Riot-Token": "<TOKEN DA RITO AQUI>"};
    return {headers: headers}
  }

  public getPlayerData(gameName: string, tagLine: string, region: LoRRegions): Observable<RiotID> {
    return this.http.get(
      `${RiotLoRAPIEndpoints[region]}/riot/account/v1/accounts/by-riot-id/${gameName}/${tagLine}`,
      this.getRiotHeadersConfig()
    )
    .pipe(
      map(response => {
        return {...response.data, ...{LoRRegion: region}} as RiotID;
      }), // o http do axios da pau se não der .pipe(map(response => response.data))
    );
  }

  public getPlayerMatches(puuid: string): Observable<string[]> {
    return this.http.get(
      `${RiotLoRAPIEndpoints.AMERICAS}/lor/match/v1/matches/by-puuid/${puuid}/ids`,
      this.getRiotHeadersConfig()
    )
    .pipe(
      map(response => response.data), // o http do axios da pau se não der .pipe(map(response => response.data))
    );
  }

  public getMatchData(matchId: string): Observable<LoRMatch> {
    return this.http.get(
      `${RiotLoRAPIEndpoints.AMERICAS}/lor/match/v1/matches/${matchId}`,
      this.getRiotHeadersConfig()
    ).pipe(
      map(response => response.data), // o http do axios da pau se não der .pipe(map(response => response.data))
    );
  }
}
