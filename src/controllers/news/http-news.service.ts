import { Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { map, Observable, of } from "rxjs";

@Injectable()
export class HttpNewsService {
  constructor(private http: HttpService) {}

  public getNewsEnUsPlayRuneterra(): Observable<any[]> {
    return this.http
      .get('https://runeterra.ar/main/get/news?lang=en_us')
      .pipe(
        map((response) => response.data),
      );
    return of([`Hello World - en_us`]);
  }
}
