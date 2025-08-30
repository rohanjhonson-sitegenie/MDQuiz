// This file exports the Express app for Vercel serverless deployment
// Import the default export from the compiled TypeScript
const app = require('../dist/index.js').default;

// Export for Vercel
module.exports = app;