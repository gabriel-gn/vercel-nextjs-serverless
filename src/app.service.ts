import {Injectable} from '@nestjs/common';
import {
    getCodeFromDeck,
    getDeckFromCode,
    CardCodeAndCount,
    Deck
} from 'lor-deckcodes-ts';
import * as set1 from '../src/assets/en_us/set1-en_us.json';
import * as set2 from '../src/assets/en_us/set2-en_us.json';
import * as set3 from '../src/assets/en_us/set3-en_us.json';
import * as set4 from '../src/assets/en_us/set4-en_us.json';

const cards = [...set1, ...set2, ...set3, ...set4];

@Injectable()
export class AppService {
    getDeckByCode(deckCode: string): { card: any, count: number }[] {
        const decodedDeck: Deck = getDeckFromCode(deckCode);
        const finalDeck: { card: any, count: number }[] = decodedDeck.map(card => {
            return {
                card: cards.find(lorCard => lorCard.cardCode === card.cardCode),
                count: card.count
            }
        })
        return finalDeck;
    }
}
