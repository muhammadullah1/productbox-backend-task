const http = require('http');
const axios = require('axios');
const cheerio = require('cheerio');
const { from } = require('rxjs');
const { mergeMap, toArray } = require('rxjs/operators');

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

    const getTitle = (address) => {
      address = addProtocolIfNeeded(address); // Ensure address has the protocol
      return from(axios.get(address))
        .pipe(
          mergeMap(response => {
            const html = response.data;
            const $ = cheerio.load(html);
            const title = $('title').text().trim();
            return [{ address, title }]; // Wrap the result in an array
          })
        );
    };

    const renderHTML = (titles) => {
      let html = `
        <html>
        <head></head>
        <body>
          <h1>Following are the titles of given websites:</h1>
          <ul>
      `;

      titles.forEach(({ address, title }) => {
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

    from(addresses)
      .pipe(
        mergeMap(address => getTitle(address)),
        toArray() // Collect the results as an array
      )
      .subscribe(
        titles => renderHTML(titles),
        error => {
          res.writeHead(500);
          res.end('Error fetching titles.');
        }
      );
  } else {
    res.writeHead(404);
    res.end('404 Not Found');
  }
});

const port = 3000;
server.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});

//====================================//
// In this upper code, the main control flow strategy used is:Reactive Programming with RxJS (Reactive Extensions for JavaScript)
// The code uses RxJS, a library for reactive programming, to handle the control flow and manage asynchronous operations in a declarative and functional style. The key components from RxJS used in this code are the from function to convert arrays to Observables, and operators like mergeMap and toArray to handle the asynchronous operations.
//=====================================//