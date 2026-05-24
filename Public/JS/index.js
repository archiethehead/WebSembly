const express = require('express');

// Debugging
const chalk = require('chalk');
const debug = require('debug')('app');
const morgan = require('morgan');

const path = require('path');

const app = express();
app.use(morgan('tiny'))

// Route handling
app.get('/', (req, res) => {

    res.sendFile(path.join(__dirname, '../HTML/main.html'));


});

// Server setup
app.listen(8080, () => {

    debug('Server listening on port ' + chalk.green('3000'));
    
});