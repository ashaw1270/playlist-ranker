const jwt = require('jsonwebtoken');
const fs = require('fs');

const privateKey = fs.readFileSync('AuthKey_689G78VLXW.p8').toString(); // Path to your .p8 key file
const teamId = 'H8FRY42353'; // Your Apple Developer Team ID
const keyId = '689G78VLXW';   // Your MusicKit Key ID

const token = jwt.sign({}, privateKey, {
  algorithm: 'ES256',
  expiresIn: '180d', // Maximum validity is 6 months
  issuer: teamId,
  header: {
    alg: 'ES256',
    kid: keyId
  }
});

console.log(token);