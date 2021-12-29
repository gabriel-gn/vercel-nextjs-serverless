import { Injectable } from "@nestjs/common";
import {
  getCodeFromDeck,
  getDeckFromCode,
  CardCodeAndCount,
  Deck
} from "lor-deckcodes-ts";
import { from, map, Observable, pluck, forkJoin, catchError, throwError, concatMap, of } from "rxjs";
import { Card, DeckCard, LoRDeck, MobalyticsMetaDeck } from "./models";
import { DeckFormat } from "./deck-format-utils";
import { HttpService } from "@nestjs/axios";
import { SearchDeckLibraryDto } from "./deck-library.dto";
import qs from "qs";

@Injectable()
export class AppService {
  constructor(
    private http: HttpService
  ) {
  }

  private getCards(): Observable<Card[]> {
    return from(
      Promise.allSettled([
        require("./sets/en_us/set1-en_us.json"),
        require("./sets/en_us/set2-en_us.json"),
        require("./sets/en_us/set3-en_us.json"),
        require("./sets/en_us/set4-en_us.json"),
        require("./sets/en_us/set5-en_us.json"),
      ])
    )
    .pipe(
      //@ts-ignore
      map((response: Array<{value: Card, status: "fulfilled" | "rejected"}>) => {
        let cards: Card[] = [];
        response.forEach(resolved => {
          // @ts-ignore
          cards = [...cards, ...resolved.value];
        });
        return cards;
      })
    )
    ;
  }

  public getDeckCardsByDeckCode(deckCode: string, cards: Card[] = undefined): Observable<DeckCard[]> {
    return of(cards)
    .pipe(
      // caso seja passado as cartas, não requer de novo o json
      concatMap(cardArray => {
        if (cardArray) {
          return of(cardArray)
        } else {
          return this.getCards();
        }
      }),
      map(cards => {
        const decodedDeck: Deck = getDeckFromCode(deckCode);
        const finalDeck: DeckCard[] = decodedDeck.map(card => {
          const foundCard = cards.find(lorCard => lorCard.cardCode === card.cardCode);
          if (foundCard.associatedCardRefs.length > 0) {
            foundCard.associatedCardRefs = foundCard.associatedCardRefs.sort();
          }
          return {
            card: foundCard,
            count: card.count
          };
        });
        return finalDeck;
      })
    )
    ;
  }

  public getLoRDeck(deckCode: string): Observable<LoRDeck> {
    return this.getLoRDecks([deckCode])
    .pipe(
      map(decks => {
        return decks[0];
      })
    )
    ;
  }

  public getLoRDecks(deckCodes: string[]): Observable<LoRDeck[]> {
    return this.getCards().pipe(
      concatMap(cards => {
        return forkJoin(
          deckCodes.map(deckCode => {
            return this.getDeckCardsByDeckCode(deckCode, cards)
              .pipe(
                map(deck => {return DeckFormat.cardArrayToLorDeck(deck);})
              )
          })
        )
      })
    );
  }

  public getMetaDecks(): Observable<MobalyticsMetaDeck[]> {
    return this.http.get('https://lor.mobalytics.gg/api/v2/meta/tier-list')
    .pipe(
      map(response => response.data), // o http do axios da pau se não der .pipe(map(response => response.data))
      pluck('archetypes'),
      concatMap(mobalyticsDecks => { // esse concat map adiciona a propriedade "lorDeck" no objeto que retorna do mobalytics
        const observablesArray: Observable<LoRDeck[]> = this.getLoRDecks(mobalyticsDecks.map(deck => deck.mostPopularDeck.exportUID));
        return observablesArray
        .pipe(
          map(lorDecks => {
            const finalMobalyticDecks: MobalyticsMetaDeck[] = [];
            for (let i = 0; i < mobalyticsDecks.length; i++) {
              const lorDeckObj = { ...lorDecks[i], ...{ title: mobalyticsDecks[i].title } };
              finalMobalyticDecks.push({...mobalyticsDecks[i], ...{lorDeck: lorDeckObj}});
            }
            return finalMobalyticDecks;
          })
        )
        ;
      }),
      catchError(error => throwError(error))
    )
    ;
  }

  public getDecksFromLibrary(searchObj: SearchDeckLibraryDto): Observable<LoRDeck[]> {
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
      }
    }
    return this.http.get('https://lor.mobalytics.gg/api/v2/decks/library',{
      params: { ...defaultParams, ...addedParams },
      paramsSerializer: params => qs.stringify(params, { arrayFormat: "repeat" })
    })
      .pipe(
        map(response => response.data), // o http do axios da pau se não der .pipe(map(response => response.data))
        pluck('decks'),
        concatMap((mobalyticsDecks) => {
          return this.getLoRDecks(mobalyticsDecks.map(deck => deck.exportUID))
            .pipe(
              map(lorDecks => lorDecks.map((lorDeck, i) => {
                return { ...lorDeck, ...{title: mobalyticsDecks[i]?.title, description: mobalyticsDecks[i]?.description} };
              }))
          );
        })
      )
    ;
  }
}
