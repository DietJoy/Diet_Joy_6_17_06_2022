const multer = require('multer');

const MIME_TYPES = {
  'image/jpg': 'jpg',
  'image/jpeg': 'jpg',
  'image/png': 'png',
};

const storage = multer.diskStorage({
  destination: (req, file, callback) => {
    callback(null, 'images');
  },
  filename: (req, file, callback) => {
    const name = file.originalname.split(' ').join('_'); //création du nom de l image sans espace avec des _
    const extension = MIME_TYPES[file.mimetype]; //  création du nom d extension
    callback(null, name + Date.now() + '.' + extension);
    // ce qui renvoie un nom de fichier quasi unique avec le name crée, un marqueur temps à la seconde prêt, le point et le type d'extension
  },
});

module.exports = multer({storage}).single('image'); // méthode single pour dire que c est un fichier unique
