import { Factions } from "../../shared/models";
import { ApiProperty } from "@nestjs/swagger";

export class SearchDeckLibraryDto {
  @ApiProperty({
    required: true,
    enum: ['BUDGET', 'FEATURED', 'COMMUNITY']
  })
  category: 'BUDGET' | 'FEATURED' | 'COMMUNITY';

  @ApiProperty({
    required: false
  })
  searchTerm?: string;

  @ApiProperty({
    required: false,
    enum: ['DE', 'FR', 'IO', 'NX', 'PZ', 'SI', 'BW', 'MT', 'SH', 'BC'],
    enumName: 'Factions',
    isArray: true
  })
  factions?: Factions[];

  @ApiProperty({
    required: false,
    enum: ['AGGRO', 'COMBO', 'CONTROL', 'MIDRANGE']
  })
  playStyle?: 'AGGRO' | 'COMBO' | 'CONTROL' | 'MIDRANGE';

  @ApiProperty({
    required: false
  })
  count?: number;

  @ApiProperty({
    required: false
  })
  cardIds?: string[];

  @ApiProperty({
    required: false
  })
  keywords?: string[];

  @ApiProperty({
    required: false
  })
  from?: number;
}
