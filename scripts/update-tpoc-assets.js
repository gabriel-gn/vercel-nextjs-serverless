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

let setNames = [
  'adventure',
];
let fileNames = [
  'items', // e.g. https://dd.b.pvp.net/latest/adventure/en_us/data/items-en_us.json
  'powers',
  'relics',
];
let langs = [
  'en_us',
  'pt_br',
];
let tempDir = `${process.cwd()}/tmp`;
let setsDir = `${tempDir}/tpoc`;
// ex: https://dd.b.pvp.net/3_17_0/set6/pt_br/data/set6-pt_br.json
let downloadUrl = `https://dd.b.pvp.net/latest`;

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

async function updateFileSet(setName, file, lang) {
  const filename = `${file}-${lang}.json`;
  const filenamePath = `./src/assets/tpoc/${lang}/${filename}`;
  const downloadPath = `${downloadUrl}/${setName}/${lang}/data/${filename}`;
  let cardSet = await rxjs.lastValueFrom(
    new http.HttpService()
      .get(downloadPath)
      .pipe(
        // rxjs.tap((response) => {console.log(`Request GET: ${downloadPath}`)}),
        rxjs.map((response) => response.data)
      ),
  );
  fs.writeFileSync(filenamePath, JSON.stringify(cardSet));
  console.log(`ARQUIVO ${filename} atualizado!`);
  return { filename: filename, set: cardSet };
}

async function updateAllSets(lang) {
  createSetFile(lang); // cria o arquivo json vazio e o diretório
  let tpocAssets = {};
  for (let setName of setNames) {
    for (let file of fileNames) {
      const result = await updateFileSet(setName, file, lang);
      tpocAssets[file] = result.set;
    }
  }
  const filename = `${lang}.json`;
  const filenamePath = `./src/assets/tpoc/${lang}/${filename}`;
  fs.writeFileSync(
    filenamePath,
    JSON.stringify(tpocAssets),
  );
  console.log(`ARQUIVO ${filename} atualizado para a lang ${lang}`, '\n');
}

async function updateAllGlobals(lang) {
  const dir = `src/assets/globals`;
  const filepath = `${dir}/${lang}.json`;
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  fs.writeFileSync(`${filepath}`, JSON.stringify([])); // CRIA O ARQUIVO VAZIO!
  const downloadPath = `${downloadUrl}/core/${lang}/data/globals-${lang}.json`;
  let globalsFile = await rxjs.lastValueFrom(
    new http.HttpService().get(downloadPath).pipe(
      // rxjs.tap((response) => {console.log(`Request GET: ${downloadPath}`)}),
      rxjs.map((response) => response.data),
    ),
  );
  fs.writeFileSync(`./${filepath}`, JSON.stringify(globalsFile));
}

async function updateAll(patch = 'latest') {
  const latestDownloadUrl = `${downloadUrl}`; // latest por padrão
  downloadUrl = downloadUrl.replace('latest', patch);
  for (let lang of langs) {
    await updateAllGlobals(lang);
    await updateAllSets(lang);
  }
  downloadUrl = `${latestDownloadUrl}`; // volta a ser a latest
  console.log(`Sets e Globals atualizados pela versão ${patch}!`, '\n');
}

async function commitAll() {
  const git = simpleGit();
  const branches = await git.branchLocal();
  const currentBranch = branches.current;

  console.log(`Iniciando commit na branch ${currentBranch}`);
  await git.commit(':robot: auto update sets', { '-a': null });
  await git.push();
  await git.push('origin', currentBranch);
  console.log(`Finalizando commit para branch ${currentBranch}`);
}

/***********************************
 * EXECUÇÃO DO SCRIPT
 ************************************/

async function executeScript() {
  const patch = process.env.PATCH || 'latest';
  console.log(`CONFIG patch: ${patch}`);

  console.log(`*** Iniciando Script ***`);

  console.log(`*** Iniciando Update de assets do patch ${patch} ***`);
  await updateAll(patch);
  // await commitAll();
  console.log(`*** Finalizando Script ***`);
}

executeScript();
