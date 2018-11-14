var fs = require('graceful-fs');
var request = require('request');
var axios = require('axios');
const basketballAccessories = require('./utils/data/basketball-accessories');
const basketballApparel = require('./utils/data/basketball-apparel');
const basketballShoes = require('./utils/data/basketball-shoes');
const footballAccessories = require('./utils/data/football-accessories');
const footballApparel = require('./utils/data/football-apparel');
const footballCleats = require('./utils/data/football-cleats');
const runningAccessories = require('./utils/data/running-accessories');
const runningApparel = require('./utils/data/running-apparel');
const runningShoes = require('./utils/data/running-shoes');


// var download = function (uri, filename, callback) {
//   request.head(uri, function (err, res, body) {
//     if (err) {
//       console.log(err);
//     }

//     request(uri).pipe(fs.createWriteStream(filename))
//       .on('error', (err) => { console.log(err) })
//       .on('close', callback);
//   });
// };

async function download(url, basename, imgId, sh, callback) {
  try {
    const response = await downloadImage(url)
      .catch((err) => { console.log(err) });


    response.data.pipe(fs.createWriteStream(`./images/${imgId}/${basename}_${sh}.jpg`))

    await writeImage(response)
      .catch((err) => { console.log(err) });

    console.log(`successfully wrote ${basename}!`)

  } catch (error) {
    console.error(error);
  }
}

function downloadImage(url) {
  return axios.get(url, { responseType: 'stream' })
}

function writeImage(response) {
  return new Promise((resolve, reject) => {
    response.data.on('end', () => {
      resolve()
    })

    response.data.on('error', () => {
      reject()
    })
  })
}


function scrapeImage(imgId, imgFileName) {
  let dir = `./images/${imgId}`;
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(`./images/${imgId}`);
  }

  [32, 64, 128, 256, 512, 1024].forEach((sh) => {
    let basename = imgFileName.split('.jpg')[0]
    download(`http://demandware.edgesuite.net/sits_pod20-adidas/dw/image/v2/aaqx_prd/on/demandware.static/-/Sites-adidas-products/en_US/${imgId}/zoom/${imgFileName}?sh=${sh}`,
      basename, imgId, sh)
  })
}

const scrape = (array) => {
  array.forEach((itemsInCategory) => {
    itemsInCategory.forEach((item) => {
      item.images.forEach((image) => {
        scrapeImage(image.id, image.fileName)
      })
    })
  })
}

scrape([basketballShoes, footballAccessories, footballApparel, footballCleats, runningAccessories, runningApparel, runningShoes]);