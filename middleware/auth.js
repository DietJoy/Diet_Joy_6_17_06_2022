const jwt = require('jsonwebtoken'); // package pour vérifier le token
require('dotenv').config()

module.exports = (req, res, next) => {
  try {
    const token = req.headers.authorization.split(' ')[1]; // récupération du token
    //( split crée le tableau , on enleve l espace et on recupre l element 1 soit celui apres bearer)
    const decodedToken = jwt.verify(token, process.env.TOKEN_SECRET); // décodage du token avec la fonction vérify et la clé secrète
    const userId = decodedToken.userId; // on récupère le user id codé dans le token
    req.auth = {userId}; //attribution de l user id a l objet requete pour sécuriser
    if (req.body.userId && req.body.userId !== userId) {
      // on vérifie que l'user id est le bon
      throw 'Invalid user ID';
    } else {
      next();
    }
  } catch (error) {
    res.status(401).json({error: Error | 'Requête non authentifiée!'});
  }
};
