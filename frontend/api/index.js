// Vercel Serverless Function Handler inside frontend/api directory
const path = require('path');
const fs = require('fs');

let serverPath = path.resolve(__dirname, '../../backend/server.js');
if (!fs.existsSync(serverPath)) {
  serverPath = path.resolve(__dirname, '../backend/server.js');
}
if (!fs.existsSync(serverPath)) {
  serverPath = path.resolve(__dirname, 'backend/server.js');
}

const app = require(serverPath);
module.exports = app;
