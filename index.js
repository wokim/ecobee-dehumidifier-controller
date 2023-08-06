const axios = require('axios');
const readline = require('readline');
const apiKey = '0JlTruwOANBXcNJNyDidRBHPAzflRPSd';

let accessToken = '';
let refreshToken = '';
let ready = false;

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

(async () => {
  try {
    console.log(`Registering App...${apiKey}`);
    const res = await axios.get(`https://api.ecobee.com/authorize?response_type=ecobeePin&client_id=${apiKey}&scope=smartWrite`);

    rl.question(`Your ecobee PIN is ${res.data.ecobeePin}. Have you completed the input? (yes/no): `, async (answer) => {
      if (answer.toLowerCase() === 'yes') {
        const code = res.data.ecobeePin;
        console.log('Request access token...');
        const xxx = await axios.post(`https://api.ecobee.com/token?grant_type=ecobeePin&code=${code}&client_id=${apiKey}&ecobee_type=jwt`);
        accessToken = xxx.data.access_token;
        refreshToken = xxx.data.refresh_token;
        ready = true;
        console.log('Token OK! Ready!')
      } else {
        return;
      }
    });
  } catch (error) {
    console.error('Error in GET request:', error.message);
  }

})();

setTimeout(async () => {
  if (!ready) return;

  try {
    console.log('Try to refresh token');
    const res = await axios.post(`https://api.ecobee.com/token?grant_type=refresh_token&refresh_token=${refreshToken}&client_id=${apiKey}&ecobee_type=jwt`);
    accessToken = res.data.access_token;
    refreshToken = res.data.refresh_token;
  } catch (e) {
    console.log('Failed to refresh token...');
    console.log(e);
  }
}, 1000 * 60 * 20);

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

setTimeout(async () => {
  if (!ready) return;

  try {
    console.log('Try to turn off dehumidifier');
    const res = await axios.post(`https://api.ecobee.com/1/thermostat?format=json`, {
      "selection": {
          "selectionType":"registered",
          "selectionMatch":""
      },
      "thermostat":{
          "settings": {
              "dehumidifierMode": "off"
          }
      }
    }, {headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json'
    }});
    console.log(`code: ${res.code}`);

    await sleep(10 * 1000);

    console.log('Try to turn on dehumidifier');
    const res2 = await axios.post(`https://api.ecobee.com/1/thermostat?format=json`, {
      "selection": {
          "selectionType":"registered",
          "selectionMatch":""
      },
      "thermostat":{
          "settings": {
              "dehumidifierMode": "on"
          }
      }
    }, {headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json'
    }});
    console.log(`code: ${res2.code}`);

  } catch (e) {
    console.log('Failed to turn off dehumidifier...');
    console.log(e);
  }
}, 1000 * 60 * 20);
