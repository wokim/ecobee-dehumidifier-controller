const axios = require('axios');
const readline = require('readline');
const apiKey = '0JlTruwOANBXcNJNyDidRBHPAzflRPSd';

let accessToken = '';
let refreshToken = '';
let ready = false;
let interval = 1000 * 60 * 29;

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

const date = new Date();

function now() {
  return date.toLocaleString('ko-KR', {timeZone: "Asia/Seoul"});
}

(async () => {
  try {
    rl.question('Please enter interval (min): ', async (answer) => {
      const min = !answer ? 29 : parseInt(answer, 10);
      console.log(`[${now()}] ${min}min`);
      interval = 1000 * 60 * min;

      rl.question(`[${now()}] Do you have access/refresh token? (yes/no): `, async (answer) => {
        if (answer.toLowerCase() === 'yes') {
          rl.question(`[${now()}] Enter the access token and refresh token separated by a spcae:`, async (answer) => {
            const split = answer.split(' ');
            const [a, r] = split;
            console.log(`Access Token: ${a}`);
            console.log(`Refresh Token: ${r}`);
            accessToken = a;
            refreshToken = r;
  
            await refresh();
            ready = true;
          });
        } else {
          console.log(`[${now()}] Registering App. App Key is ${apiKey}`);
          const res = await axios.get(`https://api.ecobee.com/authorize?response_type=ecobeePin&client_id=${apiKey}&scope=smartWrite`);
  
          rl.question(`[${now()}] Your ecobee PIN is ${res.data.ecobeePin}. Have you completed the input? (yes/no): `, async (answer) => {
            if (answer.toLowerCase() === 'yes') {
              const code = res.data.code;
              console.log(`[${now()}] Requesting access token...`);
              const xxx = await axios.post(`https://api.ecobee.com/token?grant_type=ecobeePin&code=${code}&client_id=${apiKey}&ecobee_type=jwt`);
              accessToken = xxx.data.access_token;
              refreshToken = xxx.data.refresh_token;
              ready = true;
              console.log(`[${now()}] Access token: ${accessToken}`);
              console.log(`[${now()}] Refresh token: ${refreshToken}`);
              console.log(`[${now()}] Token acquired. Ready to go!`);
            } else {
              console.log(`[${now()}] You must enter PIN. Terminating app...`);
              return;
            }
          });
        }
      });
    });
  } catch (error) {
    console.error('Error in GET request:', error.message);
  }
})();

async function refresh() {
  try {
    console.log(`[${now()}] Try to refresh token`);
    const res = await axios.post(`https://api.ecobee.com/token?grant_type=refresh_token&refresh_token=${refreshToken}&client_id=${apiKey}&ecobee_type=jwt`);
    accessToken = res.data.access_token;
    refreshToken = res.data.refresh_token;
    console.log(`[${now()}] Access token: ${accessToken}`);
    console.log(`[${now()}] Refresh token: ${refreshToken}`);
  } catch (e) {
    console.log(`[${now()}] Failed to refresh token. Terminating app...`);
  }
}

setInterval(async () => {
  if (!ready) return;

  await refresh();
}, 1000 * 60 * 40);

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

setInterval(async () => {
  if (!ready) return;

  try {
    console.log(`[${now()}] Try to turn off dehumidifier`);
    await axios.post(`https://api.ecobee.com/1/thermostat?format=json`, {
      "selection": {
          "selectionType":"registered",
          "selectionMatch":""
      },
      "thermostat":{
          "settings": {
              "dehumidifierMode": "off"
          }
      }
    }, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      }
    });
    console.log(`[${now()}] Dehumidifier turned off`);

    console.log(`[${now()}] Sleep 1 min...`);
    await sleep(1 * 60 * 1000);

    console.log(`[${now()}] Try to turn on dehumidifier`);
    await axios.post(`https://api.ecobee.com/1/thermostat?format=json`, {
      "selection": {
          "selectionType":"registered",
          "selectionMatch":""
      },
      "thermostat":{
          "settings": {
              "dehumidifierMode": "on"
          }
      }
    }, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      }
    });
    console.log(`[${now()}] Dehumidifier turned on`);

  } catch (e) {
    console.log(`[${now()}] Failed to control dehumidifier. Terminating app...`);
    console.log(e);
  }
}, interval);
