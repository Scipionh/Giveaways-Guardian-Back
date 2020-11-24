import https = require('https');

export class SSEService {
  public updateHealthBar(totalHealth, actualHealth, damageDealt?, dead?): void {
    const data = JSON.stringify({
      totalHealth: totalHealth,
      actualHealth: actualHealth,
      damageDealt: damageDealt,
      dead: dead
    });
    const options = {
      hostname: 'localhost',
      port: 5000,
      path: '/sendEvent',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': data.length
      }
    };

    const req = https.request(options, (res) => {
      console.log(`statusCode: ${res.statusCode}`);

      res.on('data', (d) => {
        process.stdout.write(d);
      })
    });

    req.on('error', (error) => {
      console.error(error)
    });
    req.write(data);
    req.end();
  };
}