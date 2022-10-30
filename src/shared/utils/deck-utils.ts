import { Deck, getDeckFromCode } from 'lor-deckcodes-ts';
import { DeckFormat } from './deck-format-utils';
import { concatMap, forkJoin, map, Observable, of } from 'rxjs';
import { DeckCard } from '../../shared/models';
import { getCards } from './card-utils';
import _ from 'lodash';
import { LoRDeck, RiotLoRCard } from '@gabrielgn-test/runeterra-tools';

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

export function getDeckName(deck: LoRDeck) {
  let name = '';
  if (deck.cards.champions.length > 0) {
    name = _.orderBy(deck.cards.champions, ['count'], ['desc']) //ordena por numero de cartas do campeão
      .slice(0, 2) // pega apenas os dois campeões mais relevantes
      .map((champion) => champion.card.name) // retorna o nome deles
      .join(' / ');
  } else {
    name = '';
  }
  return name;
}
