const passwordValidator = require("password-validator");

const passwordSchema = new passwordValidator();

passwordSchema
  .is()
  .min(6, "minimum 6 ") // Minimum length 6
  .is()
  .max(20, "max 30") // Maximum length 30
  .has()
  .lowercase("1", "mini") // Must have lowercase letters
  .has()
  .not()
  .spaces(); // Should not have spaces
  
  /*
  .is()
  .not()
  .oneOf(["Passw0rd", "Password123", "Azerty", "Azerty123" , "Piiquante"]); // Blacklist these values;
  */

// Vérification de la qualité du password par rapport au schéma

module.exports = (req, res, next) => {
  const password = req.body.password;

  if (passwordSchema.validate(password)) { // Si le mot de passe correspond au schema de validation ok next
    return next();
  } else {
    return res.status(400).json({ error: passwordSchema.validate(password, { list: true }) });
  }
};

// TODO: prévoir des messages d'erreurs sur le front en cas de création de mot de passe invalide