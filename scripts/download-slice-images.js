// eslint-disable-next-line @typescript-eslint/no-var-requires
const fs = require('fs');
// eslint-disable-next-line @typescript-eslint/no-var-requires
const Axios = require('axios');
// eslint-disable-next-line @typescript-eslint/no-var-requires
const _ = require('lodash');
// eslint-disable-next-line @typescript-eslint/no-var-requires
const cards = require(`../src/assets/sets/en_us/en_us.json`);
// eslint-disable-next-line @typescript-eslint/no-var-requires
const zipper = require('zip-local');

const cardSliceDirName = 'card-tiles';

async function downloadImage(cardCode) {
  cardCode = `${cardCode}`.toUpperCase();
  const url = `https://lor.gg/storage/cards/slice/${cardCode}-slice.webp`;
  const filepath = `./${cardSliceDirName}/${cardCode}-slice.webp`;

  try {
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
  } catch (error) {
    return new Promise((resolve, reject) => {
      resolve('');
    });
  }
}

function getMissingCards() {
  const allCardCodes = cards
    .map((c) => c.cardCode)
    .filter((cc) => cc.length === 7); // ignora tokens
  const allCardImages = fs
    .readdirSync(`./${cardSliceDirName}`)
    .map((filename) => filename.slice(0, filename.indexOf('-')));
  return _.difference(allCardCodes, allCardImages);
}

function zipFolder() {
  console.log(`Iniciando processo de zipagem`);
  zipper.sync.zip(`./${cardSliceDirName}/`).compress().save('latest.zip');
  console.log(`Tiles zipados em latest.zip`);
}

async function executeScript() {
  const timeStart = new Date();
  for (let i = 0; i < cards.length; i++) {
    const card = cards[i];
    // ignora os tokens, cartas com código maior que 7
    if (card.cardCode.length === 7) {
      console.log(`Baixando imagem ${i} (${card.name})`);
      await downloadImage(card.cardCode);
    }
  }
  console.log(`Cartas faltantes: ${getMissingCards()} (${getMissingCards().length})`);
  zipFolder();
  const timeElapsed = new Date() - timeStart;
  console.log(`Tempo de execução: ${Math.floor(timeElapsed / 1000)}s)`);
}

executeScript();
