import {RiotLoRCard, UserDeck} from '@gabrielgn-test/runeterra-tools';

export interface DeckCard {
  card: RiotLoRCard;
  count: number;
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

export interface RuneterraArLibraryDeck {
  id: number;
  uid: string;
  gameName: string;
  picture: string;
  verified: boolean;
  country: string;
  date: Date;
  deck_code: string;
  deck_name: string;
  region: {
    region?: any;
    regionRef: string;
  }[];
  champs: {
    cardcode: string;
    count: number;
    name?: any;
  }[];
  privacy: boolean;
  vip: boolean;
  creator: boolean;
  server: string;
  count: number;
  champions: {
    cardcode: string;
    count: number;
    name?: any;
  }[];
  spells: {
    cardcode: string;
    count: number;
    name?: any;
  }[];
  landmarks: {
    cardcode: string;
    count: number;
    name?: any;
  }[];
  units: {
    cardcode: string;
    count: number;
    name?: any;
  }[];
  region_count: {
    region?: any;
    regionRef: string;
    count: number;
  }[];
  like: boolean;
  like_count: number;
  wr?: any;
  matches?: any;
  users?: any;
  aid: string;
  pr?: any;
  players?: any;
  rank?: any;
  lp?: any;
  engagements_count: number;
  shared_count: number;
  exports_count: number;
}

export interface RunescolaMetaDeck {
  archetype: string;
  assets: any;
  total_matches: number;
  playrate: number;
  winrate: number;
  best_decks: string[];
}

export interface LorMasterMetaDeck {
  _id: string;
  decks: {
    deck_code: string;
    play_num: number;
    play_rate: number;
    win_rate: number;
  }[];
  match_num: number;
  play_num: number;
  play_rate: number;
  players: {
    _id: string;
    count: number;
    deck_code: string;
    riot_id: string;
    server: string;
    win_num: number;
    win_rate: number;
  }[];
  win_num: number;
  win_rate: number;
}

export interface UserDeckQueryResponse {
  decks: UserDeck[];
  hasNext: boolean;
}
