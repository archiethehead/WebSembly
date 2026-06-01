const express = require('express');
const website_router = express();

const path = require('path');
website_router.use(express.static(__dirname + '/../../public'));

website_router.get('/', (req, res) => {

    res.sendFile(path.join(__dirname, '/../../public/HTML/main.html'));

});

website_router.get('/InstructionSet', (req, res) => {

    res.sendFile(path.join(__dirname, '/../../public/Instruction-Set.pdf'));

});

module.exports = website_router;