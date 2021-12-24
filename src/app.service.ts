import { Injectable } from "@nestjs/common";
import {
  getCodeFromDeck,
  getDeckFromCode,
  CardCodeAndCount,
  Deck
} from "lor-deckcodes-ts";
import { from, map, Observable } from "rxjs";

@Injectable()
export class AppService {
  constructor() {
  }

  getCards(): Observable<any[]> {
    return from(
      Promise.allSettled([
        require("./assets/en_us/set1-en_us.json"),
        require("./assets/en_us/set2-en_us.json"),
        require("./assets/en_us/set3-en_us.json"),
        require("./assets/en_us/set4-en_us.json"),
        require("./assets/en_us/set5-en_us.json"),
      ])
    )
    .pipe(
      //@ts-ignore
      map((response: Array<{value: any, status: "fulfilled" | "rejected"}>) => {
        let cards = [];
        response.forEach(resolved => {
          cards = [...cards, ...resolved.value];
        });
        return cards;
      })
    )
    ;
  }

  getDeckByCode(deckCode: string): Observable<{ card: any, count: number }[]> {
    return this.getCards()
    .pipe(
      map(cards => {
        const decodedDeck: Deck = getDeckFromCode(deckCode);
        const finalDeck: { card: any, count: number }[] = decodedDeck.map(card => {
          return {
            count: card.count
          };
        });
        return finalDeck;
      })
    )
    ;
  }
}
