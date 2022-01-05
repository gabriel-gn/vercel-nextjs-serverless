import { Factions } from "./models";

export class SearchDeckLibraryDto {
  category: 'BUDGET' | 'FEATURED' | 'COMMUNITY';
  searchTerm?: string;
  factions?: Factions[];
  playStyle?: 'AGGRO' | 'COMBO' | 'CONTROL' | 'MIDRANGE';
  count?: number;
  cardIds?: string[];
  keywords?: string[];
  from?: number;
}
