import { Injectable } from '@nestjs/common';
import {concatMap, map, Observable, of} from 'rxjs';
import {HttpService} from "@nestjs/axios";

@Injectable()
export class TpocService {
  constructor(
    private http: HttpService
  ) {}

  public get(): Observable<any> {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    return of('');
  }

  public getOptimalTpocChampionBuilds(): Observable<any> {
    return of('').pipe(
      // https://njb.fyi/poc
      concatMap(() => this.http.get('https://docs.google.com/spreadsheets/d/1FePMz4o3tbiWcz0nHZYu0aAHknbIfb9anWfQCVtvtKk/gviz/tq?tqx=out:json&tq&gid=1877830190')),
      map((response) => response.data),
      map((response) => JSON.parse(response.substring(47).slice(0, -2))), // a resposta do google vem como texto
      map((sheet: any) => {
        // return sheet;
        let result = sheet.table.rows.map(row => {
          return {
            name: row.c[0].v,
            bestSupportingChampions: row.c[7].v.split('\n'),
            bestPassives: row.c[8].v.split('\n'),
            bestRelics: row.c[9].v.split('\n'),
            summary: row.c[3].v,
          }
        })
        return result;
      }),
    );
  }

}
