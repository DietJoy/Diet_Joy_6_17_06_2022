const Sauce = require("../models/sauces");
const fs = require('fs'); // package qui permet d interagir avec le systeme de fichiers du serveur

//Création de sauce avec POST
exports.createSauce = (req, res, next) => {
    const sauceObject = JSON.parse(req.body.sauce); // Extraire l'objet en Json du corps de la requete = objet utilisable

    const sauce = new Sauce({
      ...sauceObject, // Spread = copie de tous les éléments de req.body
      userId:req.auth.userId, //vérif de l'utilisateur
      likes: 0,
      dislikes: 0,
      userLiked: [],
      userDisliked: [], // initialisation des valeurs à 0 par sécurité
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

  Sauce.findOne({ _id: req.params.id })
    .then((sauce) => {
      if (!sauce) { //si ce n'est pas la bonne sauce
        return res.status(404).json({ message: "Sauce non trouvée" });
      }
      if (sauce.userId !== req.auth.userId) {
        // compare Userid de la bdb avec userId de la requete d'authentification
        return res.status(403).json({ message: "Ce n'est pas votre sauce" });
      }

      const sauceData = { //autenthification de l'utilisateur et récupération des données initiales sur les likes pour éviter une modif des ces données
        userId: req.auth.userId,
        likes: sauce.likes,
        dislikes: sauce.dislikes,
        usersLiked: sauce.usersLiked,
        usersDisliked: sauce.usersDisliked,
      };

      const sauceObject = req.file ? // est ce que req.file existe ?
        {
          ...JSON.parse(req.body.sauce), // si oui on traite la nouvelle image en transformant l objet strignifié en objet JavaScript
          ...sauceData, // on récupère la sauceData
          imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename}` //on concatène et on reconstruit l url complète du fichier enregistré
        } : { // si non on récupère le corps de la requête 
          ...req.body,
          ...sauceData
        }; 

      Sauce.updateOne({ _id: req.params.id }, { ...sauceObject, _id: req.params.id }) //on met à jour
        .then(() => {
          fs.unlink("images/" + sauce.imageUrl.split("/images/")[1], err => { //on supprime l'image qu'on avait initialement publiée du dossier image
            if (err) console.log({errfirst: err}) ;
          });
          res.status(200).json({ message: 'Sauce modifiée !' });
        })
        .catch(error => {
          if (req.file) { // Si il y avait une image dans la tentative de publication qui a échouée
            fs.unlink("images/" + req.file.filename, err => { // on supprime l'image qu on a tenté de publiée qui s est automatiquement enregistrée dans le dossier image
              if (err) console.log({errsecond: err});
            });
          }

          res.status(400).json({ error });
        });
    });
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
  exports.likeSauce = async (req, res, next) => {

    const tokenUserId = req.auth.userId; // constante d'authentification d'utilisateur valable partout
  
    const sauce = await Sauce.findOne({ _id: req.params.id });
    const hasUserLiked = sauce.usersLiked.includes(tokenUserId); // Si l'utlisateur authentifié a liké
    const hasUserDisliked = sauce.usersDisliked.includes(tokenUserId); // si l'utilistaur authentifié a disliké
  
    try {
      switch (req.body.like) {
        case 1: //cas du like
          if (hasUserLiked === false) { //si l'utilisateur n a pas déjà liké
            await Sauce.updateOne({ _id: req.params.id }, { $push: { usersLiked: tokenUserId }, $inc: { likes: +1 } }); // on push dans le tableau et incrément un like avec l'incopérateur 
          }
  
          if (hasUserDisliked) { //si l'utlisateur n a pas déjà disliké
            await Sauce.updateOne({ _id: req.params.id }, { $pull: { usersDisliked: tokenUserId }, $inc: { dislikes: -1 } }); //on push dans le tableau et incrémente un dislike avec l'incopérateur
          }
  
          return res.status(200).json({ message: "Vote effectué" }); 
  
        case -1: //cas du dislike
          if (hasUserDisliked === false) { //si l'utilisateur n'a pas déjà disliké
            console.log("hasUserDisliked === false");
            await Sauce.updateOne({ _id: req.params.id }, { $push: { usersDisliked: tokenUserId }, $inc: { dislikes: +1 } });
          }
  
          if (hasUserLiked) {
            console.log("hasUserLiked"); //si l'utilisateur n'a pas déjà liké
            await Sauce.updateOne({ _id: req.params.id }, { $pull: { usersLiked: tokenUserId }, $inc: { likes: -1 } });
          }
  
          return res.status(200).json({ message: "Vote effectué" });
  
        case 0: //cas neutre
          if (hasUserDisliked) { //si l'utilisateur veut retirer son dislike
            await Sauce.updateOne({ _id: req.params.id }, { $pull: { usersDisliked: tokenUserId }, $inc: { dislikes: -1 } }); //on retire un dislike du compteur et du tableau
          }
  
          if (hasUserLiked) { //si l'utilisateur veut retirer son like
            await Sauce.updateOne({ _id: req.params.id }, { $pull: { usersLiked: tokenUserId }, $inc: { likes: -1 } }); //on retire un like du compteur et du tableau
          }
  
          return res.status(200).json({ message: "Je n'ai plus d'avis sur cette sauce." });
      }
    }
    catch (err) {
      return res.status(400).json(err); 
    }
  
  };