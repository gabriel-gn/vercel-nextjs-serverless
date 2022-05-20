import { Injectable } from '@nestjs/common';
import { HttpDecksService } from './http-decks.service';
import { Observable } from 'rxjs';
import { LoRDeck, UserDeck, UserDeckQueryResponse } from '../../shared/models';
import { getLoRDeck } from '../../shared/utils/deck-utils';
import { SearchDeckLibraryDto, SearchDeckLibraryRuneterraArDto } from "./decks.dto";

@Injectable()
export class DecksService {
  constructor(private http: HttpDecksService) {}

  public getLoRDeck(deckCode: string): Observable<LoRDeck> {
    return getLoRDeck(deckCode);
  }

  public getMetaDecks(): Observable<UserDeck[]> {
    return this.http.getMetaDecks();
  }

  public getTrendingDecks(): Observable<UserDeck[]> {
    return this.http.getTrendingDecks();
  }

  public getTrendingDecksRunescola(getRelatedDecks: boolean = true): Observable<UserDeck[]> {
    return this.http.getTrendingDecksRunescola(getRelatedDecks);
  }

  public getDecksFromLibrary(searchObj: SearchDeckLibraryDto): Observable<UserDeckQueryResponse> {
    return this.http.getDecksFromLibrary(searchObj);
  }

  public getDecksFromLibraryRuneterraAR(searchObj: SearchDeckLibraryRuneterraArDto): Observable<UserDeckQueryResponse> {
    return this.http.getDecksFromLibraryRuneterraAR(searchObj);
  }
}
