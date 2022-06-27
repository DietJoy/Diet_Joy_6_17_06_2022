const express = require('express');
const router = express.Router();

const saucesCrtl = require("../controllers/sauces");

const auth = require('../middleware/auth');
const multer = require('../middleware/multer-config');

// Les routes:


router.get('/', auth, saucesCrtl.getAllSauces);
router.post('/', auth, multer, saucesCrtl.createSauce);
router.get('/:id', auth, saucesCrtl.getOneSauce);
router.put('/:id', auth, multer, saucesCrtl.modifySauce);
router.delete('/:id', auth, saucesCrtl.deleteSauce);
router.post('/:id/like', auth, saucesCrtl.likeSauce); 



module.exports = router;