import { from, map, Observable } from "rxjs";
import { Card } from "../models";
import _ from 'lodash';

function minifyCards(cards: Card | Card[]): Card | Card[] { // deixar o objeto menor!!
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
  const minifyCard = (card: Card) => {
    return _.pickBy(card, (value, key) => attrsToKeep.includes(key));
  };
  if (Array.isArray(cards)) { // se for array retorna um array
    return cards.map(cardFull => {
      return minifyCard(cardFull);
    }) as Card[];
  } else { // se NÃO for array retorna a carta filtrada
    return minifyCard(cards) as Card;
  }
}

export function getCards(minifyCardData: boolean = true): Observable<Card[]> {
  return from(
    Promise.allSettled([
      require("../../assets/sets/en_us/en_us.json"),
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
    }),
    map((cards: Card[]) => {
      if (minifyCardData) {
        return minifyCards(cards) as Card[];
      } else {
        return cards as unknown as Card[];
      }
    })
  )
  ;
}
