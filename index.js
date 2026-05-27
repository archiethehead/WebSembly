const port  = 8080;
const express = require('express');
const app = express();

// Debugging includes
const chalk = require('chalk');
const debug = require('debug')('app');
const morgan = require('morgan');
app.use(morgan('tiny'))

// Filepath includes
const path = require('path');
app.use(express.static(__dirname + '/public'));

app.get('/', (req, res) => {

    res.sendFile(path.join(__dirname, 'Public/HTML/main.html'));

});

app.listen(port, () => {

    debug('Server listening on port ' + chalk.green(port));
    
});