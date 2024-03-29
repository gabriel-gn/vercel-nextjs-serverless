import { Injectable } from '@nestjs/common';
import { Observable, of } from 'rxjs';

@Injectable()
export class ServerInfoService {
  constructor() {}

  public get(): Observable<any> {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    return of({
      version: require(`../../../package.json`).version,
    });
  }

  /**
   * Retorna as configurações e dados do app Lor Deck Finder (Lor Decks) para a última versão
   */
  public getLorDecksInfo(): Observable<any> {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    return of({
      latestVersion: '2.6.0',
      cardTilesSource: 'diamond',
      cardImageSource: 'indigo',
      cardFullArtSource: 'sapphire',
      featureFlags: {
        'decksLibrary': true,
        'decksMeta': true,
        'decksTrending': true,
        'decksFavorites': true,
        'decksLowPlayrateHighWinrate': true,
        'decksSocialMedia': true,
        'cardLibrary': true,
        'playerProfile': false,
        'newsRiotOfficial': true,
        'tpocModifiers': true,
        'tpocChampionBuilds': true,
        'cardCreator': false,
      }
    });
  }
}
