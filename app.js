const express = require('express');
const morgan = require('morgan');
const mongoose = require('mongoose');

const { DATABASE } = require('./config');
const logger = require('./utils/logger');
const basicAuth = require('./middleware/basic-auth');
const indexRouter = require('./routes/index');
const usersRouter = require('./routes/users');

const app = express();

app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(basicAuth);

// Connect to database
mongoose.connect(`mongodb://localhost:${DATABASE.PORT}/${DATABASE.NAME}`, {
  useNewUrlParser: true,
});
mongoose.set('useCreateIndex', true);

const db = mongoose.connection;
db.on('error', () => {
  logger.error('Unable to connect to database');
  process.exit(1);
});
db.once('open', () => {
  logger.info('Successfully connected to database');
});

// Assign routes
app.use('/', indexRouter);
app.use('/users', usersRouter);

// Catch 404
app.use((req, res) => res.status(404).send());

module.exports = app;
