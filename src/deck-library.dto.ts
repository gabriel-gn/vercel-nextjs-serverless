import { Factions } from "./models";

export class SearchDeckLibraryDto {
  factions?: Factions[];
  category: 'BUDGET' | 'FEATURED' | 'COMMUNITY';
  playStyle?: 'AGGRO' | 'COMBO' | 'CONTROL' | 'MIDRANGE';
  count?: number;
  cardIds?: string[];
  keywords?: string[];
}
