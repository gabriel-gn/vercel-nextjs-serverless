import { Injectable } from '@nestjs/common';
import { map, Observable, of } from 'rxjs';
import { Card } from '../../shared/models';

@Injectable()
export class RiotAssetsService {
  constructor() {}

  public get(): Observable<any> {
    return of('riot assets');
  }

  public getLoRGlobals(): Observable<any> {
    const lang = global?.lang ? global.lang : 'en_us';
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    return of(require(`../../assets/globals/${lang}.json`));
  }

  public getLoRCards(): Observable<Card[]> {
    const lang = global?.lang ? global.lang : 'en_us';
    return of(require(`../../assets/sets/${lang}/${lang}.json`));
  }
}
