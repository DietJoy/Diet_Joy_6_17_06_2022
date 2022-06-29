const Sauce = require("../models/sauces");

const fs = require('fs'); // package qui permet d interagir avec le systeme de fichiers du serveur


//Création de sauce avec POST
exports.createSauce = (req, res, next) => {
    const sauceObject = JSON.parse(req.body.sauce); // Extraire l'objet en Json du corps de la requete = objet utilisable
    /*
    gérer sauceObject.userId
     userId: req.auth.userId,
    */
    const sauce = new Sauce({
      ...sauceObject, // Spread = copie de tous les éléments de req.body
      imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename}` // Génération de l'url de l image
    });
    console.log(sauce);
    sauce.save() //enregistre la sauce dans la BDD
      .then(() => res.status(201).json({ message: 'Sauce enregistrée !'}))
      .catch(error => res.status(400).json({ error }));
  };

  //Affichage d'une sauce par son id avec GET
  exports.getOneSauce = (req, res, next) => {
    Sauce.findOne({ _id: req.params.id }) // cherche 1 objet dans la bdd ayant _id qui est le même que l id dans le corps de la requete
      .then((sauce) => res.status(200).json(sauce))
      .catch((error) => res.status(404).json({ error }));
  };

  // Affichage de toutes les sauces avec GET
exports.getAllSauces = (req, res, next) => {
  Sauce.find() // cherche toutes les sauces dans le BDD avec moongose
    .then((sauces) => res.status(200).json(sauces))
    .catch((error) => error.status(500).json({ error }));
};

  //Modification de sauce avec PUT
  exports.modifySauce = (req, res, next) => {
    /* faire une vérif d utilisateur
    Sauce.findOne({ _id: req.params.id })
    .then((sauce) => {
      if (!sauce) {
        res.status(404).json({ error: new Error("Objet non trouvé") });
      }
      if (sauce.userId !== req.auth.userId) {
        // compare Userid de la bdb avec userId de la requete d'authentification
        res.status(403).json({ error: new Error("Requete non authorisée") });
    */
    const sauceObject = req.file ? // est ce que req.file existe ?
      {
        ...JSON.parse(req.body.sauce), // si oui on traite la nouvelle image en transformant l objet strignifié en objet JavaScript
        imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename}` //on concatène et on reconstruit l url complète du fichier enregistré
      } : { ...req.body }; // si non on récupère le corps de la requête en traitant l objet entrant
    
    Sauce.updateOne({ _id: req.params.id }, { ...sauceObject, _id: req.params.id })
      .then(() => res.status(200).json({ message: 'Sauce modifiée !'}))
      .catch(error => res.status(400).json({ error }));
  };


  //Supression d'une sauce avec DELETE
  exports.deleteSauce = (req, res, next) => {
    Sauce.findOne({ _id: req.params.id }) // on utilise l id que nous recevons en parametre pour acceder à la sauce de la BDD
      .then(sauce => {
        if (sauce.userId !== req.auth.userId ) { // Vérification de sécurité : est ce que l'utilisateur qui a crée la sauce est différent de celui qui essaye de la supprimer?
return res.status(401).json({ message: " Vous n'avez pas le droit !"}) // Si l'user est différent renvoie d'une 401
        }
          
        const filename = sauce.imageUrl.split('/images/')[1]; // on retrouve la sauce grâce à son segment /images/
        
      fs.unlink(`images/${filename}`, () => { // fonction unlike du package fs pour supprimer le fichier que l on cherchait
          Sauce.deleteOne({ _id: req.params.id }) // on supprime la sauce
            .then(() => res.status(200).json({ message: 'Sauce supprimée !'}))
            .catch(error => res.status(400).json({ error }));
        });
      })
      .catch(error => res.status(500).json({ error }));
  };

  //Gestion des Likes/Dislikes et retour neutre
exports.likeSauce = (req, res, next) => {
  /*
  // Chercher si l'utilisateur a déjà liker et veut re donner un like à la sauce
  if (sauce.userLiked.includes(req.body.userId)&& req.body.like ===1) {
    res.status(409).json({ message: "Tu ne peux aimer qu'une seule fois cette sauce"}); // conflit
  }
  //Chercher si l'utilisateur a dejà disliker et veut re donner un dislike à la sauce
  if ( sauce.userDisliked.includes(req.body.userId)&& req.body.like === -1) {
    res.status(409).json({ message: "Tu ne peux disliker qu'une seule fois cette sauce"}); //conflit
  }
  */
  if (req.body.like === 1) { // Si je like
      Sauce.updateOne( {_id:req.params.id}, { $push: { usersLiked: req.body.userId }, $inc: { likes: +1 } })
      //Avec la méthode de mise à jour, sur la sauce/ On ajoute au tableau des utilsateurs qui aiment l'utilisateur qui a cliqué j aime/  avec l'incopérateur on incrémente le champ like d'un +1
          .then(() => res.status(200).json({ message: "J'aime cette sauce !"}))
          .catch(error => res.status(400).json({ error }));
  } else if (req.body.like === -1) {  // Sinon si je dislike
      Sauce.updateOne( {_id:req.params.id}, { $push: { usersDisliked: req.body.userId }, $inc: { dislikes: +1 } })
          .then(() => res.status(200).json({ message: "Je n'aime pas cette sauce !"}))
          .catch(error => res.status(400).json({ error }));
  } else {  // Sinon Je n'ai plus d'avis
      Sauce.findOne({ _id: req.params.id })
          .then(sauce => {
          if (sauce.usersLiked.includes(req.body.userId)) { //Si je retire mon like
              Sauce.updateOne( {_id:req.params.id}, { $pull: { usersLiked: req.body.userId }, $inc: { likes: -1 } })
              .then(() => res.status(200).json({ message: "Je n'ai plus d'avis sur cette sauce."}))
              .catch(error => res.status(400).json({ error }))
          } else if (sauce.usersDisliked.includes(req.body.userId)) { // Sinon si je retire mon dislike
              Sauce.updateOne( {_id:req.params.id}, { $pull: { usersDisliked: req.body.userId }, $inc: { dislikes: -1 } })
              .then(() => res.status(200).json({ message: "Je n'ai plus d'avis sur cette sauce."}))
              .catch(error => res.status(400).json({ error }))
          }
          })
          .catch(error => res.status(400).json({ error }));
  }
};