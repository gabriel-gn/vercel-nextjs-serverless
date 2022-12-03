import { CardCodeAndCount, getCodeFromDeck } from 'lor-deckcodes-ts';
import _ from 'lodash';
import {
  CARD_REGION_ABBREVIATION,
  CardRegionAbbreviation,
  DeckCard,
  getCardMainRegion,
  getCardMainRegionFromDeck,
  getCardType, getDeckMainRegions,
  LoRDeck,
  rarityRefToCardCost,
  regionRefToRegionAbbreviation
} from "@gabrielgn-test/runeterra-tools";

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
      factionIdentifiers.includes(CARD_REGION_ABBREVIATION.RUNETERRA) &&
      factionIdentifiers.indexOf(CARD_REGION_ABBREVIATION.RUNETERRA) > 1
    ) {
      const swapArrayLoc = (arr, from, to) => {
        // mova itens de posição de u; array
        arr.splice(from, 1, arr.splice(to, 1, arr[from])[0]);
      };

      // move "Runeterra" para a segunda posição do array
      swapArrayLoc(
        factionIdentifiers,
        factionIdentifiers.indexOf(CARD_REGION_ABBREVIATION.RUNETERRA),
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
          Object.entries(CARD_REGION_ABBREVIATION).map((e) => e[1]),
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
    });
    deck.factions = _.uniq(deck.factions);

    // ordena as cartas por custo
    Object.keys(deck.cards).forEach((key) => {
      deck.cards[key] = _.sortBy(deck.cards[key], 'card.cost');
      deck.cards[key].forEach((card) => {
        deck.factionCardsQt[getCardMainRegion(card.card, deck.mainFactions)] +=
          card.count;
      });
    });

    // deck.mainFactions = DeckFormat.deckMainRegionOrderedByCardQt(deck);
    try {
      deck['mainFactionCardsQt'] = getDeckMainRegions(deck);
      deck.mainFactions = Object.keys(deck['mainFactionCardsQt']);
    } catch (e) {
      cards = [];
    }

    deck['code'] = getCodeFromDeck(
      cards.map((card) => {
        return {
          cardCode: card?.card?.cardCode,
          count: card?.count,
        } as CardCodeAndCount;
      }),
    );
    // abaixo remove todos os que não são alphanumericos
    deck.code = deck.code.replace(/[^a-z0-9]/gi, '');
    return deck as unknown as LoRDeck;
  }
}
