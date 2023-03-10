// eslint-disable-next-line @typescript-eslint/no-var-requires
const fs = require('fs');
// eslint-disable-next-line @typescript-eslint/no-var-requires
const Axios = require('axios');
// eslint-disable-next-line @typescript-eslint/no-var-requires
const cards = require(`../src/assets/sets/en_us/en_us.json`);

async function downloadImage(cardCode) {
  cardCode = `${cardCode}`.toUpperCase();
  const url = `https://lor.gg/storage/cards/slice/${cardCode}-slice.webp`;
  const filepath = `./card-slices/${cardCode}-slice.webp`;
  const response = await Axios({
    url,
    method: 'GET',
    responseType: 'stream',
  });
  return new Promise((resolve, reject) => {
    response.data
      .pipe(fs.createWriteStream(filepath))
      .on('error', reject)
      .once('close', () => resolve(filepath));
  });
}

async function executeScript() {
  for (let i = 0; i < cards.length; i++) {
    const card = cards[i];
    await downloadImage(card.cardCode);
  }
}

executeScript();
