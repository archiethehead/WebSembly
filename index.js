const express = require('express');
const app = express();

// Debugging
const chalk = require('chalk');
const debug = require('debug')('app');
const morgan = require('morgan');
app.use(morgan('tiny'))

const path = require('path');
app.use(express.static(__dirname + '/public'));

// Route handling
app.get('/', (req, res) => {

    res.sendFile(path.join(__dirname, 'Public/HTML/main.html'));

});

// Server setup
app.listen(8080, () => {

    debug('Server listening on port ' + chalk.green('3000'));
    
});