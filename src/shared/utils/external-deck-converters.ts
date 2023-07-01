import {
  LorMasterMetaDeck,
  MobalyticsDeck,
  RunescolaMetaDeck,
  RuneterraArLibraryDeck,
  UserDeck,
} from '../models';
import { forkJoin, map, Observable, of } from 'rxjs';
import { addLoRDeckBadges, getLoRDeckBadges, getLoRDecks } from './deck-utils';
import { generateDeckName, LoRDeck } from '@gabrielgn-test/runeterra-tools';
import _ from 'lodash';

export function mobalyticsDecksToUserDecks(
  mobalyticsDecks: MobalyticsDeck[],
): Observable<UserDeck[]> {
  if (mobalyticsDecks.length === 0) {
    return of([]);
  }
  return getLoRDecks(mobalyticsDecks.map((deck) => deck.exportUID)).pipe(
    map((lorDecks: LoRDeck[]) =>
      lorDecks.map((lorDeck, i) => {
        const userDeck = {
          ...{ deck: lorDeck },
          ...{
            title: mobalyticsDecks[i]?.title,
            description: mobalyticsDecks[i]?.description,
            changedAt: mobalyticsDecks[i]?.changedAt,
            createdAt: mobalyticsDecks[i]?.createdAt,
            username: mobalyticsDecks[i]?.owner?.name,
          },
        };
        return addLoRDeckBadges(userDeck);
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

        const userDeck = {
          ...{ deck: lorDeck },
          ...{
            title: _.unescape(
              runeterraArDecks[i]?.deck_name
                .split('\n')[0]
                .replace(/<\/?[^>]+(>|$)/g, ''),
            ),
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
        return addLoRDeckBadges(userDeck);
      }),
    ),
  );
}

export function runescolaMetaDecksToUserDecks(
  runescolaDecks: RunescolaMetaDeck[],
  getRelatedDecks = true,
  addTierBadge = false,
  date: number = undefined,
): Observable<UserDeck[]> {
  if (runescolaDecks.length === 0) {
    return of([]);
  }

  const maxWr = _.max(runescolaDecks.map((m) => m.winrate));
  const minWr = _.min(runescolaDecks.map((m) => m.winrate));
  const wrIntervals = (maxWr - minWr) / 5;
  const badgeTier = {
    S: maxWr - 0.5 * wrIntervals,
    A: maxWr - 1.5 * wrIntervals,
    B: maxWr - 2.5 * wrIntervals,
    C: maxWr - 3.8 * wrIntervals,
  };
  const getDeckTierByWR = (lorMasterDeck: RunescolaMetaDeck) => {
    if (lorMasterDeck.winrate < badgeTier.C) {
      return 'D';
    } else if (lorMasterDeck.winrate < badgeTier.B) {
      return 'C';
    } else if (lorMasterDeck.winrate < badgeTier.A) {
      return 'B';
    } else if (lorMasterDeck.winrate < badgeTier.S) {
      return 'A';
    } else {
      return 'S';
    }
  };

  return forkJoin([
    getLoRDecks(runescolaDecks.map((deck) => deck.best_decks[0])),
    getLoRDecks(runescolaDecks.map((deck) => deck.best_decks[1])), // para ser usado como related deck
    getLoRDecks(runescolaDecks.map((deck) => deck.best_decks[2])), // para ser usado como related deck
  ]).pipe(
    map((lorDecks: LoRDeck[][]) =>
      lorDecks[0].map((lorDeck, i) => {
        let userDeck: UserDeck = {
          ...{ deck: lorDeck },
          ...{
            title: generateDeckName(lorDeck),
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
        if (!!addTierBadge === true) {
          userDeck = {
            ...userDeck,
            badges: { tier: getDeckTierByWR(runescolaDecks[i]) },
          };
        }
        return addLoRDeckBadges(userDeck);
      }),
    ),
  );
}

export function lorMasterDecksToUserDecks(
  lorMasterDecks: LorMasterMetaDeck[],
  getRelatedDecks = true,
  addTierBadge = false,
  date: number = undefined,
  maxRelatedDecks: number = 2,
): Observable<UserDeck[]> {
  if (lorMasterDecks.length === 0) {
    return of([]);
  }

  const maxWr = _.max(lorMasterDecks.map((m) => m.win_rate));
  const minWr = _.min(lorMasterDecks.map((m) => m.win_rate));
  const wrIntervals = (maxWr - minWr) / 5;
  const badgeTier = {
    S: maxWr - 0.5 * wrIntervals,
    A: maxWr - 1.5 * wrIntervals,
    B: maxWr - 2.5 * wrIntervals,
    C: maxWr - 3.8 * wrIntervals,
  };

  const getDeckTierByWR = (lorMasterDeck: LorMasterMetaDeck) => {
    if (lorMasterDeck.win_rate < badgeTier.C) {
      return 'D';
    } else if (lorMasterDeck.win_rate < badgeTier.B) {
      return 'C';
    } else if (lorMasterDeck.win_rate < badgeTier.A) {
      return 'B';
    } else if (lorMasterDeck.win_rate < badgeTier.S) {
      return 'A';
    } else {
      return 'S';
    }
  };

  let lorDecksArray: Observable<LoRDeck[]>[];

  if (getRelatedDecks === true) {
    lorDecksArray = [
      getLoRDecks(lorMasterDecks.map((deck) => deck.decks[0].deck_code)),
      getLoRDecks(lorMasterDecks.map((deck) => deck.decks[1].deck_code)), // para ser usado como related deck
      getLoRDecks(lorMasterDecks.map((deck) => deck.decks[2].deck_code)), // para ser usado como related deck
    ];
  } else {
    lorDecksArray = [
      getLoRDecks(lorMasterDecks.map((deck) => deck.decks[0].deck_code)),
    ];
  }

  return forkJoin(lorDecksArray).pipe(
    map((lorDecks: LoRDeck[][]) =>
      lorDecks[0].map((lorDeck, i) => {
        const userDeck = {
          ...{ deck: lorDeck },
          ...{
            title: generateDeckName(lorDeck),
            description: '',
            // changedAt: date || new Date().getTime(),
            // createdAt: date || new Date().getTime(),
            username: '',
            badges: { tier: getDeckTierByWR(lorMasterDecks[i]) },
            stats: {
              playRatePercent: lorMasterDecks[i].play_rate * 100,
              winRatePercent: lorMasterDecks[i].win_rate * 100,
              matchesQt: lorMasterDecks[i].match_num,
            },
            relatedDecks: getRelatedDecks
              ? [lorDecks[1][i], lorDecks[2][i]]
              : [],
          },
        };
        if (addTierBadge === false) {
          delete userDeck.badges;
        }
        return addLoRDeckBadges(userDeck);
      }),
    ),
  );
}
