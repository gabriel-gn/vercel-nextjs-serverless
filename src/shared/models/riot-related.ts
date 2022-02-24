export type LoRRegions = 'AMERICAS' | 'EUROPE' | 'ASIA' | 'ESPORTS';

export enum RiotLoRAPIEndpoints {
  AMERICAS = `https://americas.api.riotgames.com`,
  EUROPE = `https://americas.api.riotgames.com`,
  ASIA = `https://americas.api.riotgames.com`,
  ESPORTS = `https://americas.api.riotgames.com`,
}

export interface RiotID {
  puuid: string;
  gameName: string;
  tagLine: string;
  LoRRegion: LoRRegions; // não originário da API da RIOT
}
