import { Deck, getDeckFromCode } from 'lor-deckcodes-ts';
import { DeckFormat } from './deck-format-utils';
import { concatMap, forkJoin, map, Observable, of } from 'rxjs';
import { DeckCard } from '../../shared/models';
import { getCards } from './card-utils';
import _ from 'lodash';
import {
  isRiotLorStandardFormat,
  LoRDeck,
  RiotLoRCard,
  UserDeck,
} from '@gabrielgn-test/runeterra-tools';

export function getDeckCardsByDeckCode(
  deckCode: string,
  cards: RiotLoRCard[] = undefined,
): Observable<DeckCard[]> {
  return of(cards).pipe(
    // caso seja passado as cartas, não requer de novo o json
    concatMap((cardArray) => {
      if (cardArray) {
        return of(cardArray);
      } else {
        return getCards();
      }
    }),
    map((cards) => {
      const decodedDeck: Deck = getDeckFromCode(deckCode);
      const finalDeck: DeckCard[] = decodedDeck.map((card) => {
        const foundCard = cards.find(
          (lorCard) => lorCard.cardCode === card.cardCode,
        );
        // if (foundCard.associatedCardRefs.length > 0) { // organizar as card refs
        //   foundCard.associatedCardRefs = foundCard.associatedCardRefs.sort();
        // }
        return foundCard
          ? {
              card: foundCard,
              count: card.count,
            }
          : null;
      });
      // Caso não ache alguma das cartas, envia o deck vazio
      return finalDeck.some((card) => card === null) ? [] : finalDeck;
    }),
  );
}

export function getLoRDeck(deckCode: string): Observable<LoRDeck> {
  return getLoRDecks([deckCode]).pipe(
    map((decks) => {
      return decks[0];
    }),
  );
}

export function getLoRDecks(deckCodes: string[]): Observable<LoRDeck[]> {
  return getCards().pipe(
    concatMap((cards) => {
      return forkJoin(
        deckCodes.map((deckCode) => {
          return getDeckCardsByDeckCode(deckCode, cards).pipe(
            map((deck: DeckCard[]) => {
              return DeckFormat.cardArrayToLorDeck(deck);
            }),
          );
        }),
      );
    }),
  );
}

export function getLoRDeckBadges(deck: LoRDeck): any {
  const badges: any = {};
  const deckCards: RiotLoRCard[] = Object.values(deck.cards)
    .flat()
    .map((c) => c.card);
  const formats = [
    ...new Set(deckCards.map((c) => c?.formatRefs).flat(1)),
  ].sort();
  for (const format of formats) {
    if (deckCards.every((c) => c?.formatRefs?.includes(format))) {
      if (badges.hasOwnProperty('formats')) {
        badges.formats.push(format);
      } else {
        badges.formats = [format];
      }
    }
  }
  return badges;
}

export function addLoRDeckBadges(deck: UserDeck): UserDeck {
  const defaultDeckBadges = getLoRDeckBadges(deck.deck);
  if (deck.hasOwnProperty('badges')) {
    deck.badges = { ...deck.badges, ...defaultDeckBadges };
  } else {
    _.set(deck, 'badges', defaultDeckBadges);
  }
  return deck;
}
