const express = require('express');
const cors = require('cors');
const fs = require('fs');
const csv = require('fast-csv');

const app = express();
app.use(cors());

app.get('/data', (req, res) => {
  const data = [];
  fs.createReadStream('./data.csv')
    .pipe(csv.parse({ headers: true }))
    .on('data', row => data.push(row))
    .on('end', () => res.json(data));
});

app.listen(3000, () => console.log('Server running on port 3000'));
