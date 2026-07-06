const app = require('./app');

const port = Number(process.env.PORT) || 4000;

app.listen(port, () => {
  console.log(`RiverCity Courier backend listening on port ${port}`);
});

