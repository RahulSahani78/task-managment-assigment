const { validationResult } = require('express-validator');

const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (errors.isEmpty()) return next();
  res.status(400).json({
    success: false,
    message: errors.array().map((e) => e.msg).join(', '),
    errors: errors.array(),
  });
};

module.exports = { validate };
