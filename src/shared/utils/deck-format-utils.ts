import {
  Card,
  DeckCard,
  FactionIdentifiers,
  FactionIdentifiersColors,
  FactionIdentifiersReverse, Factions,
  LoRDeck
} from "../models";
import {
  getCodeFromDeck,
  CardCodeAndCount,
} from "lor-deckcodes-ts";
import _, { indexOf } from "lodash";

export class DeckFormat {
  constructor() {
  }

  public static deckMainRegionRefsOrderedByCardQt(deck: LoRDeck): FactionIdentifiers[] {
    let regionRefsOrderedByCardQt: { factionRef: Factions, factionCardsQt: number }[] = Object.keys(deck.factionCardsQt)
      .map(factionRef => {
        return {
          factionRef: factionRef as unknown as Factions,
          factionCardsQt: deck.factionCardsQt[factionRef],
        };
      })
      .filter(refObj => refObj.factionCardsQt > 0);
    regionRefsOrderedByCardQt = _.reverse(_.sortBy(regionRefsOrderedByCardQt, "factionCardsQt"));
    let factionIdentifiers: FactionIdentifiers[] = regionRefsOrderedByCardQt.map(refObj => refObj.factionRef);

    if ( // caso 'Runeterra' seja uma região e não esteja entre as duas primeiras, faz ela ser a segunda
      factionIdentifiers.includes(FactionIdentifiers.RUNETERRA)
      && factionIdentifiers.indexOf(FactionIdentifiers.RUNETERRA) > 1
    ) {
      const swapArrayLoc = (arr, from, to) => { // mova itens de posição de u; array
        arr.splice(from, 1, arr.splice(to, 1, arr[from])[0])
      };

      // move "Runeterra" para a segunda posição do array
      swapArrayLoc(factionIdentifiers, factionIdentifiers.indexOf(FactionIdentifiers.RUNETERRA), 1);
    }

    return factionIdentifiers;
  }

  public static regionRefToFactionIdentifier(regionRef: string): FactionIdentifiers | "" {
    try {
      return FactionIdentifiers[regionRef.toUpperCase()];
    } catch (e) {
      return "";
    }
  }

  public static rarityRefToCost(rarityRef: string): number {
    switch (rarityRef.toUpperCase()) {
      case "CHAMPION":
        return 3000;
        break;
      case "EPIC":
        return 1200;
        break;
      case "RARE":
        return 300;
        break;
      case "COMMON":
        return 100;
        break;
      default:
        return 0;
        break;
    }
  }

  public static getFactionColor(faction: FactionIdentifiers | string, type: "rgb" | "hex" = "rgb"): string | number[] {
    const componentToHex = (c) => {
      const hex = c.toString(16);
      return hex.length === 1 ? "0" + hex : hex;
    };

    const rgbToHex = (r, g, b) => {
      return "#" + componentToHex(r) + componentToHex(g) + componentToHex(b);
    };

    const colorRgb = FactionIdentifiersColors[faction].split(",").map(Number);
    if (type === "rgb") {
      return colorRgb;
    } else {
      // @ts-ignore
      return rgbToHex(...colorRgb);
    }
  }

  public static getCardRegionRef(card: Card): FactionIdentifiersReverse {
    return FactionIdentifiersReverse[card.cardCode.substring(2, 4)];
  }

  public static getCardMainRegionRef(card: Card, regionRefs: string[]): string {
    const mainRegionRef = DeckFormat.regionRefToFactionIdentifier(DeckFormat.getCardRegionRef(card));
    if (regionRefs.includes(mainRegionRef)) {
      return mainRegionRef;
    } else {
      const regionRefsForCard = _.intersection(
        regionRefs,
        card.regionRefs.map(ref => DeckFormat.regionRefToFactionIdentifier(ref))
      );
      return regionRefsForCard[0];
    }
  }

  public static cardArrayToLorDeck(cards: DeckCard[]): LoRDeck {
    const deck = {
      code: '',
      cards: {
        champions: [],
        followers: [],
        spells: [],
        landmarks: []
      },
      cardCostQt: {
        // cria um objeto com chaves numéricas de 0-N de acordo com o numero dentro do argumento Array()
        // caso apareça alguma carta com custo 20+, alterar aqui
        ..._.transform(Array.from(Array(21).keys()), (result, n) => {
          result[n] = 0;
        }, {})
      },
      mainFactions: [],
      factions: [],
      factionCardsQt: {
        ..._.transform(Object.values(FactionIdentifiers), (result, n) => {
          result[n] = 0;
        }, {})
      },
      essenceCost: 0
    };
    cards.forEach(card => {
      const keywordRefs = card.card.keywordRefs;
      if (!!card.card.spellSpeedRef) {
        deck.cards.spells.push(card);
      } else if (keywordRefs && keywordRefs.length> 0 && keywordRefs.includes('LandmarkVisualOnly')) {
        deck.cards.landmarks.push(card);
      } else if (card.card.rarityRef === 'Champion') {
        deck.cards.champions.push(card);
      } else {
        deck.cards.followers.push(card);
      }
      deck.cardCostQt[card.card.cost] += card.count;
      deck.essenceCost += DeckFormat.rarityRefToCost(card.card.rarityRef) * card.count;
      card.card.regionRefs.forEach(regionRef => deck.factions.push(DeckFormat.regionRefToFactionIdentifier(regionRef)));
      if (card.card.regionRefs.length === 1) {
        deck.mainFactions.push(DeckFormat.regionRefToFactionIdentifier(card.card.regionRefs[0]));
      }
    });
    deck.factions = _.uniq(deck.factions);
    deck.mainFactions = _.uniq(deck.mainFactions);
    if (deck.mainFactions.length < 2 && deck.factions.length >= 2) { // caso tenha só uma região, verifica se pode ter outra
      deck.mainFactions.push(_.difference(deck.factions, deck.mainFactions)[0]);
    }

    // ordena as cartas por custo
    Object.keys(deck.cards).forEach(key => {
      deck.cards[key] = _.sortBy(deck.cards[key], "card.cost");
      deck.cards[key].forEach(card => {
        deck.factionCardsQt[DeckFormat.getCardMainRegionRef(card.card, deck.mainFactions)] += card.count;
      });
    });

    deck.mainFactions = DeckFormat.deckMainRegionRefsOrderedByCardQt(deck);
    deck["code"] = getCodeFromDeck(cards.map(card => {
      return { cardCode: card.card.cardCode, count: card.count } as CardCodeAndCount;
    }));
    // abaixo remove todos os que não são alphanumericos
    deck.code = deck.code.replace(/[^a-z0-9]/gi, '');
    return deck as LoRDeck;
  }
}
