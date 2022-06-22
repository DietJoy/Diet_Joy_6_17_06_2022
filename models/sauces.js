const mongoose = require('mongoose');

const sauceSchema = mongoose.Schema({
    userId: { type: String, required: true }, // l identifiant MongoDb unique de l'utilisateur qui a crée la sauce
    name: { type: String, required: true }, //nom de la sauce
    manufacturer: {type: String, required: true}, //fabricant de la sauce
    description: { type: String, required: true }, //description de la sauce
    mainPepper: { type: String, required: true }, //le principal ingrédient épicé de la sauce
    imageUrl: { type: String, required: true }, //l'url de l'image de la sauce téléchargée par l'utilisateur
    heat: { type : Number, required: true }, // Nombre entre 1 et 10 décrivant la sauce
    likes: { type : Number, required: true }, // Nombre d'utilisateurs qui likent la sauce
    dislikes: { type : Number, required: true }, // Nombre d'utilisateurs qui dislikent la sauce
    usersLiked: { type: ["String <userId>"], required: true}, // tableau des identifiants des utilisateurs qui ont aimé la sauce
    usersDisliked: { type: ["String <userId>"], required: true}, // tableau des identifiants des utilisateurs qui n'ont pas aimé
});

module.exports = mongoose.model('sauce', sauceSchema);