const http = require('http');
const https = require('https');
const axios = require('axios');
const cheerio = require('cheerio');

const server = http.createServer(async (req, res) => {
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

    const fetchTitle = async (address) => {
      try {
        if (!address.startsWith('http://') && !address.startsWith('https://')) {
          address = 'http://' + address; // Assume HTTP if no protocol is specified
        }

        const response = await axios.get(address);
        const html = response.data;
        const $ = cheerio.load(html);
        const title = $('title').text().trim();
        return title;
      } catch (error) {
        return 'NO RESPONSE';
      }
    };

    try {
      const titles = await Promise.all(addresses.map(address => fetchTitle(address)));

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
    } catch (error) {
      res.writeHead(500);
      res.end('Error fetching titles.');
    }
  } else {
    res.writeHead(404);
    res.end('404 Not Found');
  }
});

const port = 3000;
server.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});
