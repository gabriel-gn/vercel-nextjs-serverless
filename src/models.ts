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
