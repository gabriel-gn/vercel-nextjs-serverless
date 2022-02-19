import { from, map, Observable, of } from "rxjs";
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
  const lang = global?.lang ? global.lang : 'en_us';
  const requireDynamically = eval('require');
  return of(requireDynamically(`../../assets/sets/${lang}/${lang}.json`))
  .pipe(
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
