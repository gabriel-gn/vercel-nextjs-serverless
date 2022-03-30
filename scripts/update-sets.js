// eslint-disable-next-line @typescript-eslint/no-var-requires
const rxjs = require('rxjs');
// eslint-disable-next-line @typescript-eslint/no-var-requires
const http = require('@nestjs/axios');
// eslint-disable-next-line @typescript-eslint/no-var-requires
const fs = require('fs');
// eslint-disable-next-line @typescript-eslint/no-var-requires
const simpleGit = require('simple-git');

/***********************************
 * VARIÁVEIS DO SCRIPT
 ************************************/

const setNames = ['set1', 'set2', 'set3', 'set4', 'set5'];
const langs = ['en_us', 'pt_br'];
const tempDir = `${process.cwd()}/tmp`;
const setsDir = `${tempDir}/sets`;
const downloadUrl = `https://dd.b.pvp.net/latest`;

/***********************************
 * MÉTODOS DO SCRIPT
 ************************************/

function createSetFile(lang) {
  const dir = `${setsDir}/${lang}`;
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  fs.writeFileSync(`${dir}/${lang}.json`, JSON.stringify([])); // CRIA O ARQUIVO VAZIO!
}

async function updateSet(setName, lang) {
  const filename = `${setName}-${lang}.json`;
  const downloadPath = `${downloadUrl}/${setName}/${lang}/data/${filename}`;
  let cardSet = await rxjs.lastValueFrom(
    new http.HttpService()
      .get(downloadPath)
      .pipe(rxjs.map((response) => response.data)),
  );
  fs.writeFileSync(
    `./src/assets/sets/${lang}/${filename}`,
    JSON.stringify(cardSet),
  );
  return { filename: filename, set: cardSet };
}

/***********************************
 * EXECUÇÃO DO SCRIPT
 ************************************/

async function executeScript() {
  for (let lang of langs) {
    createSetFile(lang); // cria o arquivo json vazio
    let cardSets = [];
    for (let setName of setNames) {
      const result = await updateSet(setName, lang);
      cardSets.push(result.set);
      console.log(result.filename);
    }
    const allCards = [].concat.apply([], cardSets);
    const filename = `${lang}.json`;
    fs.writeFileSync(
      `./src/assets/sets/${lang}/${filename}`,
      JSON.stringify(allCards),
    );
    console.log(filename);
  }

  const git = simpleGit();
  const branches = await git.branchLocal();
  const currentBranch = branches.current;
  await git.commit(':robot: auto update sets', { '-a': null });
  await git.push();
  await git.push('origin', currentBranch);
}

executeScript();
