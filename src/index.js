import fs from 'fs';
import https from 'https';
import http from 'http';
import app from './server';

const privateKey = fs.readFileSync('sslcert/localhost.key');
const certificate = fs.readFileSync('sslcert/localhost.crt');
const credentials = {key: privateKey, cert: certificate};
let server,
    currentApp = app;
    
server = https.createServer(credentials,app);

server.listen(process.env.PORT || 3000, error => {
  if (error) {
    console.log(error);
  }

  console.log('🚀 started');
});

if (module.hot) {
  console.log('✅  Server-side HMR Enabled!');

  module.hot.accept('./server', () => {
    console.log('🔁  HMR Reloading `./server`...');
    server.removeListener('request', currentApp);
    const newApp = require('./server').default;
    server.on('request', newApp);
    currentApp = newApp;
  });
}
