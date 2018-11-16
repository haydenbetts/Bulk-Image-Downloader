/* redirect stdout to file so it never appears in console!! */

var fs = require('fs');
var request = require('request');

var download = function (url, dest, cb) {
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
      fs.unlink(dest);
      return reject(err.message);
    });

    var file = fs.createWriteStream(dest);

    sendReq.pipe(file);

    file.on('finish', function () {
      file.close(resolve()); // close() is async, call cb after close completes
    });

    file.on('error', function (err) { // handle errors in stream
      fs.unlink(dest); // Delete the file async (But we don't check the result)
      return reject(err.message);
    })
  })
}

function logErrors(err, logStream) {
  logStream.write(err);
}

async function f(url, fileName, logStream) {
  try {
    await download(url, `./images/${fileName}.jpg`);
    console.log(`successfully downloaded ${url}`);
  } catch (err) {
    console.log(err);
  }
}

/* Log to a file by overriding stdOut */
var util = require('util');
var log_file = fs.createWriteStream(__dirname + '/debug.log', { flags: 'w' });
var log_stdout = process.stdout;

console.log = function (d) {
  log_file.write(util.format(d) + '\n');
  log_stdout.write(util.format(d) + '\n');
};

const urls = [
  'url2',
  'https://images.unsplash.com/photo-1491513756547-b0e03bd3daf6?ixlib=rb-0.3.5&s=7c06bb4bbd5c37ace54413f87b587f52&auto=format&fit=crop&w=900&q=60'
];

urls.forEach((url, i) => {
  f(url, i)
})

