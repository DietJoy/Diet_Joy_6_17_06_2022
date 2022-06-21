const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User= require('../models/User');

exports.signup = (req, res, next) => { // fonction assynchrone 
    bcrypt.hash(req.body.password, 13) // hashage du mot de passe recupéré par le corps de la requete du frontend et salé 13 fois : 1sec
    .then(hash => { // on récupère le Hash du  mot de passe
      const user = new User({  // on utlise le hash enregistré dans un nouvel utilisteur
        email: req.body.email, // on utlise l'adresse fourni dans le corps de la requete
        password: hash // avec le mot de passe hashé
      });
      user.save()  // on utilise la méthode save pour enregistrer l'utilisateur dans la base de donnée 
        .then(() => res.status(201).json({ message: 'Utilisateur créé !' }))
        .catch(error => res.status(400).json({ error }));
    })
    .catch(error => res.status(500).json({ error })); // erreur serveur renvoyée dans un objet
};

exports.login = (req, res, next) => { 
    User.findOne({ email: req.body.email}) // Méthode findOne trouver le user et pour comparer l adresse mail qui est unique avec l adresse mail de l'utilisateur qui tente de se connecter
    .then(user => {
        if (!user) { // si on ne trouve pas de user
          return res.status(401).json({ error: 'Utilisateur non trouvé !' }); // erreur 401 non authorisée 
        }
        bcrypt.compare(req.body.password, user.password) //user trouvé et utlisation de bcrypt pour comparer le mot de passe de la requete avec le hash enregistré dans le doc user
          .then(valid => {
            if (!valid) { // boolean et comparaison fausse:
              return res.status(401).json({ error: 'Mot de passe incorrect !' }); // erreur 401 non authorisée
            }
            res.status(200).json({ // comparaison Vrai et renvoi du token en json
                userId: user._id, 
                token: jwt.sign( // Fonction sign de jsonwebtoken pour encoder le token
                  { userId: user._id }, // user id encodé pour appliqué le bon user id à chaque sauce pour que personne ne puisse modifier la sauce d autrui
                  'EUxExYQzt4fGBkQzwC', // Chaine secrète
                  { expiresIn: '24h' }
              )
            });
          })
          .catch(error => res.status(500).json({ error }));
      })
      .catch(error => res.status(500).json({ error })); // erreur serveur
};