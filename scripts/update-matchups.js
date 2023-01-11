// eslint-disable-next-line @typescript-eslint/no-var-requires
const rxjs = require('rxjs');
// eslint-disable-next-line @typescript-eslint/no-var-requires
const http = require('@nestjs/axios');
// eslint-disable-next-line @typescript-eslint/no-var-requires
const fs = require('fs');
// eslint-disable-next-line @typescript-eslint/no-var-requires
const parse = require('csv-parse');
// eslint-disable-next-line @typescript-eslint/no-var-requires
const path = require('path');

const matchupsPath = 'src/assets/matchups';
// https://github.com/MaouLegna/llorr-website/tree/main/static/data
const csvFiles = [
  {
    path: 'https://raw.githubusercontent.com/MaouLegna/llorr-website/main/static/data/mu_master_400.csv',
    name: 'master.csv',
  },
  {
    path: 'https://raw.githubusercontent.com/MaouLegna/llorr-website/main/static/data/mu_diamond_400.csv',
    name: 'diamond.csv',
  },
];
let localFiles = [];
let currentPatch = '';

function createEmptyFile(dir, filename) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  fs.writeFileSync(`${dir}/${filename}`, JSON.stringify([])); // CRIA O ARQUIVO VAZIO!
}

async function downloadCsvFiles() {
  const patchStats = await rxjs.lastValueFrom(
    new http.HttpService()
      .get('https://runescola.com.br/runescolaCrawler/resource/meta/data.json')
      .pipe(rxjs.map((response) => response.data)),
  );
  currentPatch = patchStats.info.patch.versions;
  const folderName = currentPatch;

  for (const csvFilePath of csvFiles) {
    let csvFile = await rxjs.lastValueFrom(
      new http.HttpService().get(csvFilePath.path).pipe(
        // rxjs.tap((response) => {
        //   console.log(`Request GET: ${csvFilePath.path}`, response);
        // }),
        rxjs.map((response) => response.data),
      ),
    );

    const dirName = `${matchupsPath}/${folderName}`;
    const filename = `${folderName}_${csvFilePath.name}`;
    createEmptyFile(dirName, filename);
    fs.writeFileSync(`${dirName}/${filename}`, csvFile);
    localFiles.push(`${dirName}/${filename}`);
  }
}

async function getCsvContent(csvPath) {
  console.log(`getting csv content from ${csvPath}`);

  const headers = [
    'playerDeck', // deck’s archetype of the playerDeck
    'opponentDeck', // deck’s archetype of the opponentDeck
    'muWin', // min number of wins for a match-up
    'muGames', // min number of games for a match-up
    'muWR', // matchup winrate 0-1
    'okCI', // se está dentro do intervalo de confiança aceitável "TRUE" | "FALSE"
    'direction', // simply if the MU is positive (win rate > 50%) or negative (win rate < 50%) for the ‘Player’ or tie (win rate = 50%)
    'CI',
    'mirror', // hide or include mirror match-ups
    'playrate',
    'opponentPR',
  ];
  const fileContent = fs.readFileSync(csvPath, { encoding: 'utf-8' });
  return new Promise((resolve, reject) => {
    parse.parse(
      fileContent,
      { delimiter: ',', columns: headers },
      (error, result) => {
        if (error) {
          reject(error);
        } else {
          resolve(result);
        }
      },
    );
  });
}

function formatJsonValues(matchupArray) {
  console.log(`formatting json values from matchupArray`);

  for (let i = 0; i < matchupArray.length; i++) {
    matchupArray[i]['muWin'] = +matchupArray[i]['muWin'];
    matchupArray[i]['muGames'] = +matchupArray[i]['muGames'];
    matchupArray[i]['muWR'] = +matchupArray[i]['muWR'];
    matchupArray[i]['okCI'] = `${matchupArray[i]['okCI']}`.toLowerCase() === 'true';
    matchupArray[i]['mirror'] = `${matchupArray[i]['mirror']}`.toLowerCase() === 'yes';
    matchupArray[i]['playrate'] = +matchupArray[i]['playrate'];
    matchupArray[i]['opponentPR'] = +matchupArray[i]['opponentPR'];
    matchupArray[i]['positiveWR'] = `${matchupArray[i]['direction']}`.toLowerCase() === 'pos';
    delete matchupArray[i]['direction'];
  }
  return matchupArray;
}

function formatArchetypes(matchupArray) {
  console.log(`formatting json values deck archetypes from matchupArray`);

  const archetypesReplace = [
    {
      archetypeName: 'SunDisc',
      replaceTo: 'Azir/Xerath (SH)',
    },
    {
      archetypeName: 'BandleTree',
      replaceTo: '(BC)',
    },
    {
      archetypeName: 'Pirates',
      replaceTo: 'Miss Fortune/Gangplank', // pirates mantém as regiões utilizadas
    },
  ];

  for (let i = 0; i < matchupArray.length; i++) {
    for (let j = 0; j < archetypesReplace.length; j++) {
      const archetype = archetypesReplace[j];
      // ['opponentDeck', 'playerDeck']
      matchupArray[i]['playerDeck'] = matchupArray[i]['playerDeck'].replaceAll(
        archetype.archetypeName,
        archetype.replaceTo,
      );
      matchupArray[i]['opponentDeck'] = matchupArray[i]['opponentDeck'].replaceAll(
        archetype.archetypeName,
        archetype.replaceTo,
      );
    }
  }

  return matchupArray;
}

function addCIRangeToJson(matchupArray) {
  console.log(`adding CI Range parameter to matchupArray`);

  const getCI = (matchupEntry) => {
    const LCI_LCU = `${matchupEntry.CI}` // eg: (47.7% - 62.7%)
      .replaceAll('(', '')
      .replaceAll(')', '')
      .replaceAll('%', '')
      .split(' - ');
    return +LCI_LCU[1] - +LCI_LCU[0];
  };
  for (let i = 0; i < matchupArray.length; i++) {
    matchupArray[i]['ciRange'] = getCI(matchupArray[i]);
  }
  return matchupArray;
}

async function addChampionAndRegions(matchupArray) {
  console.log(`formatting champion and regions from matchupArray`);

  const toAlphaNum = (str) => {
    return `${str}`.toLowerCase().replace(/[^a-z0-9]/gi, '');
  };

  return rxjs.firstValueFrom(
    rxjs.of(require(`../src/assets/sets/en_us/en_us.json`))
    .pipe(
      rxjs.map((allCards) => {
        const keysToConvert = ['opponentDeck', 'playerDeck'];
        matchupArray.forEach((entry) => {
          keysToConvert.forEach((key) => {
            entry[`${key}_orig`] = entry[key];
            const championCardCodes = `${entry[key]}`
              .slice(0, `${entry[key]}`.lastIndexOf(' ')) // pega apenas os nomes de champs
              .split('/')
              .map((champName) => {
                const champCard = allCards.find((c) => toAlphaNum(c.name) === toAlphaNum(champName));
                if (!!champCard) {
                  return champCard.cardCode;
                } else {
                  return '';
                }
              });
            const regionAbbreviations = `${entry[key]}`
              .slice(`${entry[key]}`.lastIndexOf(' '))
              .replaceAll('(', '')
              .replaceAll(')', '')
              .replaceAll(' ', '')
              .split('/');
            entry[key] = {
              championCodes: championCardCodes,
              regions: regionAbbreviations,
            };
          });
        });
        return matchupArray;
      }),
    ),
  );
}

async function createJsonFileFromCsv(filepath) {
  let fileContentAsJsObj = await getCsvContent(filepath); // retorna csv como json
  fileContentAsJsObj = fileContentAsJsObj.splice(1); // remove headers
  fileContentAsJsObj = formatJsonValues(fileContentAsJsObj); // transforma os valores em primitivos javascript
  fileContentAsJsObj = formatArchetypes(fileContentAsJsObj); // format archetypes names to champion and region names
  fileContentAsJsObj = addCIRangeToJson(fileContentAsJsObj); // adiciona CI Range
  fileContentAsJsObj = await addChampionAndRegions(fileContentAsJsObj); // adiciona campeões e regiões
  const newFilename = filepath.replace('.csv', '.json');
  console.log(`writting json file to ${newFilename}`);
  fs.writeFileSync(newFilename, JSON.stringify(fileContentAsJsObj));
  console.log(`file written to ${newFilename}`);
}

async function executeScript() {
  await downloadCsvFiles();
  for (const filepath of localFiles) {
    await createJsonFileFromCsv(filepath);
    fs.copyFile(
      filepath.replaceAll('.csv', '.json'),
      filepath.replaceAll(currentPatch, 'latest').replaceAll('.csv', '.json'),
      (err) => {
        // console.log(err);
      },
    );
    // apaga o arquivo json da pasta original para não ocupar espaço
    fs.unlink(filepath.replaceAll('.csv', '.json'), (err) => {
      // console.log(err);
    });
  }
  console.log(`script ended`);
}

executeScript();
