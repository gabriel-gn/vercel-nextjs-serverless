const needle = require('needle');
const fs = require('fs');

const path = 'https://runeterra.ar/cards/builder/get/en_us?take=1000000'

needle.post(path, {}, { json: true }, function (error, response) {
  fs.writeFileSync('src/sets/runeterraAR/en_us.json', JSON.stringify(response.body.cards))
});
