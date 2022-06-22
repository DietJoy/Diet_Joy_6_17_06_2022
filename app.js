const express = require('express');

const app = express();

const mongoose = require('mongoose');

const path = require('path'); // Importation path de node pour nous donner l'accès au chemin static

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
/*
app.use((req, res, next) => {
    res.json({ message: 'Requête reçue Olé !' });
    next(); 
 });
*/

app.post('/api/sauces', (req, res, next) => {
  console.log(req.body);
  res.status(201).json({message: 'Sauce créé !'});
});


app.get('/api/sauces', (req, res, next) => {
  const sauce = [
    {
      _id: 'oeihfzeoi',
      title: 'Mon premier objet',
      description: 'Les infos de mon premier objet',
      imageUrl: 'https://cdn.pixabay.com/photo/2019/06/11/18/56/camera-4267692_1280.jpg',
      price: 4900,
      userId: 'qsomihvqios',
    },
    {
      _id: 'oeihfzeomoihi',
      title: 'Mon deuxième objet',
      description: 'Les infos de mon deuxième objet',
      imageUrl: 'https://cdn.pixabay.com/photo/2019/06/11/18/56/camera-4267692_1280.jpg',
      price: 2900,
      userId: 'qsomihvqios',
    },
  ];
  res.status(200).json(sauce);
});


app.put('/api/sauces/:id', (req, res, next) => {
  Thing.updateOne({ _id: req.params.id }, { ...req.body, _id: req.params.id })
    .then(() => res.status(200).json({ message: 'Sauce modifiée !'}))
    .catch(error => res.status(400).json({ error }));
});

app.delete('/api/sauces/:id', (req, res, next) => {
  Thing.deleteOne({ _id: req.params.id })
    .then(() => res.status(200).json({ message: 'Sauce supprimée !'}))
    .catch(error => res.status(400).json({ error }));
});


app.use('/images', express.static(path.join(__dirname, 'images'))); // Ajout du chemin static vers le dossier images
 app.use('/api/auth', userRoutes); // enregistrement du router

module.exports = app;