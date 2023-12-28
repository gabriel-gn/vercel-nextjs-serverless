export type LoRServerRegion = 'americas' | 'europe' | 'sea';
export const LoRServerRegionQuery = ['americas', 'europe', 'sea'];

export enum RiotLoRAPIEndpoints {
  AMERICAS = `https://americas.api.riotgames.com`,
  EUROPE = `https://europe.api.riotgames.com`,
  SEA = `https://asia.api.riotgames.com`,
}

export interface RiotID {
  puuid: string;
  gameName: string;
  tagLine: string;
  activeShard: LoRServerRegion;
}
