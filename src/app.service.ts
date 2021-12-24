import {Injectable} from '@nestjs/common';
import {
    getCodeFromDeck,
    getDeckFromCode,
    CardCodeAndCount,
    Deck
} from 'lor-deckcodes-ts';

@Injectable()
export class AppService {
    private cards;
    constructor() {
        const set1 = require('./assets/en_us/set1-en_us.json');
        const set2 = require('./assets/en_us/set2-en_us.json');
        const set3 = require('./assets/en_us/set3-en_us.json');
        const set4 = require('./assets/en_us/set4-en_us.json');
        this.cards = [...set1, ...set2, ...set3, ...set4];
    }

    getDeckByCode(deckCode: string): { card: any, count: number }[] {
        const decodedDeck: Deck = getDeckFromCode(deckCode);
        const finalDeck: { card: any, count: number }[] = decodedDeck.map(card => {
            return {
                card: this.cards.find(lorCard => lorCard.cardCode === card.cardCode),
                count: card.count
            }
        })
        return finalDeck;
    }
}
