const express = require('express');
const app = express();
const helmet = require("helmet"); // Helmet aide à sécuriser Express
const mongoose = require('mongoose');
require('dotenv').config()

const path = require('path'); // Importation path de node pour nous donner l'accès au chemin static

const userRoutes = require('./routes/user'); //importation du router user
const sauceRoutes = require('./routes/sauces');

const rateLimit = require("express-rate-limit"); // Séurité pour limiter les demandes répétée à l'API

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: "Too many request from this IP",
});

const dotenv = require('dotenv');
dotenv.config();

//Connection de l'Api à la base de donnée Mongoose:
mongoose.connect(process.env.MONGODB_CONNECT)
  .then(() => console.log('Connexion à MongoDB réussie !'))
  .catch(() => console.log('Connexion à MongoDB échouée !'));

//Middleware qui intercepte toutes les requetes qui ont un contenu Json et le met à dipo dans req.body
app.use(express.json());

//*CORS
app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');  // /*/ accès à API depuis n'importe quelle origine
    res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content, Accept, Content-Type, Authorization');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
    next();
  });
  
/*
app.use((req, res, next) => {
    res.json({ message: 'Requête reçue !' });
    next(); 
 });
*/

app.use('/images', express.static(path.join(__dirname, 'images'))); // Ajout du chemin static vers le dossier images
app.use('/api/auth', userRoutes); // enregistrement du router
app.use('/api/sauces', sauceRoutes);
app.use(limiter);
app.use(helmet());

module.exports = app; // Celà permet d'utiliser les modules sur les autres fichiers