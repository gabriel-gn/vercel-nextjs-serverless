import {
  LoRDeck,
  MobalyticsDeck,
  RunescolaMetaDeck,
  RuneterraArLibraryDeck,
  UserDeck,
} from '../models';
import { forkJoin, map, Observable, of } from 'rxjs';
import { getDeckName, getLoRDecks } from './deck-utils';

export function mobalyticsDecksToUserDecks(
  mobalyticsDecks: MobalyticsDeck[],
): Observable<UserDeck[]> {
  if (mobalyticsDecks.length === 0) {
    return of([]);
  }
  return getLoRDecks(mobalyticsDecks.map((deck) => deck.exportUID)).pipe(
    map((lorDecks: LoRDeck[]) =>
      lorDecks.map((lorDeck, i) => {
        return {
          ...{ deck: lorDeck },
          ...{
            title: mobalyticsDecks[i]?.title,
            description: mobalyticsDecks[i]?.description,
            changedAt: mobalyticsDecks[i]?.changedAt,
            createdAt: mobalyticsDecks[i]?.createdAt,
            username: mobalyticsDecks[i]?.owner?.name,
          },
        };
      }),
    ),
  );
}

export function runeterraARDecksToUserDecks(
  runeterraArDecks: RuneterraArLibraryDeck[],
): Observable<UserDeck[]> {
  if (runeterraArDecks.length === 0) {
    return of([]);
  }
  return getLoRDecks(runeterraArDecks.map((deck) => deck.deck_code)).pipe(
    map((lorDecks: LoRDeck[]) =>
      lorDecks.map((lorDeck, i) => {
        const dateObjectFromUTC = (s) => {
          s = s.split(/\D/);
          return new Date(
            Date.UTC(+s[0], --s[1], +s[2], +s[3], +s[4], +s[5], 0),
          );
        };

        return {
          ...{ deck: lorDeck },
          ...{
            title: runeterraArDecks[i]?.deck_name
              .split('\n')[0]
              .replace(/<\/?[^>]+(>|$)/g, ''),
            description: '',
            changedAt:
              dateObjectFromUTC(runeterraArDecks[i]?.date).getTime() ||
              new Date().getTime(),
            createdAt:
              dateObjectFromUTC(runeterraArDecks[i]?.date).getTime() ||
              new Date().getTime(),
            username: runeterraArDecks[i]?.gameName,
          },
        };
      }),
    ),
  );
}

export function runescolaMetaDecksToUserDecks(
  runescolaDecks: RunescolaMetaDeck[],
  getRelatedDecks = true,
  date: number = undefined,
): Observable<UserDeck[]> {
  if (runescolaDecks.length === 0) {
    return of([]);
  }
  return forkJoin([
    getLoRDecks(runescolaDecks.map((deck) => deck.best_decks[0])),
    getLoRDecks(runescolaDecks.map((deck) => deck.best_decks[1])), // para ser usado como related deck
    getLoRDecks(runescolaDecks.map((deck) => deck.best_decks[2])), // para ser usado como related deck
  ]).pipe(
    map((lorDecks: LoRDeck[][]) =>
      lorDecks[0].map((lorDeck, i) => {
        return {
          ...{ deck: lorDeck },
          ...{
            title: getDeckName(lorDeck),
            description: '',
            // changedAt: date || new Date().getTime(),
            // createdAt: date || new Date().getTime(),
            username: '',
            stats: {
              playRatePercent: runescolaDecks[i].playrate,
              winRatePercent: runescolaDecks[i].winrate,
              matchesQt: runescolaDecks[i].total_matches,
            },
            relatedDecks: getRelatedDecks
              ? [lorDecks[1][i], lorDecks[2][i]]
              : [],
          },
        };
      }),
    ),
  );
}
