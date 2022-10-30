import { CardCodeAndCount, getCodeFromDeck } from 'lor-deckcodes-ts';
import _ from 'lodash';
import {
  CardRegionAbbreviation,
  DeckCard,
  getCardMainRegion,
  getCardType,
  LoRDeck,
  rarityRefToCardCost,
  RegionAbbreviation,
  regionRefToRegionAbbreviation,
} from '@gabrielgn-test/runeterra-tools';

export class DeckFormat {
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  constructor() {}

  public static deckMainRegionOrderedByCardQt(
    deck: LoRDeck,
  ): CardRegionAbbreviation[] {
    let regionRefsOrderedByCardQt: {
      faction: CardRegionAbbreviation;
      factionCardsQt: number;
    }[] = Object.keys(deck.factionCardsQt)
      .map((faction) => {
        return {
          faction: faction as unknown as CardRegionAbbreviation,
          factionCardsQt: deck.factionCardsQt[faction],
        };
      })
      .filter((refObj) => refObj.factionCardsQt > 0);
    regionRefsOrderedByCardQt = _.reverse(
      _.sortBy(regionRefsOrderedByCardQt, 'factionCardsQt'),
    );
    const factionIdentifiers: CardRegionAbbreviation[] =
      regionRefsOrderedByCardQt.map((refObj) => refObj.faction);

    if (
      // caso 'Runeterra' seja uma região e não esteja entre as duas primeiras, faz ela ser a segunda
      factionIdentifiers.includes(RegionAbbreviation.Runeterra) &&
      factionIdentifiers.indexOf(RegionAbbreviation.Runeterra) > 1
    ) {
      const swapArrayLoc = (arr, from, to) => {
        // mova itens de posição de u; array
        arr.splice(from, 1, arr.splice(to, 1, arr[from])[0]);
      };

      // move "Runeterra" para a segunda posição do array
      swapArrayLoc(
        factionIdentifiers,
        factionIdentifiers.indexOf(RegionAbbreviation.Runeterra),
        1,
      );
    }

    return factionIdentifiers;
  }

  public static cardArrayToLorDeck(cards: DeckCard[]): LoRDeck {
    const deck = {
      code: '',
      cards: {
        champions: [],
        followers: [],
        spells: [],
        landmarks: [],
        equipments: [],
      },
      cardCostQt: {
        // cria um objeto com chaves numéricas de 0-N de acordo com o numero dentro do argumento Array()
        // caso apareça alguma carta com custo 20+, alterar aqui
        ..._.transform(
          Array.from(Array(21).keys()),
          (result, n) => {
            result[n] = 0;
          },
          {},
        ),
      },
      mainFactions: [],
      factions: [],
      factionCardsQt: {
        ..._.transform(
          Object.entries(RegionAbbreviation).map((e) => e[1]),
          (result, n) => {
            result[n] = 0;
          },
          {},
        ),
      },
      essenceCost: 0,
    };
    cards.forEach((card) => {
      deck.cards[`${getCardType(card.card).toLowerCase()}s`].push(card);
      deck.cardCostQt[card.card.cost] += card.count;
      deck.essenceCost += rarityRefToCardCost(card.card.rarityRef) * card.count;
      card.card.regionRefs.forEach((regionRef) =>
        deck.factions.push(regionRefToRegionAbbreviation(regionRef)),
      );
      if (card.card.regionRefs.length === 1) {
        deck.mainFactions.push(
          regionRefToRegionAbbreviation(card.card.regionRefs[0]),
        );
      }
    });
    deck.factions = _.uniq(deck.factions);
    deck.mainFactions = _.uniq(deck.mainFactions);
    if (deck.mainFactions.length < 2 && deck.factions.length >= 2) {
      // caso tenha só uma região, verifica se pode ter outra
      deck.mainFactions.push(_.difference(deck.factions, deck.mainFactions)[0]);
    }

    // ordena as cartas por custo
    Object.keys(deck.cards).forEach((key) => {
      deck.cards[key] = _.sortBy(deck.cards[key], 'card.cost');
      deck.cards[key].forEach((card) => {
        deck.factionCardsQt[getCardMainRegion(card.card, deck.mainFactions)] +=
          card.count;
      });
    });

    deck.mainFactions = DeckFormat.deckMainRegionOrderedByCardQt(deck);
    deck['code'] = getCodeFromDeck(
      cards.map((card) => {
        return {
          cardCode: card.card.cardCode,
          count: card.count,
        } as CardCodeAndCount;
      }),
    );
    // abaixo remove todos os que não são alphanumericos
    deck.code = deck.code.replace(/[^a-z0-9]/gi, '');
    return deck as unknown as LoRDeck;
  }
}
