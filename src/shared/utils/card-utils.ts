import { from, map, Observable } from "rxjs";
import { Card } from "../models";

export function getCardsFromRuneterraAr(): Observable<Card[]> {
  return from(
    Promise.allSettled([
      require("../../assets/sets/runeterraAR/en_us.json"),
    ])
  )
    .pipe(
      //@ts-ignore
      map((response: Array<{value: Card[], status: "fulfilled" | "rejected"}>) => {
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

export function getCards(): Observable<Card[]> {
  return getCardsFromRuneterraAr();
  // return from(
  //   Promise.allSettled([
  //     require("./assets/sets/en_us/set1-en_us.json"),
  //     require("./assets/sets/en_us/set2-en_us.json"),
  //     require("./assets/sets/en_us/set3-en_us.json"),
  //     require("./assets/sets/en_us/set4-en_us.json"),
  //     require("./assets/sets/en_us/set5-en_us.json"),
  //   ])
  // )
  // .pipe(
  //   //@ts-ignore
  //   map((response: Array<{value: Card[], status: "fulfilled" | "rejected"}>) => {
  //     let cards: Card[] = [];
  //     response.forEach(resolved => {
  //       // @ts-ignore
  //       cards = [...cards, ...resolved.value];
  //     });
  //     return cards;
  //   })
  // )
  // ;
}
