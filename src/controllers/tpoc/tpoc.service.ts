import { Injectable } from '@nestjs/common';
import {concatMap, map, Observable, of} from 'rxjs';
import {HttpService} from "@nestjs/axios";
import {BestMatch, findBestMatch} from "string-similarity";
import {RiotLoRTPoCPower, RiotLoRTPoCRelic} from "@gabrielgn-test/runeterra-tools/dist/riot-assets/models-tpoc";
import * as fs from "fs";
import {CHAMPION_CARD_CODE} from "@gabrielgn-test/runeterra-tools";

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
    let tpocSheet: any;
    const findRelicCodeByString = (str: string, relics: RiotLoRTPoCRelic[]) => {
      const bestMatchName: string = findBestMatch(str.toLowerCase(), relics.map(r => r.name.toLowerCase())).bestMatch.target;
      return relics.find((r: RiotLoRTPoCRelic) => r.name.toLowerCase() === bestMatchName.toLowerCase()).relicCode;
    }

    const findPowerCodeByString = (str: string, powers: RiotLoRTPoCPower[]) => {
      const bestMatchName: string = findBestMatch(str.toLowerCase(), powers.map(r => r.name.toLowerCase())).bestMatch.target;
      return powers.find((r: RiotLoRTPoCPower) => r.name.toLowerCase() === bestMatchName.toLowerCase()).powerCode;
    }

    const findChampionCodeByString = (str: string, championNames: string[]) => {
      const bestMatchName: string = findBestMatch(str.toUpperCase(), championNames.map(c => c.toUpperCase())).bestMatch.target;
      return CHAMPION_CARD_CODE[bestMatchName];
    }

    return of('').pipe(
      // https://njb.fyi/poc
      concatMap(() => this.http.get('https://docs.google.com/spreadsheets/d/1FePMz4o3tbiWcz0nHZYu0aAHknbIfb9anWfQCVtvtKk/gviz/tq?tqx=out:json&tq&gid=1877830190')),
      map((response) => response.data),
      map((response) => {
        tpocSheet = JSON.parse(response.substring(47).slice(0, -2))
        return tpocSheet;
      }), // a resposta do google vem como texto
      map((sheet: any) => {
        // return sheet;
        let result = sheet.table.rows.map(row => {
          const riotTpocUpgrades = JSON.parse(fs.readFileSync('src/assets/tpoc/en_us/en_us.json', 'utf-8'))
          const relicNames = row.c[9].v.split('Combo:')[0].split('\n');
          const relicIds = relicNames.map(n => findRelicCodeByString(n, riotTpocUpgrades.relics));
          const powerNames = row.c[8].v.split('\n');
          const powerIds = powerNames.map(n => findPowerCodeByString(n, riotTpocUpgrades.powers));
          const lorChampionNames = Object.keys(CHAMPION_CARD_CODE).map(k => k)
          const supportingChampionNames = row.c[7].v.split('\n');
          return {
            champion: findChampionCodeByString(row.c[0].v, lorChampionNames),
            bestSupportingChampions: supportingChampionNames.map(c => findChampionCodeByString(c, lorChampionNames)),
            bestPowers: powerIds,
            bestRelics: relicIds,
            summary: row.c[3].v,
          }
        })
        return result;
      }),
    );
  }

}
