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
  'set1',
  'set2',
  'set3',
  'set4',
  'set5',
  'set6',
  'set6cde',
];
let langs = [
  'en_us',
  'pt_br',
];
let tempDir = `${process.cwd()}/tmp`;
let setsDir = `${tempDir}/sets`;
// ex: https://dd.b.pvp.net/3_17_0/set6/pt_br/data/set6-pt_br.json
let downloadUrl = `https://dd.b.pvp.net/latest`;
let appendOnly = false; // caso seja true, não sobrescreve o arquivo, apenas adiciona o resultado ao ja existente

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
  const filenamePath = `./src/assets/sets/${lang}/${filename}`;
  const downloadPath = `${downloadUrl}/${setName}/${lang}/data/${filename}`;
  let cardSet = await rxjs.lastValueFrom(
    new http.HttpService()
      .get(downloadPath)
      .pipe(rxjs.map((response) => response.data)),
  );
  if (appendOnly) { // caso seja só append, adiciona o resultado no objeto
    cardSet = [
      ...JSON.parse(fs.readFileSync(filenamePath)),
      ...cardSet,
    ];
  }
  fs.writeFileSync(filenamePath, JSON.stringify(cardSet));
  return { filename: filename, set: cardSet };
}

async function updateAllSets(lang) {
  createSetFile(lang); // cria o arquivo json vazio e o diretório
  let cardSets = [];
  for (let setName of setNames) {
    const result = await updateSet(setName, lang);
    cardSets.push(result.set);
    console.log(result.filename);
  }
  let allCards = [].concat.apply([], cardSets);
  const filename = `${lang}.json`;
  const filenamePath = `./src/assets/sets/${lang}/${filename}`;
  if (appendOnly) {
    allCards = [
      ...JSON.parse(fs.readFileSync(filenamePath)),
      ...allCards,
    ];
  }
  fs.writeFileSync(
    filenamePath,
    JSON.stringify(allCards),
  );
  console.log(filename);
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
    new http.HttpService()
      .get(downloadPath)
      .pipe(rxjs.map((response) => response.data)),
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
  console.log(`Sets e Globals atualizados pela versão ${patch}!`);
}

/**
 *  Por algum motivo a riot nas revelações de sets, colocou o "latest" como sendo as cartas novas apenas!
 *  Esse método atualiza os sets com a versão do patch atual, e junta com o "latest" do último set
 *  O resultado deve ser todas as cartas atuais + as revelações adicionadas no último set
 *  * @returns {Promise<void>}
 */
async function updateSetsFromCurrentPatchAppendingLastSet(currentPatch) {
  // dá update nos sets com a versão do patch atual
  appendOnly = false;
  await updateAll(currentPatch);

  // altera as variáveis necessárias para dar update em todos os sets
  setNames = [setNames[setNames.length - 1]]; // pega apenas o último set
  appendOnly = true;
  await updateAll(); // latest
  console.log(`Sets ${setNames} atualizados apenas dando append pela versão ${currentPatch}!`);
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
  await updateAll();
  // await updateSetsFromCurrentPatchAppendingLastSet('3_16_0');

  // await commitAll();
}

executeScript();
