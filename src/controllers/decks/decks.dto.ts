import { Factions } from '../../shared/models';
import { ApiProperty } from '@nestjs/swagger';

export type SearchDeckLibraryCategory = 'BUDGET' | 'FEATURED' | 'COMMUNITY';
export type SearchDeckLibraryPlaystyle = 'AGGRO' | 'COMBO' | 'CONTROL' | 'MIDRANGE';

export class SearchDeckLibraryDto {
  @ApiProperty({
    required: true,
    enum: ['BUDGET', 'FEATURED', 'COMMUNITY'],
  })
  category: SearchDeckLibraryCategory;

  @ApiProperty({
    required: false,
  })
  searchTerm?: string;

  @ApiProperty({
    required: false,
    enum: ['DE', 'FR', 'IO', 'NX', 'PZ', 'SI', 'BW', 'MT', 'SH', 'BC', 'RU'],
    enumName: 'Factions',
    isArray: true,
  })
  factions?: Factions[];

  @ApiProperty({
    required: false,
    enum: ['AGGRO', 'COMBO', 'CONTROL', 'MIDRANGE'],
  })
  playStyle?: SearchDeckLibraryPlaystyle;

  @ApiProperty({
    required: false,
  })
  count?: number;

  @ApiProperty({
    required: false,
  })
  cardIds?: string[];

  @ApiProperty({
    required: false,
  })
  keywords?: string[];

  @ApiProperty({
    required: false,
  })
  from?: number;
}

export class SearchDeckLibraryRuneterraArDto {
  @ApiProperty({
    required: false,
  })
  page?: number;

  @ApiProperty({
    required: false,
    enum: ['DE', 'FR', 'IO', 'NX', 'PZ', 'SI', 'BW', 'MT', 'SH', 'BC', 'RU'],
    enumName: 'Factions',
    isArray: true,
  })
  factions?: Factions[];

  @ApiProperty({
    required: false,
  })
  cardIds?: string[]; // funciona apenas para campeões!!!
}
