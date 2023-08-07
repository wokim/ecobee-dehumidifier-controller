# Ecobee Dehumidifier Controller

A simple script to automatically turn ON/OFF EcoBi's dehumidifier periodically. Turn off the dehumidifier every **30 minutes, wait for 2 minute**, and then turn it on again.

## Getting Started

```
$ npm install
$ node index.js

Registering App...0JlTruwOANBXcNJNyDidRBHPAzflRPSd
Your ecobee PIN is HDZW-DJGL. Have you completed the input? (yes/no):

# After logging in to Ecobee, select "Add Application" in "My Apps" and enter the above code.

Request access token...
Token OK! Ready!
```

## Deploy (Developer Only)
```
docker buildx create --use
docker buildx build --platform=linux/arm/v7 --load -t ecobee-dehumidifier-controller .
docker tag ecobee-dehumidifier-controller wokim/ecobee-dehumidifier-controller:latest
docker tag ecobee-dehumidifier-controller wokim/ecobee-dehumidifier-controller:0.0.1
docker push wokim/ecobee-dehumidifier-controller:latest
docker push wokim/ecobee-dehumidifier-controller:0.0.1
```