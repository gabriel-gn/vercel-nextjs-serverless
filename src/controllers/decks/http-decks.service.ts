import { Injectable } from "@nestjs/common";
import { HttpService } from "@nestjs/axios";
import { catchError, combineLatest, concatMap, forkJoin, map, Observable, of, pluck, throwError } from "rxjs";
import {
  DeckStats,
  LoRDeck,
  MobalyticsDeck,
  MobalyticsMetaDeck,
  UserDeck,
  UserDeckQueryResponse
} from "../../shared/models";
import qs from "qs";
import { getLoRDecks, mobalyticsDecksToUserDecks } from "../../shared/utils/deck-utils";
import { SearchDeckLibraryDto } from "./decks.dto";
import _ from 'lodash';

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
        catchError(error => throwError(error))
      )
      ;
  }

  public getTrendingDecks(): Observable<UserDeck[]> {
    const url = 'https://runeterra.ar/Meta/get/filter/everyone/en_us';
    const defaultPayload = {
      region: [],
      champ: []
    };
    const defaultParams = {
      take: 5,
      type: 'two',
      filter: true,
    }
    const getDeckName = (deck: LoRDeck) => {
      let name = '';
      if (deck.cards.champions.length > 0) {
        name = deck.cards.champions.slice(0, 2).map(champion => champion.card.name).join(' / ');
      } else {
        name = '';
      }
      return name;
    }

    const getDeckStats: (metaDeck: any) => DeckStats = (metaDeck: any) => {
      return {
        deckCode: metaDeck.deck_code,
        playRatePercent: metaDeck.pr,
        winRatePercent: metaDeck.wr,
        matchesQt: metaDeck.count
      }
    }

    const request1 = this.http.post(url, defaultPayload, { params: defaultParams }).pipe(map(response => response.data));

    const request2 = this.http.post(url, defaultPayload, { params: { ...defaultParams, ...{page: 2} } }).pipe(
      map(response => response.data),
    );
    const request3 = this.http.post(url, defaultPayload, { params: { ...defaultParams, ...{page: 3} } }).pipe(
      map(response => response.data),
    );
    return forkJoin([request1, request2, request3]).pipe(
      map(response => {
          const deckStats = [
            ...response[0].meta.map(metaDeck => getDeckStats(metaDeck)),
            ...response[1].meta.map(metaDeck => getDeckStats(metaDeck)),
            ...response[2].meta.map(metaDeck => getDeckStats(metaDeck))
          ];
          return { codes: deckStats.map(d => d.deckCode), stats: deckStats.map(d => {return _.omit(d, 'deckCode');}) };
        },
      ),
      // @ts-ignore
      concatMap((deckStats: {codes: string[], stats: DeckStats[]}) => {
        return forkJoin([
          getLoRDecks(deckStats.codes),
          of(deckStats.stats)
        ]);
      }),
      map((deckStats: [LoRDeck[], DeckStats[]]) => {
        return deckStats[0].map((deck, index) => {
          return { deck: deck, title: getDeckName(deck), description: "", username: "", stats: deckStats[1][index] }
        });
      }),
      catchError(error => throwError(error))
    )
  }
}
