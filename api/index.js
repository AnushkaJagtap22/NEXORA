// Vercel Serverless Function Entrypoint for Nexora Express Backend
// Delegates all incoming Vercel /api/* requests directly to backend/server.js Express app
const app = require('../backend/server.js');

module.exports = app;
