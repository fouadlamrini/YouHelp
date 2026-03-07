const yup = require("yup");

const createUserSchema = yup.object({
  name: yup
    .string()
    .trim()
    .required("Le nom est requis.")
    .min(2, "Le nom doit contenir au moins 2 caractères."),
  email: yup
    .string()
    .trim()
    .email("Veuillez entrer une adresse email valide.")
    .required("L'email est requis."),
  password: yup
    .string()
    .required("Le mot de passe est requis.")
    .min(6, "Le mot de passe doit contenir au moins 6 caractères."),
  role: yup.string().nullable(),
  campus: yup.string().nullable(),
  class: yup.string().nullable(),
  level: yup.string().nullable(),
  profilePicture: yup.string().nullable(),
});

const updateUserSchema = yup.object({
  name: yup.string().trim().optional(),
  email: yup.string().trim().email("Veuillez entrer une adresse email valide.").optional(),
  role: yup.string().nullable().optional(),
  campus: yup.string().nullable().optional(),
  class: yup.string().nullable().optional(),
  level: yup.string().nullable().optional(),
  profilePicture: yup.string().nullable().optional(),
});

module.exports = {
  createUserSchema,
  updateUserSchema,
};
