const yup = require("yup");

const registerSchema = yup.object({
  name: yup.string().trim().required("Le nom est requis."),
  email: yup
    .string()
    .trim()
    .email("Veuillez entrer une adresse email valide.")
    .required("L'email est requis."),
  password: yup
    .string()
    .required("Le mot de passe est requis.")
    .min(6, "Le mot de passe doit contenir au moins 6 caractères."),
});

const loginSchema = yup.object({
  email: yup
    .string()
    .trim()
    .email("Veuillez entrer une adresse email valide.")
    .required("L'email est requis."),
  password: yup.string().required("Le mot de passe est requis."),
});

const changePasswordSchema = yup.object({
  currentPassword: yup.string().required("Current password and new password required"),
  newPassword: yup.string().required("Current password and new password required"),
});

const completeProfileSchema = yup.object({
  campus: yup.string().nullable(),
  class: yup.string().nullable(),
  level: yup.string().nullable(),
  specialite: yup.string().nullable(),
  profilePicture: yup.string().nullable(),
});

module.exports = {
  registerSchema,
  loginSchema,
  changePasswordSchema,
  completeProfileSchema,
};
