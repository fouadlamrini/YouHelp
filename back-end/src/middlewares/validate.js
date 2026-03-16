
function validate(schema) {
  return async (req, res, next) => {
    try {
      const value = await schema.validate(req.body, {
        abortEarly: false,
        stripUnknown: true,
      });
      req.body = value;
      next();
    } catch (err) {
      const message =
        err.errors && err.errors.length > 0
          ? err.errors.join(" • ")
          : err.message || "Validation error";
      return res.status(400).json({ message });
    }
  };
}

module.exports = validate;
