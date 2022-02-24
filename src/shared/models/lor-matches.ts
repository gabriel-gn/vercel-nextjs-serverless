export interface LoRMatchMetadata {
  data_version: string;
  match_id: string;
  participants: string[];
}

export interface LoRMatchPlayer {
  puuid: string;
  deck_id: string;
  deck_code: string;
  factions: string[];
  game_outcome: string;
  order_of_play: number;
}

export interface LoRMatchInfo {
  game_mode: string;
  game_type: string;
  game_start_time_utc: Date;
  game_version: string;
  players: LoRMatchPlayer[];
  total_turn_count: number;
}

export interface LoRMatch {
  metadata: LoRMatchMetadata;
  info: LoRMatchInfo;
}
