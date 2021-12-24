import { Injectable } from "@nestjs/common";
import {
  getCodeFromDeck,
  getDeckFromCode,
  CardCodeAndCount,
  Deck
} from "lor-deckcodes-ts";
import { from, map, Observable, pluck, forkJoin, catchError, throwError, concatMap } from "rxjs";
import { Card, DeckCard, LoRDeck, MobalyticsMetaDeck } from "./models";
import { DeckFormat } from "./deck-format-utils";
import { HttpService } from "@nestjs/axios";

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

  public getDeckCardsByCode(deckCode: string): Observable<DeckCard[]> {
    return this.getCards()
    .pipe(
      map(cards => {
        const decodedDeck: Deck = getDeckFromCode(deckCode);
        const finalDeck: DeckCard[] = decodedDeck.map(card => {
          return {
            card: cards.find(lorCard => lorCard.cardCode === card.cardCode),
            count: card.count
          };
        });
        return finalDeck;
      })
    )
    ;
  }

  public getLoRDeck(deckCode: string): Observable<LoRDeck> {
    return this.getDeckCardsByCode(deckCode)
    .pipe(
      map(deck => {
        return DeckFormat.cardArrayToLorDeck(deck);
      })
    )
    ;
  }

  public getMetaDecks(): Observable<MobalyticsMetaDeck[]> {
    return this.http.get('https://lor.mobalytics.gg/api/v2/meta/tier-list')
    .pipe(
      map(response => response.data), // o http do axios da pau se não der .pipe(map(response => response.data))
      pluck('archetypes'),
      concatMap(mobalyticsDecks => { // esse concat map adiciona a propriedade "lorDeck" no objeto que retorna do mobalytics
        const observablesArray: Observable<LoRDeck[]>[] = mobalyticsDecks.map(deck => {return this.getLoRDeck(deck.mostPopularDeck.exportUID)});
        return forkJoin(observablesArray)
        .pipe(
          map(lorDecks => {
            const finalMobalyticDecks: MobalyticsMetaDeck[] = [];
            for (let i = 0; i < mobalyticsDecks.length; i++) {
              finalMobalyticDecks.push({...mobalyticsDecks[i], ...{lorDeck: lorDecks[i]}});
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
}
