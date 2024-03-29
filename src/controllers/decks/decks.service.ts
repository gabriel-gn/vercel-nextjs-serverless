import { Injectable } from '@nestjs/common';
import { HttpDecksService } from './http-decks.service';
import { Observable } from 'rxjs';
import { UserDeckQueryResponse } from '../../shared/models';
import { getLoRDeck } from '../../shared/utils/deck-utils';
import {
  SearchDeckLibraryDto,
  SearchDeckLibraryRuneterraArDto,
} from './decks.dto';
import { LoRDeck, UserDeck } from '@gabrielgn-test/runeterra-tools';

@Injectable()
export class DecksService {
  constructor(private http: HttpDecksService) {}

  public getLoRDeck(deckCode: string): Observable<LoRDeck> {
    return getLoRDeck(deckCode);
  }

  public getMetaDecksIndigo(): Observable<UserDeck[]> {
    return this.http.getMetaDecksIndigo();
  }

  public getMetaDecksGranite(): Observable<UserDeck[]> {
    return this.http.getMetaDecksGranite();
  }

  public getMetaDecksOpal(): Observable<UserDeck[]> {
    return this.http.getMetaDecksOpal();
  }

  public getMetaDecksCitrine(): Observable<UserDeck[]> {
    return this.http.getMetaDecksCitrine();
  }

  public getTrendingDecksCarbon(): Observable<UserDeck[]> {
    return this.http.getTrendingDecksCarbon();
  }

  public getTrendingDecksCitrine(
    getRelatedDecks = true,
  ): Observable<UserDeck[]> {
    return this.http.getTrendingDecksCitrine(getRelatedDecks);
  }

  public getDecksFromLibraryIndigo(
    searchObj: SearchDeckLibraryDto,
  ): Observable<UserDeckQueryResponse> {
    return this.http.getDecksFromLibraryIndigo(searchObj);
  }

  public getDecksFromLibraryCarbon(
    searchObj: SearchDeckLibraryRuneterraArDto,
  ): Observable<UserDeckQueryResponse> {
    return this.http.getDecksFromLibraryCarbon(searchObj);
  }

  public getHiddenGemsDecksOpal(
    limit = 15,
    relatedDecks = true,
  ): Observable<UserDeck[]> {
    return this.http.getLowPlayRateHighWinrateOpal(limit, relatedDecks);
  }

  public getHiddenGemsDecksCitrine(
    limit = 15,
    relatedDecks = true,
  ): Observable<UserDeck[]> {
    return this.http.getLowPlayRateHighWinrateCitrine(limit, relatedDecks);
  }

  public getSocialMediaCreators(): Observable<any> {
    return this.http.getYoutubeCreators();
  }

  public getYoutubePlaylistDecks(playlistId: string): Observable<any> {
    return this.http.getYoutubePlaylistDecks(playlistId);
  }

  public getSocialMediaDecks(): Observable<any> {
    return this.http.getYoutubeInfluencersDecks();
  }
}
