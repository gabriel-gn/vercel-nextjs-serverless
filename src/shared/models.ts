export interface Asset {
  gameAbsolutePath: string;
  fullAbsolutePath: string;
}

export interface Card {
  associatedCards: any[];
  associatedCardRefs: string[];
  assets: Asset[];
  regions: string[];
  regionRefs: string[];
  attack: number;
  cost: number;
  health: number;
  description: string;
  descriptionRaw: string;
  levelupDescription: string;
  levelupDescriptionRaw: string;
  flavorText: string;
  artistName: string;
  name: string;
  cardCode: string;
  keywords: string[];
  keywordRefs: string[];
  spellSpeed: string;
  spellSpeedRef: string;
  rarity: string;
  rarityRef: string;
  subtypes: any[];
  supertype: string;
  type: string;
  collectible: boolean;
  set: string;
}

export interface DeckCard {
  card: Card;
  count: number;
}

export enum FactionIdentifiers {
  DEMACIA = 'DE',
  FRELJORD = 'FR',
  IONIA = 'IO',
  NOXUS = 'NX',
  PILTOVERZAUN = 'PZ',
  SHADOWISLES = 'SI',
  BILGEWATER = 'BW',
  TARGON = 'MT',
  SHURIMA = 'SH',
  BANDLECITY = 'BC',
}

export enum FactionIdentifiersReverse {
  DE = 'DEMACIA',
  FR = 'FRELJORD',
  IO = 'IONIA',
  NX = 'NOXUS',
  PZ = 'PILTOVERZAUN',
  SI = 'SHADOWISLES',
  BW = 'BILGEWATER',
  MT = 'TARGON',
  SH = 'SHURIMA',
  BC = 'BANDLECITY',
}

export type Factions =  'DE' | 'FR' | 'IO' | 'NX' | 'PZ' | 'SI' | 'BW' | 'MT' | 'SH' | 'BC';

export enum FactionIdentifiersColors {
  DE = '191,176,131',
  FR = '90,184,218',
  IO = '207,130,155',
  NX = '160,82,79',
  PZ = '226,159,118',
  SI = '59,125,111',
  BW = '166,93,71',
  MT = '117,109,213',
  SH = '214,164,62',
  BC = '193,208,85',
}

export interface LoRDeck {
  code: string;
  cards: {
    champions: DeckCard[];
    followers: DeckCard[];
    spells: DeckCard[];
    landmarks: DeckCard[];
  };
  cardCostQt: {
    [cardCost: number]: number
  };
  mainFactions: FactionIdentifiers[];
  factions: FactionIdentifiers[];
  essenceCost: number;
  factionCardsQt: {[faction: string]: number};
}

export interface DeckStats {
  playRatePercent?: number;
  winRatePercent?: number;
  matchesQt?: number;
}

export interface UserDeck {
  title?: string;
  description?: string;
  badges?: {tier?: string};
  changedAt?: number;
  createdAt?: number;
  stats?: DeckStats;
  username: string;
  deck: LoRDeck;
}

export interface MobalyticsDeck {
  title: string;
  changedAt?: number;
  createdAt?: number;
  description?: string;
  uid: string;
  mode: string;
  exportUID: string;
  playStyle: string;
  owner: {
    uid: string;
    name: string;
    image: string;
  };
  isPrivate: boolean;
  isDraft: boolean;
  isRiot: boolean;
  rating?: number;
}

export interface MobalyticsMetaDeck {
  uid: string;
  title: string;
  coreCards: string[];
  tier: string;
  mostPopularDeck: MobalyticsDeck;
  whyToBuild: string;
  howToPlay: string;
  videoGuides: {
    url: string;
    placeholder: string;
  }[];
}

export interface UserDeckQueryResponse {
  decks: UserDeck[];
  hasNext: boolean;
}
