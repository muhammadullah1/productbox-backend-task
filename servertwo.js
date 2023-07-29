// const http = require('http');
// const async = require('async');
// const axios = require('axios');
// const cheerio = require('cheerio');

// const server = http.createServer((req, res) => {
//   if (req.method === 'GET' && req.url.startsWith('/I/want/title')) {
//     const addresses = req.url.split('?')[1]
//       .split('&')
//       .filter(param => param.startsWith('address='))
//       .map(param => param.replace('address=', ''));
  
//     if (!addresses || addresses.length === 0) {
//       res.writeHead(400);
//       res.end('Invalid addresses provided.');
//       return;
//     }
  
//     const fetchTitle = (address, callback) => {
//       axios.get(address)
//         .then((response) => {
//           const html = response.data;
//           const $ = cheerio.load(html);
//           const title = $('title').text().trim();
//           callback(null, title);
//         })
//         .catch((error) => {
//           callback(null, 'NO RESPONSE');
//         });
//     };
  
//     const renderHTML = (err, titles) => {
//       if (err) {
//         res.writeHead(500);
//         res.end('Error fetching titles.');
//         return;
//       }

//       let html = `
//         <html>
//         <head></head>
//         <body>
//           <h1>Following are the titles of given websites:</h1>
//           <ul>
//       `;
  
//       addresses.forEach((address, index) => {
//         const title = titles[index];
//         html += `<li>${address} - "${title}"</li>\n`;
//       });
  
//       html += `
//           </ul>
//         </body>
//         </html>
//       `;
  
//       res.writeHead(200, { 'Content-Type': 'text/html' });
//       res.end(html);
//     };
  
//     async.map(addresses, fetchTitle, renderHTML);
//   } else {
//     res.writeHead(404);
//     res.end('404 Not Found');
//   }
// });

// const port = 3000;
// server.listen(port, () => {
//   console.log(`Server listening on port ${port}`);
// });


const http = require('http');
const https = require('https');
const async = require('async');
const axios = require('axios');
const cheerio = require('cheerio');

const server = http.createServer((req, res) => {
  if (req.method === 'GET' && req.url.startsWith('/I/want/title')) {
    const addresses = req.url.split('?')[1]
      .split('&')
      .filter(param => param.startsWith('address='))
      .map(param => param.replace('address=', ''));

    if (!addresses || addresses.length === 0) {
      res.writeHead(400);
      res.end('Invalid addresses provided.');
      return;
    }

    const addProtocolIfNeeded = (address) => {
      return address.startsWith('http://') || address.startsWith('https://')
        ? address
        : `http://${address}`;
    };

    const fetchTitle = (address, callback) => {
      address = addProtocolIfNeeded(address); // Ensure address has the protocol
      axios.get(address)
        .then((response) => {
          const html = response.data;
          const $ = cheerio.load(html);
          const title = $('title').text().trim();
          callback(null, title);
        })
        .catch((error) => {
          callback(null, 'NO RESPONSE');
        });
    };

    const renderHTML = (err, titles) => {
      if (err) {
        res.writeHead(500);
        res.end('Error fetching titles.');
        return;
      }

      let html = `
        <html>
        <head></head>
        <body>
          <h1>Following are the titles of given websites:</h1>
          <ul>
      `;

      addresses.forEach((address, index) => {
        const title = titles[index];
        html += `<li>${address} - "${title}"</li>\n`;
      });

      html += `
          </ul>
        </body>
        </html>
      `;

      res.writeHead(200, { 'Content-Type': 'text/html' });
      res.end(html);
    };

    async.map(addresses, fetchTitle, renderHTML);
  } else {
    res.writeHead(404);
    res.end('404 Not Found');
  }
});

const port = 3000;
server.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});
