import { Deck, getDeckFromCode } from "@gabrielgn-test/lor-deckcodes-ts";
import { DeckFormat } from "./deck-format-utils";
import { map, Observable, forkJoin, concatMap, of, catchError } from "rxjs";
import {
  Card,
  DeckCard,
  LoRDeck, MobalyticsDeck, RuneterraArLibraryDeck, UserDeck
} from "../../shared/models";
import {
  getCards
} from "./card-utils"

export function getDeckCardsByDeckCode(deckCode: string, cards: Card[] = undefined): Observable<DeckCard[]> {
  return of(cards)
    .pipe(
      // caso seja passado as cartas, não requer de novo o json
      concatMap(cardArray => {
        if (cardArray) {
          return of(cardArray);
        } else {
          return getCards();
        }
      }),
      map(cards => {
        const decodedDeck: Deck = getDeckFromCode(deckCode);
        const finalDeck: DeckCard[] = decodedDeck.map(card => {
          const foundCard = cards.find(lorCard => lorCard.cardCode === card.cardCode);
          // if (foundCard.associatedCardRefs.length > 0) { // organizar as card refs
          //   foundCard.associatedCardRefs = foundCard.associatedCardRefs.sort();
          // }
          return foundCard ? {
            card: foundCard,
            count: card.count
          } : null;
        });
        // Caso não ache alguma das cartas, envia o deck vazio
        return finalDeck.some(card => card === null) ? [] : finalDeck;
      })
    )
    ;
}

export function getLoRDeck(deckCode: string): Observable<LoRDeck> {
  return getLoRDecks([deckCode])
    .pipe(
      map(decks => {
        return decks[0];
      })
    )
    ;
}

export function getLoRDecks(deckCodes: string[]): Observable<LoRDeck[]> {
  return getCards().pipe(
    concatMap(cards => {
      return forkJoin(
        deckCodes.map(deckCode => {
          return getDeckCardsByDeckCode(deckCode, cards)
            .pipe(
              map((deck: DeckCard[]) => {
                return DeckFormat.cardArrayToLorDeck(deck);
              })
            );
        })
      );
    })
  );
}

export function mobalyticsDecksToUserDecks(mobalyticsDecks: MobalyticsDeck[]): Observable<UserDeck[]> {
  if (mobalyticsDecks.length === 0) { return of([]) };
  return getLoRDecks(mobalyticsDecks.map(deck => deck.exportUID))
    .pipe(
      map((lorDecks: LoRDeck[]) => lorDecks.map((lorDeck, i) => {
        return {
          ...{ deck: lorDeck },
          ...{
            title: mobalyticsDecks[i]?.title,
            description: mobalyticsDecks[i]?.description,
            changedAt: mobalyticsDecks[i]?.changedAt,
            createdAt: mobalyticsDecks[i]?.createdAt,
            username: mobalyticsDecks[i]?.owner?.name,
          }
        };
      }))
    );
}

export function runeterraARDecksToUserDecks(runeterraArDecks: RuneterraArLibraryDeck[]): Observable<UserDeck[]> {
  if (runeterraArDecks.length === 0) { return of([]) };
  return getLoRDecks(runeterraArDecks.map(deck => deck.deck_code))
    .pipe(
      map((lorDecks: LoRDeck[]) => lorDecks.map((lorDeck, i) => {
        const dateObjectFromUTC = (s) => {
          s = s.split(/\D/);
          return new Date(Date.UTC(+s[0], --s[1], +s[2], +s[3], +s[4], +s[5], 0));
        };

        return {
          ...{ deck: lorDeck },
          ...{
            title: runeterraArDecks[i]?.deck_name,
            description: '',
            changedAt: dateObjectFromUTC(runeterraArDecks[i]?.date).getTime() || new Date().getTime(),
            createdAt: dateObjectFromUTC(runeterraArDecks[i]?.date).getTime() || new Date().getTime(),
            username: runeterraArDecks[i]?.gameName,
          },
        };
      }),
    ),
  );
}
