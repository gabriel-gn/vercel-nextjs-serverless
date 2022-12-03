import { Injectable } from '@nestjs/common';
import { map, Observable, tap, of } from 'rxjs';
import { getCards, getCollectibleCards } from '../../shared/utils/card-utils';
import { SearchCardsQueryType } from './cards.dto';
import { RiotLoRCard } from '@gabrielgn-test/runeterra-tools';

@Injectable()
export class CardsService {
  constructor() {}

  public getCardByCode(cardCode: string): Observable<RiotLoRCard> {
    return getCards(false).pipe(
      map((cards: RiotLoRCard[]) => {
        return cards.find((card) => card.cardCode === cardCode);
      }),
    );
  }

  public searchCard(
    query: string,
    queryType: SearchCardsQueryType,
    exactMatch = true,
    onlyCollectible = true,
    associatedCards = false,
    minify = true,
    limit = 5,
  ): Observable<RiotLoRCard[]> {
    query = `${query}`.toLowerCase();

    if (!query) {
      return of([]);
    }

    const filterFn: (card: RiotLoRCard, prop: string) => boolean = (
      card: RiotLoRCard,
      prop: string,
    ) => {
      const cardProp = `${card[prop]}`.toLowerCase();
      if (exactMatch) {
        return cardProp === query;
      } else {
        return cardProp.includes(query);
      }
    };

    const cardsObs = onlyCollectible
      ? getCollectibleCards(minify)
      : getCards(minify);

    return cardsObs.pipe(
      map((cards: RiotLoRCard[]) => {
        let cardResult: RiotLoRCard[] = [];
        switch (queryType) {
          case 'code':
            cardResult = cards.filter((card) => filterFn(card, 'cardCode'));
            break;
          case 'name':
            cardResult = cards.filter((card) => filterFn(card, 'name'));
            break;
        }
        cardResult = !!limit ? cardResult.slice(0, limit) : cardResult;

        if (associatedCards === true) {
          // adiciona as card refs
          cardResult.forEach((card) => {
            card.associatedCardRefs.forEach((cardRef) => {
              card.associatedCards.push(
                cards.find((lorCard) => lorCard.cardCode === cardRef),
              );
            });
          });
        }

        return cardResult;
      }),
    );
  }
}
