import { Injectable } from '@nestjs/common';
import { Observable, of } from 'rxjs';

@Injectable()
export class ServerInfoService {
  constructor() {}

  public get(): Observable<any> {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    return of({ version: require(`../../../package.json`).version });
  }
}
