import { Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import {
  catchError,
  concatMap,
  forkJoin,
  map, mergeMap,
  Observable,
  of,
  pluck,
  tap,
  throwError,
} from 'rxjs';
import {
  LorMasterMetaDeck,
  MobalyticsDeck,
  MobalyticsMetaDeck,
  RunescolaMetaDeck,
  UserDeckQueryResponse,
} from '../../shared/models';
import qs from 'qs';
import {getLoRDeck, getLoRDecks} from '../../shared/utils/deck-utils';
import {
  SearchDeckLibraryDto,
  SearchDeckLibraryRuneterraArDto,
} from './decks.dto';
import {orderBy, uniqBy, omit} from 'lodash';
import {
  lorMasterDecksToUserDecks,
  mobalyticsDecksToUserDecks,
  runescolaMetaDecksToUserDecks,
  runeterraARDecksToUserDecks,
} from '../../shared/utils/external-deck-converters';
import {
  DeckStats,
  generateDeckName, isValidDeckCode,
  LoRDeck,
  RiotLoRCard, UserDeck,
} from '@gabrielgn-test/runeterra-tools';
import {SocialMediaDecks, SocialMediaSource, YoutubeChannelInfo} from "./ytChannel.model";
import {PlaylistDeckItem, YoutubePlaylist, YoutubePlaylistSnippet} from "./ytPlaylist.model";

@Injectable()
export class HttpDecksService {
  // https://console.cloud.google.com/apis/api/youtube.googleapis.com/quotas?hl=pt-br&project=lordecks
  private readonly YOUTUBE_API_KEY: string = `${process.env.YOUTUBE_API_KEY}`;

  constructor(private http: HttpService) {}

  public getMetaDecksIndigo(): Observable<UserDeck[]> {
    return this.http
      .get('https://lor.mobalytics.gg/api/v2/meta/tier-list')
      .pipe(
        map((response) => response.data), // o http do axios da pau se não der .pipe(map(response => response.data))
        pluck('archetypes'),
        concatMap((metaDecks: MobalyticsMetaDeck[]) => {
          const mobalyticsDecks: MobalyticsDeck[] = metaDecks.map(
            (metaDeck) => {
              return {
                ...metaDeck.mostPopularDeck,
                ...{ title: metaDeck.title, description: metaDeck.whyToBuild },
              };
            },
          );
          const userDecks: Observable<UserDeck[]> = mobalyticsDecksToUserDecks(
            mobalyticsDecks,
          ).pipe(
            map((rawUserDecks: UserDeck[]) => {
              return rawUserDecks.map((rawUserDeck, index) => {
                return {
                  ...rawUserDeck,
                  ...{ badges: { tier: metaDecks[index].tier } },
                };
              }) as UserDeck[];
            }),
          );
          return userDecks;
        }),
        catchError((error) => throwError(error)),
      );
  }

  public getMetaDecksGranite(): Observable<UserDeck[]> {
    const url =
      'https://gist.githubusercontent.com/gabriel-gn/905a30e387ac90d4e6f897c504f85b86/raw/runeterraccg-meta.json';

    return this.http.get(url).pipe(
      map((response) => response.data),
      concatMap((decks: UserDeck[]) => {
        return getLoRDecks(decks.map((deck) => `${deck.deck}`)).pipe(
          map((lorDecks) => {
            return lorDecks.map((deck, i) => {
              return { ...decks[i], ...{ deck: lorDecks[i] } };
            });
          }),
        );
      }),
    ) as unknown as Observable<UserDeck[]>;
  }

  public getMetaDecksOpal(deckLimit = 15): Observable<UserDeck[]> {
    const url = 'https://lormaster.herokuapp.com/archetypes/all/7';

    return this.http.get(url).pipe(
      map((response) => response.data),
      map((data) => {
        let matches = orderBy(data.data, 'match_num', 'desc').slice(
          0,
          deckLimit,
        );
        matches = orderBy(matches, 'win_rate', 'desc');
        return matches;
      }),
      concatMap((lorMasterDecks: LorMasterMetaDeck[]) => {
        return lorMasterDecksToUserDecks(lorMasterDecks, true, true);
      }),
    ) as unknown as Observable<UserDeck[]>;
  }

  public getMetaDecksCitrine(getRelatedDecks = true): Observable<UserDeck[]> {
    const url =
      'https://runescola.com.br/runescolaCrawler/resource/meta/data.json';
    return this.http.get(url).pipe(
      map((response) => response.data),
      map((runescolaMetaData) => {
        let matches: RunescolaMetaDeck[] = orderBy(
          runescolaMetaData.stats.seven,
          'total_matches',
          'desc',
        ).slice(0, 15);
        matches = orderBy(matches, 'winrate', 'desc');
        runescolaMetaData.stats.seven = matches;
        return runescolaMetaData;
      }),
      concatMap((runescolaMetaData) => {
        const decks = runescolaMetaData.stats.seven;
        return runescolaMetaDecksToUserDecks(
          decks,
          getRelatedDecks,
          true,
          runescolaMetaData?.info?.last_update,
        );
      }),
    ) as unknown as Observable<UserDeck[]>;
  }

  public getDecksFromLibraryIndigo(
    searchObj: SearchDeckLibraryDto,
  ): Observable<UserDeckQueryResponse> {
    const url = 'https://lor.mobalytics.gg/api/v2/decks/library';
    const defaultParams = {
      sortBy: 'recently_updated',
      from: 0,
      count: 20,
      withUserCards: false,
    };
    const addedParams = {};
    for (const key of Object.keys(searchObj)) {
      switch (key) {
        case 'category':
          addedParams['category'] = searchObj.category;
          break;
        case 'searchTerm':
          addedParams['searchTerm'] = searchObj.searchTerm;
          break;
        case 'factions':
          addedParams['region'] = searchObj.factions;
          break;
        case 'playStyle':
          addedParams['playStyle'] = searchObj.playStyle;
          break;
        case 'count':
          addedParams['count'] = searchObj.count;
          break;
        case 'cardIds':
          addedParams['cardID'] = searchObj.cardIds;
          break;
        case 'keywords':
          addedParams['keyword'] = searchObj.cardIds;
          break;
        case 'from':
          addedParams['from'] = searchObj.from;
          break;
      }
    }
    return this.http
      .get(url, {
        params: { ...defaultParams, ...addedParams },
        paramsSerializer: {
          indexes: null, // by default: false
        },
      })
      .pipe(
        map((response) => response.data), // o http do axios da pau se não der .pipe(map(response => response.data))
        concatMap((response: any) => {
          return of(response).pipe(
            pluck('decks'),
            concatMap((mobalyticsDecks: MobalyticsDeck[]) => {
              return mobalyticsDecksToUserDecks(mobalyticsDecks);
            }),
            map((userDecks) => {
              return {
                decks: userDecks,
                hasNext: response.hasNext,
              };
            }),
          );
        }),
        catchError((error) => throwError(error)),
      );
  }

  public getDecksFromLibraryCarbon(
    searchObj: SearchDeckLibraryRuneterraArDto,
  ): Observable<UserDeckQueryResponse> {
    const numberOfDecksToGet = 18; // retirado da chamada oficial do site
    const url = 'https://runeterra.ar/api/deck/getdecks';
    const defaultParams = {
      take: numberOfDecksToGet,
      game: "lor"
      // server: 'everyone',
    };

    // caso tenha page, verifica se é um numero e adiciona
    if (searchObj?.page) {
      if (!isNaN(+searchObj.page) && +searchObj.page > 1) {
        defaultParams['page'] = +searchObj.page;
      }
    }

    const payload: {
      region?: { region: string; regionRef: string }[];
      champ?: { name: string; cardCode: string }[];
      searches?: any[];
    } = {};

    // traduz as abreviações de regiões para o formato que o runeterraAR aceita
    if (searchObj?.factions && Array.isArray(searchObj.factions)) {
      let regions = [];
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      const globalsRegions = require(`../../assets/globals/en_us.json`).regions;
      for (const searchRegion of searchObj.factions) {
        const globalRegion = globalsRegions.find(
          (rg) => rg?.abbreviation === `${searchRegion}`.toUpperCase(),
        );
        if (globalRegion) {
          regions.push({
            region: globalRegion.name,
            regionRef: globalRegion.nameRef,
          });
        }
      }
      regions = uniqBy(regions, 'region');
      payload['region'] = regions;
    }

    // traduz os cardIds o formato de APENAS CHAMPS que o runeterraAR aceita
    if (searchObj?.cardIds && Array.isArray(searchObj.cardIds)) {
      let champObjects = [];
      let cardObjects = [];
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      const cards: RiotLoRCard[] = require(`../../assets/sets/en_us/en_us.json`);
      for (const cardId of searchObj.cardIds) {
        const card = cards.find((cd) => cd?.cardCode === `${cardId}`);
        if (card && card?.rarityRef === 'Champion') {
          champObjects.push({
            name: card.name,
            cardcode: card.cardCode,
          });
        } else {
          cardObjects.push({
            gameName: null,
            name: card.name,
            picture: null,
            route: `cards/${card.cardCode}`,
            order: 0,
            vip: false,
            creator: false,
            region: card.regionRefs[0],
            type: 'card',
            code: card.cardCode,
            server: null,
            country: null,
            privacy: false,
          });
        }
      }
      champObjects = uniqBy(champObjects, 'name');
      cardObjects = uniqBy(cardObjects, 'name');
      if (champObjects.length > 0) {
        payload['champ'] = champObjects;
      }
      if (cardObjects.length > 0) {
        payload['searches'] = cardObjects;
      }
    }

    return this.http
      .post(url, payload, {
        params: defaultParams,
        paramsSerializer: {
          indexes: null, // by default: false
        },
      })
      .pipe(
        map((response) => response.data), // o http do axios da pau se não der .pipe(map(response => response.data))
        concatMap((response) => {
          return runeterraARDecksToUserDecks(response.decks).pipe(
            map((userDecks) => {
              return {
                decks: userDecks,
                hasNext: response.count === numberOfDecksToGet,
              };
            }),
          ) as Observable<UserDeckQueryResponse>;
        }),
      );
  }

  public getTrendingDecksCarbon(): Observable<UserDeck[]> {
    const url = 'https://runeterra.ar/api/meta/get/everyone/en_us';
    const defaultPayload = {
      region: [],
      champ: [],
    };
    const defaultParams = {
      take: 5,
      type: 'two',
      filter: true,
    };
    const paramsStandard = {
      ...defaultParams,
      format: 'client_Formats_Standard_name',
    };
    const paramsEternal = {
      ...defaultParams,
      format: 'client_Formats_Eternal_name',
    };

    const getDeckStats: (metaDeck: any) => DeckStats = (metaDeck: any) => {
      return {
        deckCode: metaDeck.deck_code,
        playRatePercent: metaDeck.pr,
        winRatePercent: metaDeck.wr,
        matchesQt: metaDeck.count,
      };
    };

    const request1 = this.http
      .post(url, defaultPayload, { params: paramsStandard })
      .pipe(map((response) => response.data));

    const request2 = this.http
      .post(url, defaultPayload, {
        params: { ...paramsStandard, ...{ page: 2 } },
      })
      .pipe(map((response) => response.data));
    const request3 = this.http
      .post(url, defaultPayload, { params: paramsEternal })
      .pipe(map((response) => response.data));

    const request4 = this.http
      .post(url, defaultPayload, {
        params: { ...paramsEternal, ...{ page: 2 } },
      })
      .pipe(map((response) => response.data));
    return forkJoin([request1, request2, request3, request4]).pipe(
      map((response) => {
        const deckStats = [
          ...response[0].meta.map((metaDeck) => getDeckStats(metaDeck)),
          ...response[1].meta.map((metaDeck) => getDeckStats(metaDeck)),
          ...response[2].meta.map((metaDeck) => getDeckStats(metaDeck)),
          ...response[3].meta.map((metaDeck) => getDeckStats(metaDeck)),
        ];
        return {
          codes: deckStats.map((d) => d.deckCode),
          stats: deckStats.map((d) => {
            return omit(d, 'deckCode');
          }),
        };
      }),
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      concatMap((deckStats: { codes: string[]; stats: DeckStats[] }) => {
        return forkJoin([getLoRDecks(deckStats.codes), of(deckStats.stats)]);
      }),
      map((deckStats: [LoRDeck[], DeckStats[]]) => {
        const resultDecks = deckStats[0].map((deck, index) => {
          return {
            deck: deck,
            title: generateDeckName(deck),
            description: '',
            username: '',
            stats: deckStats[1][index],
          };
        });
        return orderBy(resultDecks, 'stats.matchesQt', 'desc') as any[];
      }),
      catchError((error) => throwError(error)),
    );
  }

  public getTrendingDecksCitrine(
    getRelatedDecks = true,
  ): Observable<UserDeck[]> {
    const url =
      'https://runescola.com.br/runescolaCrawler/resource/meta/data.json';
    return this.http.get(url).pipe(
      map((response) => response.data),
      concatMap((runescolaMetaData) => {
        const decks = runescolaMetaData.stats.three.slice(0, 15);
        return runescolaMetaDecksToUserDecks(
          decks,
          getRelatedDecks,
          false,
          runescolaMetaData?.info?.last_update,
        );
      }),
    ) as unknown as Observable<UserDeck[]>;
  }

  public getLowPlayRateHighWinrateOpal(deckLimit = 15, relatedDecks = true) {
    const url = 'https://lormaster.herokuapp.com/archetypes/all';

    return this.http.get(url).pipe(
      map((response) => response.data),
      map((data) => {
        let matches = orderBy(data.data, 'win_rate', 'desc')
          .filter((matchStats) => matchStats.match_num < 300)
          .slice(0, deckLimit);
        matches = orderBy(matches, 'win_rate', 'desc');
        return matches;
      }),
      concatMap((lorMasterDecks: LorMasterMetaDeck[]) => {
        return lorMasterDecksToUserDecks(lorMasterDecks, relatedDecks);
      }),
    ) as unknown as Observable<UserDeck[]>;
  }

  public getLowPlayRateHighWinrateCitrine(deckLimit = 15, relatedDecks = true) {
    const url =
      'https://runescola.com.br/runescolaCrawler/resource/meta/data.json';
    return this.http.get(url).pipe(
      map((response) => response.data),
      map((runescolaMetaData) => {
        let matches: RunescolaMetaDeck[] = orderBy(
          runescolaMetaData.stats.patch,
          ['total_matches'],
          ['asc'],
        )
          .filter((matchStats) => matchStats.winrate > 50)
          .slice(0, deckLimit);
        matches = orderBy(matches, ['winrate'], ['desc']);
        runescolaMetaData.stats.patch = matches;
        return runescolaMetaData;
      }),
      concatMap((runescolaMetaData) => {
        const decks = runescolaMetaData.stats.patch;
        return runescolaMetaDecksToUserDecks(
          decks,
          relatedDecks,
          false,
          runescolaMetaData?.info?.last_update,
        );
      }),
    ) as unknown as Observable<UserDeck[]>;
  }

  public getYoutubeCreators(): Observable<YoutubeChannelInfo[]> {
    const influencersYoutubeIds: {[influencerUsername: string]: string} = {
      Snnuy: 'UCrMr5Wc0Cn5AGINmUEquzdA',
      GrappLr: 'UCq5ZYJax8VC580PAIU5xuvg',
      MegaMogwai: 'UCvUZXLShMx-FZvoadtb8xBQ',
      MajiinBae: 'UCPWvMRZq__Q-LaCNui9budg',
      TheLegendXXVII: 'UC9Zv4qekqeWZVYJl7mnRUzg',
      LGamesBr: 'UCQ7Ib0ngICjF2nGWlS6XIPA',
      otaofruneterra: 'UCCM8l6dytm8uqASH0gijbZQ',
      LuckyCAD: 'UCa4tK4ry575cuJzayeaxmSQ',
    };

    return of('').pipe(
      // busca os dados de canais do youtube
      concatMap(() => {
        return this.http.get(
          `https://www.googleapis.com/youtube/v3/channels`,
          {
            params: {
              id: Object.values(influencersYoutubeIds).join(','),
              part: 'snippet,contentDetails',
              key: this.YOUTUBE_API_KEY
            }
          }
        ).pipe(map(r => r.data))
      }),
      map(response => response.items)
    );
  }

  public getYoutubePlaylistDecks(playlistId: string): Observable<UserDeck[]> {
    const getDeckcodeFromDescription: (desc: string) => string = (desc: string) => {
      let descItems: string[] = desc.split(/[^a-zA-Z0-9']/);
      return descItems.find(i => isValidDeckCode(i));
    }

    return of('').pipe(
      concatMap(() => {
        return this.http.get(
          `https://www.googleapis.com/youtube/v3/playlistItems`,
          {
            params: {
              playlistId: playlistId,
              maxResults: 20,
              part: 'snippet,contentDetails',
              key: this.YOUTUBE_API_KEY,
            }
          }
        ).pipe(map(r => r.data))
      }),
      map((playlist: YoutubePlaylist) => {
        const deckCodes: string[] = playlist.items.map(i => getDeckcodeFromDescription(i.snippet.description));
        let uploads: YoutubePlaylistSnippet[] = playlist.items.map(i => i.snippet);
        deckCodes.forEach((code, index) => {
          if (!code) {
            uploads[index] = null; // faz o upload ser invalido se não tiver um código de deck
          } else {
            uploads[index]['deckCode'] = code;
          }
        })
        uploads = uploads.filter(u => !!u);
        return uploads
      }),
      concatMap((uploads: any[]) => {
        const lorDecks: Observable<LoRDeck[]> = getLoRDecks(uploads.map(u => u['deckCode']));
        return lorDecks.pipe(
          map((decks: LoRDeck[]) => {
            return decks.map((d, i) => {
              return {...uploads[i], deck: d} as PlaylistDeckItem;
            })
          })
        ) as Observable<PlaylistDeckItem[]>
      }),
      map((playlistItems: PlaylistDeckItem[]) => {
        return playlistItems.map((item: PlaylistDeckItem) => {
          return {
            title: item.title,
            deck: item.deck,
            createdAt: new Date(item.publishedAt).getTime(),
            changedAt: new Date(item.publishedAt).getTime(),
            thumbnail: item.thumbnails.maxres.url
          } as UserDeck;
        })
      })
    );
  }

  public getYoutubeInfluencersDecks(): Observable<any[]> {
    let influencerChannels: YoutubeChannelInfo[] = [];

    return of('').pipe(
      concatMap(() => this.getYoutubeCreators()),
      // guarda em variável a resposta dos itens pertinentes
      tap((response) => {
        influencerChannels = response;
      }),
      // retorna dados das playlists de upload de cada canal
      concatMap((ytChannels) => {
        const channelUploads: Observable<UserDeck[]>[] = ytChannels.map(c => {
          return this.getYoutubePlaylistDecks(c.contentDetails.relatedPlaylists.uploads);
        });
        return forkJoin(channelUploads);
      }),
      // formata o objeto de resposta final
      map((playlistsInfos: UserDeck[][]) => {
        return influencerChannels.map((c, index) => {
          const sourceEntry = {
            title: `${c.snippet.title}`,
            thumbnail: `${c.snippet.thumbnails.high.url}`,
            origin: 'youtube',
          }
          return {
            source: sourceEntry,
            uploads: playlistsInfos[index],
          }
        })
      }),
      // formata para retornar o objeto final
      map((auxEntry: {source: SocialMediaSource, uploads: UserDeck[]}[]) => {
        return auxEntry.map((entry, entryIndex) => {
          const userDecks: UserDeck[] = entry.uploads.map((entryUpload: UserDeck) => {
              return {
                ...entryUpload,
                username: entry.source.title,
              } as UserDeck;
          });
          return {
            source: entry.source,
            decks: userDecks
          } as SocialMediaDecks
        })
      }),
    )
  }
}
