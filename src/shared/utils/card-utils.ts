import { map, Observable, of } from 'rxjs';
import { RiotLoRCard } from '@gabrielgn-test/runeterra-tools';
import { pickBy } from 'lodash';

function minifyCards(
  cards: RiotLoRCard | RiotLoRCard[],
): RiotLoRCard | RiotLoRCard[] {
  // deixar o objeto menor!!
  const attrsToKeep = [
    'associatedCardRefs',
    'cardCode',
    'collectible',
    'cost',
    'keywordRefs',
    'name',
    'rarity',
    'rarityRef',
    'regionRefs',
    'regions',
    'spellSpeedRef',
    'subtypes',
    'supertype',
    'type',
    'formatRefs',
    'formats',
  ];
  const minifyCard = (card: RiotLoRCard) => {
    return pickBy(card, (value, key) => attrsToKeep.includes(key));
  };

  if (Array.isArray(cards)) {
    // se for array retorna um array
    return cards.map((cardFull) => {
      return minifyCard(cardFull);
    }) as RiotLoRCard[];
  } else {
    // se NÃO for array retorna a carta filtrada
    return minifyCard(cards) as RiotLoRCard;
  }
}

export function getCards(minifyCardData = true): Observable<RiotLoRCard[]> {
  const lang = global?.lang ? global.lang : 'en_us';
  // const requireDynamically = eval('require');
  return of(require(`../../assets/sets/${lang}/${lang}.json`)).pipe(
    map((cards: RiotLoRCard[]) => {
      if (minifyCardData) {
        return minifyCards(cards) as RiotLoRCard[];
      } else {
        return cards;
      }
    }),
  );
}

export function getCollectibleCards(
  minifyCardData = true,
): Observable<RiotLoRCard[]> {
  return getCards(minifyCardData).pipe(
    map((cards: RiotLoRCard[]) => {
      return cards.filter((card) => card.collectible);
    }),
  );
}
