import { Injectable } from '@nestjs/common';
import { Observable, of } from 'rxjs';

@Injectable()
export class RiotAssetsService {
  constructor() {}

  public get(): Observable<any> {
    return of('riot assets');
  }
}
