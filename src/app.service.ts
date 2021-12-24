import { Injectable } from "@nestjs/common";
import {
  getCodeFromDeck,
  getDeckFromCode,
  CardCodeAndCount,
  Deck
} from "lor-deckcodes-ts";
import { from, map, Observable } from "rxjs";
import { Card, DeckCard } from "./models";

@Injectable()
export class AppService {
  constructor() {
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

  public getDeckByCode(deckCode: string): Observable<DeckCard[]> {
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
}
