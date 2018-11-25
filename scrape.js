var fs = require('fs');
var request = require('request');
const basketballAccessories = require('./data/basketball-accessories');
const basketballApparel = require('./data/basketball-apparel');
const basketballShoes = require('./data/basketball-shoes');
const footballAccessories = require('./data/football-accessories');
const footballApparel = require('./data/football-apparel');
const footballCleats = require('./data/football-cleats');
const runningAccessories = require('./data/running-accessories');
const runningApparel = require('./data/running-apparel');
const runningShoes = require('./data/running-shoes');

/* redirect stdout to file so it never appears in console!! */
console.log = function (d) {
  log_file.write(util.format(d) + '\n');
  log_stdout.write(util.format(d) + '\n');
};


var download = async function (url, dest, cb) {
  return new Promise((resolve, reject) => {
    var sendReq = request.get(url);

    // verify resonse code
    sendReq.on('response', function (response) {
      if (response.statusCode !== 200) {
        return reject('Response status was ' + response.statusCode);
      }
    });

    // check for request errors
    sendReq.on('error', function (err) {
      //fs.unlinkSync(dest);
      return reject(err.message);
    });

    var file = fs.createWriteStream(dest);

    sendReq.pipe(file);

    file.on('finish', function () {
      file.close(resolve()); // close() is async, call cb after close completes
    });

    file.on('error', function (err) { // handle errors in stream
      //fs.unlinkSync(dest); // Delete the file async (But we don't check the result)
      return reject(err.message);
    })
  })
}

function logErrors(err, logStream) {
  logStream.write(err);
}

async function f(url, fileName, logStream) {
  try {
    console.log(url);
    await download(url, fileName);
    console.log(`successfully downloaded ${url}`);
  } catch (err) {
    console.log(err);
  }
}

/* Log to a file by overriding stdOut */
var util = require('util');
var log_file = fs.createWriteStream(__dirname + '/debug.log', { flags: 'w' });
var log_stdout = process.stdout;


async function scrapeImage(imgId, imgFileName) {
  let dir = `./images/${imgId}/zoom/`;
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(`./images/${imgId}`);
    fs.mkdirSync(`./images/${imgId}/zoom/`);

  }

  const sizes = [1024];

  for (let sh of sizes) {
    let basename = imgFileName.split('.jpg')[0]
    await f(`http://demandware.edgesuite.net/sits_pod20-adidas/dw/image/v2/aaqx_prd/on/demandware.static/-/Sites-adidas-products/en_US/${imgId}/zoom/${imgFileName}?sh=${sh}`,
      `./images/${imgId}/zoom/${imgFileName}`)
  }
}

const scrape = async (array) => {
  for (let itemsInCategory of array) {
    for (let item of itemsInCategory) {
      for (let image of item.images) {
        await scrapeImage(image.id, image.fileName)
      }
    }
  }
}

scrape([
  basketballAccessories,
  basketballApparel,
  basketballShoes,
  footballAccessories,
  footballApparel,
  footballCleats,
  runningAccessories,
  runningApparel,
  runningShoes
]);

