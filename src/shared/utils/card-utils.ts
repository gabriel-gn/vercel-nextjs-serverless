import { from, map, Observable } from "rxjs";
import { Card } from "../models";
import _ from 'lodash';

function filterCards(cards: Card[]): Card[] { // deixar o objeto menor!!
  const attrsToKeep = [
    'associatedCardRefs',
    'regions',
    'regionRefs',
    'cost',
    'name',
    'cardCode',
    'rarity',
    'rarityRef',
    'subtypes',
    'supertype',
    'type',
  ];
  return cards.map(cardFull => {
    return _.pickBy(cardFull, (value, key) => attrsToKeep.includes(key));
  }) as Card[];
}

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
          cards = [...cards, ...filterCards(resolved.value)];
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
