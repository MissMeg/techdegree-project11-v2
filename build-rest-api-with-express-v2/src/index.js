'use strict';

// load modules
const express = require('express');
const morgan = require('morgan');
const mongoose = require('mongoose');
const routes = require('./routes');
const seeder = require('mongoose-seed');
const {data} = require('./data/data.js');

const app = express();

//Database Connection
const db = mongoose.connection;
mongoose.connect('mongodb://127.0.0.1/myapp');
db.on('error', console.error.bind(console, 'Database connection error:'));
db.once('open', console.log.bind(console, 'Database connection established.'));

app.use(express.json());
app.use(express.urlencoded({extended: false }));
app.use('/api', routes);

//SEEDER
const seedDB = (req, res, next) => {
  seeder.connect('mongodb://127.0.0.1/myapp', (err, db) => {
    console.log('Connected - seeder');

    //Load mongoose files
    seeder.loadModels([
      './src/models/users.js',
      './src/models/courses.js',
      './src/models/reviews.js'
    ]);

    //Clear specified collections
    seeder.clearModels(['User', 'Review', 'Course'], () => {
      //Callback to populate DB
      seeder.populateModels(data, () => {});
    });

    if (err) {
      err = new Error();
      err.message = 'Seeding Failed';
      err.status = 500;
      return next(err);
    }
  });
};

seedDB();

// set our port
app.set('port', process.env.PORT || 5000);

// morgan gives us http request logging
app.use(morgan('dev'));

// setup our static route to serve files from the "public" folder
app.use('/', express.static('public'));

// catch 404 and forward to global error handler
app.use(function(req, res, next) {
  let err = new Error('File Not Found');
  err.status = 404;
  next(err);
});

// Express's global error handler
app.use(function(err, req, res, next) {
  res.status(err.status || 500).json({
    message: err.message,
    error: {}
  });
});

// start listening on our port
const server = app.listen(app.get('port'), function() {
  console.log('Express server is listening on port ' + server.address().port);
});
