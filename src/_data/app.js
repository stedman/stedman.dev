module.exports = {
  environment: process.argv.includes('--watch') ? 'dev' : '',
  now: new Date(),
};
