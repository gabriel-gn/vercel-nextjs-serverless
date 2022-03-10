import { Injectable } from '@nestjs/common';
import { map, Observable, tap, of } from 'rxjs';
import { Card } from '../../shared/models';
import { getCards } from '../../shared/utils/card-utils';

@Injectable()
export class CardsService {
  constructor() {}

  public getCardByCode(cardCode: string): Observable<Card> {
    return getCards(false).pipe(
      map((cards: Card[]) => {
        return cards.find((card) => card.cardCode === cardCode);
      }),
    );
  }

  public searchCard(query: string, queryType: 'code', exactMatch: boolean = true): Observable<Card[]> {
    query = `${query}`.toLowerCase();

    const filterFn: (card: Card, prop: string) => boolean = (card: Card, prop: string) => {
      const cardProp = `${card[prop]}`.toLowerCase();
      if (exactMatch) {
        return cardProp === query;
      } else {
        return cardProp.includes(query);
      }
    };

    return getCards(false).pipe(
      map((cards: Card[]) => {
        switch (queryType) {
          case 'code':
            return cards.filter((card) => filterFn(card, 'cardCode'));
            break;
          default:
            return [];
            break;
        }
      }),
    );
  }
}
