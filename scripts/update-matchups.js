// eslint-disable-next-line @typescript-eslint/no-var-requires
const rxjs = require('rxjs');
// eslint-disable-next-line @typescript-eslint/no-var-requires
const http = require('@nestjs/axios');
// eslint-disable-next-line @typescript-eslint/no-var-requires
const fs = require('fs');

const matchupsPath = 'src/assets/matchups';

function createEmptyFile(dir, filename) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  fs.writeFileSync(`${dir}/${filename}`, JSON.stringify([])); // CRIA O ARQUIVO VAZIO!
}

async function executeScript() {
  const patchStats = await rxjs.lastValueFrom(
    new http.HttpService()
      .get('https://runescola.com.br/runescolaCrawler/resource/meta/data.json')
      .pipe(rxjs.map((response) => response.data)),
  );
  const currentPatch = patchStats.info.patch.versions;
  const folderNames = ['latest', currentPatch];

  const csvFiles = [
    'https://raw.githubusercontent.com/MaouLegna/llorr-website/main/static/data/mu_diamond.csv',
    'https://raw.githubusercontent.com/MaouLegna/llorr-website/main/static/data/mu_master.csv',
  ];

  for (const csvFilePath of csvFiles) {
    let csvFile = await rxjs.lastValueFrom(
      new http.HttpService().get(csvFilePath).pipe(
        // rxjs.tap((response) => {
        //   console.log(`Request GET: ${csvFilePath}`, response);
        // }),
        rxjs.map((response) => response.data),
      ),
    );

    for (const folderName of folderNames) {
      const dirName = `${matchupsPath}/${folderName}`;
      const filename = `${folderName}${csvFilePath.substring(csvFilePath.lastIndexOf('_'))}`;
      createEmptyFile(dirName, filename);
      fs.writeFileSync(`${dirName}/${filename}`, csvFile);
    }
  }
}

executeScript();
