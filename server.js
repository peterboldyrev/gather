const express = require('express');
const path = require('path');
const PORT = process.env.PORT || 3001;
const app = express();
const mongoose = require('mongoose');

if (process.env.NODE_ENV === 'production') {
  app.use(express.static('client/build'));
}
mongoose.connect(process.env.MONGODB_URI || 'mongodb://admin:75llama-hunter@ds031597.mlab.com:31597/heroku_mn5v1j8t');

app.get('*', function(req, res) {
  res.sendFile(path.join(__dirname, './client/build/index.html'));
});

app.listen(PORT, function() {
  console.log(`🌎 ==> API server now on port ${PORT}!`);
});
