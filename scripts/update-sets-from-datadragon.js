// eslint-disable-next-line @typescript-eslint/no-var-requires
const Downloader = require('nodejs-file-downloader');
// eslint-disable-next-line @typescript-eslint/no-var-requires
const extract = require('extract-zip');
// eslint-disable-next-line @typescript-eslint/no-var-requires
const Rx = require('rxjs');
// eslint-disable-next-line @typescript-eslint/no-var-requires
const RxOp = require('rxjs/operators');
// eslint-disable-next-line @typescript-eslint/no-var-requires
const fs = require('fs');
// eslint-disable-next-line @typescript-eslint/no-var-requires
const fsx = require('fs-extra');

/***********************************
 * VARIÁVEIS DO SCRIPT
 ************************************/

const setNames = ['set1', 'set2', 'set3', 'set4', 'set5'];
const langs = ['en_us'];
const isLite = true;
const tempDir = `${process.cwd()}/tmp`;
const setsDir = `${tempDir}/sets`;
const downloadUrl = `https://dd.b.pvp.net/latest`;

/***********************************
 * MÉTODOS DO SCRIPT
 ************************************/

async function downloadSet(url, destDir) {
  const fileExtension = '.zip';
  url = `${url}${fileExtension}`;
  let currPercentage = 0;
  const downloader = new Downloader({
    url: url,
    directory: destDir, //Sub directories will also be automatically created if they do not exist.
    onProgress: function (percentage, chunk, remainingSize) {
      //Gets called with each percentage.
      if (Math.round(percentage) !== currPercentage) {
        currPercentage = Math.round(percentage);
        console.log(`Downloading ${url} (${currPercentage}%)`);
      }
    },
  });

  try {
    return downloader.download();
  } catch (error) {
    console.log(error);
    return Promise.reject(false);
  }
}

async function extractSet(filename, destinationDir) {
  const fileExtension = '.zip';
  try {
    console.log(`Extracting ${filename}`);
    return extract(`${tempDir}/${filename}${fileExtension}`, {
      dir: destinationDir,
    });
  } catch (err) {
    return Promise.reject(false);
  }
}

function createSetFile(lang) {
  const dir = `${setsDir}/${lang}`;
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  fs.writeFileSync(`${dir}/${lang}.json`, JSON.stringify([])); // CRIA O ARQUIVO VAZIO!
}

function updateMetadataFile(filename, lang) {
  console.log(`Updating sets metadata for ${lang}`);
  const metadataFilename = `${setsDir}/${lang}/${lang}.json`;
  const currentMetadataFilename = `${tempDir}/${filename}/${lang}/data/${filename.replace('lite-', '')}.json`;
  const currentMetadataFile = fs.readFileSync(currentMetadataFilename);
  const currentMetadataObject = JSON.parse(currentMetadataFile.toString());
  const metadataFile = fs.readFileSync(metadataFilename);
  const metadataObject = JSON.parse(metadataFile.toString());
  fs.writeFileSync(metadataFilename, JSON.stringify([...metadataObject, ...currentMetadataObject]));
  fs.copyFileSync(currentMetadataFilename, `${setsDir}/${lang}/${filename.replace('lite-', '')}.json`);
  console.log(`Sets metadata for ${lang} completed`);
}

function updateBackendAssets(lang) {
  fsx.copy(`${setsDir}/${lang}`, `./src/assets/sets/${lang}`);
}

/***********************************
 * EXECUÇÃO DO SCRIPT
 ************************************/

async function executeScript() {
  for (let lang of langs) {
    createSetFile(lang); // cria o arquivo json vazio
    for (let setName of setNames) {
      const filename = `${setName}${isLite ? '-lite-' : '-'}${lang}`; // SEM EXTENSÃO!!
      // await downloadSet(`${downloadUrl}/${filename}`, tempDir);
      // await extractSet(filename, `${tempDir}/${filename}`);
      updateMetadataFile(filename, lang);
    }
    updateBackendAssets(lang);
  }
}

executeScript();
