const https = require('https');
const URL = require('url');
const fs = require('fs');
// const baseUrl = 'https://doub.bid/sszhfx/'
const baseUrl = 'https://www.baidu.com/'

// globalTunnel.initialize({
//   host: '127.0.0.1',
//   port: 8888
// });

const getDataHttps = (options) => {
  return new Promise((resolve, reject) => {
    const opts = {
      hostname: options.hostname,
      port: 443,
      method: 'GET',
      path: options.path,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/64.0.3282.140 Safari/537.36',
      }
    }

    const req = https.request(opts, res => {
      let html = '';
      res.setEncoding('utf8');
      res.on('data', (chunk) => {
        html += chunk;
      });
      res.on('end', () => {
        resolve(html);
      });
    })

    req.on('error', (e) => {
      console.error(`Got error: ${e.message}`);
      reject(e);
    });

    req.end();
  });
}

getDataHttps({
  hostname: 'doub.io',
  path: '/sszhfx/',
}).then((html) => {
  const re = /http:\/\/.*?text=ssr:\/\/[0-9a-zA-Z]+/g
  const httpLinks = html.match(re)
  const promiseLists = httpLinks.map(httpLink => {
    // console.log(httpLink)
    const p = URL.parse(httpLink)
    return getDataHttps({
      hostname: p.hostname,
      path: p.path,
    }).then((hhtml) => {
      const ssr_re = /ssr:\/\/[0-9a-zA-Z]+/g
      const ssrLink = hhtml.match(ssr_re)[0]
      if (ssrLink === 'ssr://xxxxxx') {
        return null;
      }
      // console.log(ssrLink);
      let decodeString = new Buffer(ssrLink.replace('ssr://', ''), 'base64').toString();
      decodeString += `&group=${new Buffer("happier88").toString('base64')}`
      const finalSSR = `ssr://${new Buffer(decodeString).toString('base64')}`.replace(/=*$/, '')
      // console.log(finalSSR);
      return finalSSR
      // data.push(finalSSR);
    })
  })
  Promise.all(promiseLists).then(values => {
    const finalResult = new Buffer(values.join('\n')).toString('base64');
    const finalRawResult = new Buffer(values.join('\n')).toString();
    // if(!fs.existsSync('./public')) {
    //   fs.mkdirSync('./public',0777);
    // }
    fs.writeFile('./subscribe', finalResult, error => {
      if(error) {
        console.log('write fail!')
      } else {
        console.log('writing ./subscribe success!')
      }
    });
    fs.writeFile('./subscribe-raw', finalRawResult, error => {
      if(error) {
        console.log('write fail!')
      } else {
        console.log('writing ./subscribe-raw success!')
      }
    });
  });
})
