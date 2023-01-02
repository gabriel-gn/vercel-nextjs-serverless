export interface MatchupArchetype {
  championCodes: string[];
  regions: string[];
}

export interface LoRMatchup {
  playerDeck: MatchupArchetype;
  opponentDeck: MatchupArchetype;
  muWin: number;
  muGames: number;
  muWR: number;
  okCI: boolean;
  CI: string;
  mirror: boolean;
  playrate: number;
  opponentPR: number;
  positiveWR: boolean;
  ciRange: number;
}
