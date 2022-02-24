import { Injectable } from "@nestjs/common";
import { HttpMatchesService } from "./http-matches.service";
import { concatMap, forkJoin } from "rxjs";
import { LoRRegions, RiotID } from "../../shared/models/riot-related";

@Injectable()
export class MatchesService {
  constructor(
    private readonly httpMatchesService: HttpMatchesService
  ) {
  }

  getPlayerMatches(from: number = 0, count: number = 0) {
    return this.httpMatchesService.getPlayerData('Book', 'Teemo', 'AMERICAS').pipe(
      concatMap((riotData: RiotID) => this.httpMatchesService.getPlayerMatches(riotData.puuid)),
      concatMap((matchIds: string[]) => {
        count = !!count ? count : matchIds.length;
        matchIds = matchIds.slice(from, count); // caso vá diminuir o número de resultados
        return forkJoin(matchIds.map(matchId => this.httpMatchesService.getMatchData(matchId)));
      }),
    );
  }
}
