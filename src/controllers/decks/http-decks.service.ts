import { Injectable } from "@nestjs/common";
import { HttpService } from "@nestjs/axios";
import { catchError, concatMap, map, Observable, of, pluck, throwError } from "rxjs";
import { MobalyticsDeck, MobalyticsMetaDeck, UserDeck, UserDeckQueryResponse } from "../../shared/models";
import qs from "qs";
import { mobalyticsDecksToUserDecks } from "../../shared/utils/deck-utils";
import { SearchDeckLibraryDto } from "./decks.models";

@Injectable()
export class HttpDecksService {
  constructor(
    private http: HttpService
  ) {
  }

  public getMetaDecks(): Observable<UserDeck[]> {
    return this.http.get('https://lor.mobalytics.gg/api/v2/meta/tier-list')
      .pipe(
        map(response => response.data), // o http do axios da pau se não der .pipe(map(response => response.data))
        pluck('archetypes'),
        concatMap((metaDecks: MobalyticsMetaDeck[]) => {
          const mobalyticsDecks: MobalyticsDeck[] = metaDecks.map(metaDeck => {
            return { ...metaDeck.mostPopularDeck, ...{title: metaDeck.title, description: metaDeck.whyToBuild} }
          });
          const userDecks: Observable<UserDeck[]> = mobalyticsDecksToUserDecks(mobalyticsDecks).pipe(
            map((rawUserDecks: UserDeck[]) => {
              return rawUserDecks.map((rawUserDeck, index) => {
                return {...rawUserDeck, ...{badges: {tier: metaDecks[index].tier}}};
              }) as UserDeck[]
            })
          );
          return userDecks;
        }),
        catchError(error => throwError(error))
      )
      ;
  }

  public getDecksFromLibrary(searchObj: SearchDeckLibraryDto): Observable<UserDeckQueryResponse> {
    const defaultParams = {
      sortBy: 'recently_updated',
      from: 0,
      count: 20,
      withUserCards: false,
    }
    const addedParams = {}
    for (let key of Object.keys(searchObj)) {
      switch(key) {
        case 'category':
          addedParams['category'] = searchObj.category;
          break;
        case 'searchTerm':
          addedParams['searchTerm'] = searchObj.searchTerm;
          break;
        case 'factions':
          addedParams['region'] = searchObj.factions;
          break;
        case 'playStyle':
          addedParams['playStyle'] = searchObj.playStyle;
          break;
        case 'count':
          addedParams['count'] = searchObj.count;
          break;
        case 'cardIds':
          addedParams['cardID'] = searchObj.cardIds;
          break;
        case 'keywords':
          addedParams['keyword'] = searchObj.cardIds;
          break;
        case 'from':
          addedParams['from'] = searchObj.from;
          break;
      }
    }
    return this.http.get('https://lor.mobalytics.gg/api/v2/decks/library',{
      params: { ...defaultParams, ...addedParams },
      paramsSerializer: params => qs.stringify(params, { arrayFormat: "repeat" })
    })
      .pipe(
        map(response => response.data), // o http do axios da pau se não der .pipe(map(response => response.data))
        concatMap((response: any) => {
          return of(response).pipe(
            pluck('decks'),
            concatMap((mobalyticsDecks: MobalyticsDeck[]) => {
              return mobalyticsDecksToUserDecks(mobalyticsDecks);
            }),
            map(userDecks => {
              return {
                decks: userDecks,
                hasNext: response.hasNext
              }
            })
          );
        }),
      )
      ;
  }
}
