// eslint-disable-next-line @typescript-eslint/no-var-requires
const Downloader = require('nodejs-file-downloader');
// eslint-disable-next-line @typescript-eslint/no-var-requires
const extract = require('extract-zip');

/***********************************
 * MÉTODOS DO SCRIPT
 ************************************/

async function downloadSet(url, destDir) {
  let currPercentage = 0;
  const downloader = new Downloader({
    url: url,
    directory: destDir, //Sub directories will also be automatically created if they do not exist.
    onProgress: function (percentage, chunk, remainingSize) {
      //Gets called with each percentage.
      if (Math.round(percentage) !== currPercentage) {
        currPercentage = Math.round(percentage);
        console.log(`Downloading ${filename} (${currPercentage}%)`);
      }
    },
  });

  try {
    await downloader.download();
  } catch (error) {
    console.log(error);
  }
}

async function extractSet(filename, destinationDir) {
  try {
    console.log(`Extracting ${filename}`);
    await extract(`${tempDir}/${filename}`, {
      dir: destinationDir,
    });
    console.log(`Extraction of ${filename} completed on: ${destinationDir}`);
  } catch (err) {
    console.log(`Extraction failed (${filename}): `, err);
  }
}

/***********************************
 * VARIÁVEIS DO SCRIPT
 ************************************/

const setNumbers = [1, 2, 3, 4, 5];
const isLite = true;
const langs = ['en_us'];
const tempDir = `${process.cwd()}/tmp`;
const filenames = langs // todos os sets que serão baixados!!
  .map((lang) => {
    return setNumbers.map(
      (setNumber) => `set${setNumber}${isLite ? '-lite' : ''}-${lang}.zip`,
    );
  })
  .flat();

/***********************************
 * EXECUÇÃO DO SCRIPT
 ************************************/

const filename = filenames[0];

async function executeScript() {
  await downloadSet(`https://dd.b.pvp.net/latest/${filename}`, tempDir);
  await extractSet(filename, `${tempDir}/${filename.split('.')[0]}`);
}

executeScript();
