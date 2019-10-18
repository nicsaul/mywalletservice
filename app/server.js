const { APP_NAME, PORT, ENV } = require('./config');
const app = require('./app');

app.listen(PORT, () => {
  console.log(`${APP_NAME} running in ${ENV} mode`);
  console.log(`Listening on port ${PORT}...`);
});
