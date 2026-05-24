const express = require('express');
const path = require('path');

const app = express();

// Route handling
app.get('/', (req, res) => {

    res.sendFile(path.join(__dirname, '../HTML/main.html'));


});

// Server setup
app.listen(8080, () => {

    console.log('server listening on port 8080');
    
});