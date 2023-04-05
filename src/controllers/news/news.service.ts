import { Injectable } from '@nestjs/common';
import { Observable } from 'rxjs';
import { HttpNewsService } from './http-news.service';

@Injectable()
export class NewsService {
  constructor(private http: HttpNewsService) {}

  public get(): Observable<any> {
    const lang = global?.lang ? global.lang : 'en_us';
    switch (lang) {
      case 'en_us':
        return this.getNewsEnUs();
        break;
      default:
        return this.getNewsEnUs();
        break;
    }
  }

  public getNewsEnUs(): Observable<any> {
    return this.http.getNewsEnUsPlayRuneterra();
  }
}
