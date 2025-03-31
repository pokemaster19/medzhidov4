
const Joi = require('joi');

module.exports = Joi.object({
  name: Joi.string().min(3).required(),
  price: Joi.number().positive().required(),
  description: Joi.string().min(10).required(),
  category: Joi.array().items(Joi.string()).min(1).required()
});