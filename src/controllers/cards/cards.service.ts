import { Injectable } from '@nestjs/common';
import { map, Observable, tap, of } from 'rxjs';
import { Card } from '../../shared/models';
import { getCards, getCollectibleCards } from '../../shared/utils/card-utils';
import { SearchCardsQueryType } from './cards.dto';

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

  public searchCard(
      query: string,
      queryType: SearchCardsQueryType,
      exactMatch: boolean = true,
      onlyCollectible: boolean = true,
      minify: boolean = true,
      limit: number = 5
    ): Observable<Card[]> {
    query = `${query}`.toLowerCase();

    if (!query) {
      return of([]);
    }

    const filterFn: (card: Card, prop: string) => boolean = (card: Card, prop: string) => {
      const cardProp = `${card[prop]}`.toLowerCase();
      if (exactMatch) {
        return cardProp === query;
      } else {
        return cardProp.includes(query);
      }
    };

    const cardsObs = onlyCollectible ? getCollectibleCards(minify) : getCards(minify);

    return cardsObs.pipe(
      map((cards: Card[]) => {
        let cardResult: Card[] = [];
        switch (queryType) {
          case 'code':
            cardResult = cards.filter((card) => filterFn(card, 'cardCode'));
            break;
          case 'name':
            cardResult = cards.filter((card) => filterFn(card, 'name'));
            break;
        }
        cardResult = !!limit ? cardResult.slice(0, limit) : cardResult;
        return cardResult;
      }),
    );
  }
}
