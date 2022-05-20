import { Deck, getDeckFromCode } from "@gabrielgn-test/lor-deckcodes-ts";
import { DeckFormat } from "./deck-format-utils";
import { map, Observable, forkJoin, concatMap, of, catchError, tap } from "rxjs";
import {
  Card,
  DeckCard,
  LoRDeck, MobalyticsDeck, RunescolaMetaDeck, RuneterraArLibraryDeck, UserDeck
} from "../../shared/models";
import {
  getCards
} from "./card-utils"
import _ from "lodash";

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

export function getDeckName(deck: LoRDeck) {
  let name = '';
  if (deck.cards.champions.length > 0) {
    name = _.orderBy(deck.cards.champions, ["count"], ["desc"]) //ordena por numero de cartas do campeão
      .slice(0, 2) // pega apenas os dois campeões mais relevantes
      .map((champion) => champion.card.name) // retorna o nome deles
      .join(' / ');
  } else {
    name = '';
  }
  return name;
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

export function runescolaMetaDecksToUserDecks(
  runescolaDecks: RunescolaMetaDeck[],
  getRelatedDecks: boolean = true,
  date: number = undefined
): Observable<UserDeck[]> {
  if (runescolaDecks.length === 0) { return of([]) };
  return forkJoin([
    getLoRDecks(runescolaDecks.map(deck => deck.best_decks[0])),
    getLoRDecks(runescolaDecks.map(deck => deck.best_decks[1])), // para ser usado como related deck
    getLoRDecks(runescolaDecks.map(deck => deck.best_decks[2])), // para ser usado como related deck
  ])
  .pipe(
    map((lorDecks: LoRDeck[][]) => lorDecks[0].map((lorDeck, i) => {
        return {
          ...{ deck: lorDeck },
          ...{
            title: getDeckName(lorDeck),
            description: '',
            changedAt: date || new Date().getTime(),
            createdAt: date || new Date().getTime(),
            username: '',
            stats: {
              playRatePercent: runescolaDecks[i].playrate,
              winRatePercent: runescolaDecks[i].winrate,
              matchesQt: runescolaDecks[i].total_matches,
            },
            relatedDecks: getRelatedDecks ? [lorDecks[1][i], lorDecks[2][i]] : [],
          },
        };
      }),
    ),
  );
}
