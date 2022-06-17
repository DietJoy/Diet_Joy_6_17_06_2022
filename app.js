const express = require('express');

const app = express();

app.use((req, res) => {
    res.json({ message: 'Requête reçue Olé !' }); 
 });

module.exports = app;