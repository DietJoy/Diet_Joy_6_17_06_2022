const Sauce = require("../models/sauces");

const fs = require('fs'); // package qui permet d interagir avec le systeme de fichiers du serveur


//Création de sauce avec POST
exports.createSauce = (req, res, next) => {
    const sauceObject = JSON.parse(req.body.sauce);
    const sauce = new Sauce({
      ...sauceObject,
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
    const sauceObject = req.file ? // est ce que req.file existe ?
      {
        ...JSON.parse(req.body.thing), // si oui on traite la nouvelle image en transformant l objet strignifié en objet JavaScript
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