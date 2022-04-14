import { Injectable } from '@nestjs/common';
import { HttpMatchesService } from './http-matches.service';
import { concatMap, forkJoin, map, Observable, tap, of } from 'rxjs';
import { LoRServerRegion, RiotID } from '../../shared/models/riot-related';
import { LoRMatch } from '../../shared/models/lor-matches';
import { getLoRDecks } from '../../shared/utils/deck-utils';
import { LoRDeck } from '../../shared/models';

@Injectable()
export class RiotAssetsService {
  constructor() {}

  public get(): Observable<any> {
    return of('riot assets');
  }
}
