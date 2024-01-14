import { Injectable } from '@nestjs/common';
import { map, Observable, of } from 'rxjs';
import { HttpService } from '@nestjs/axios';

@Injectable()
export class NewsService {
  constructor(private readonly http: HttpService) {}

  public get(): Observable<any> {
    const lang = global?.lang.includes('pt') ? 'pt-br' : 'en-us';
    return this.http
      .get('https://cdn.contentstack.io/v3/content_types/news_2/entries', {
        params: {
          locale: lang,
          include_count: true,
          limit: 10,
          desc: 'date',
          environment: 'live',
        },
        headers: {
          access_token: 'cs5c0163c11c699d9ab239ee4c',
          api_key: 'blta38dcaae86f2ef5c',
        },
      })
      .pipe(map((response) => response.data));
  }
}
