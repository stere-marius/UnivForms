import { body } from "express-validator";

const registerUserValidator = () => {
  return [
    body("nume").trim().notEmpty().withMessage("Numele nu trebuie sa fie vid"),
    body("prenume", "Prenumele nu trebuie sa fie vid").trim().notEmpty(),
    body("email", "Adresa de email invalida").isEmail(),
    body("parola", "Parola trebuie sa contina minimum 6 caractere").isLength({
      min: 6,
    }),
  ];
};

const updateUserProfileValidator = () => {
  return [
    body("nume").trim().notEmpty().withMessage("Numele nu trebuie sa fie vid"),
    body("prenume", "Prenumele nu trebuie sa fie vid").trim().notEmpty(),
    body("email", "Adresa de email invalida").optional().isEmail(),
  ];
};

const updateUserEmailValidator = () => {
  return [body("email", "Adresa de email invalida").isEmail()];
};

export {
  registerUserValidator,
  updateUserProfileValidator,
  updateUserEmailValidator,
};
