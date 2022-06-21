const express = require('express');

const app = express();

const mongoose = require('mongoose');

const userRoutes = require('./routes/user'); //importation du router

//Connection de l'Api à la base de donnée Mongoose:
mongoose.connect('mongodb+srv://joy:joy180687@cluster0.v9ywjaz.mongodb.net/Piiquante?retryWrites=true&w=majority')
  .then(() => console.log('Connexion à MongoDB réussie !'))
  .catch(() => console.log('Connexion à MongoDB échouée !'));


//Middleware qui intercepte toutes les requetes qui ont un contenu Json et le met à dipo dans req.body
app.use(express.json());

//*CORS
app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content, Accept, Content-Type, Authorization');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
    next();
  });

app.use((req, res, next) => {
    res.json({ message: 'Requête reçue Olé !' });
    next(); 
 });

 app.use('/api/auth', userRoutes); // enregistrement du router

module.exports = app;