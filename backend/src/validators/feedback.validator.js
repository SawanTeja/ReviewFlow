const Joi = require('joi');

const feedbackItemSchema = Joi.object({
  parameterId: Joi.string().uuid().required(),
  score: Joi.number().integer().min(1).max(5).required(),
  comment: Joi.string().allow('', null).optional(),
});

const draftItemSchema = Joi.object({
  parameterId: Joi.string().uuid().required(),
  score: Joi.number().integer().min(1).max(5).allow(null).optional(),
  comment: Joi.string().allow('', null).optional(),
});

const submitSchema = Joi.object({
  items: Joi.array().items(feedbackItemSchema).length(5).required(),
});

const draftSchema = Joi.object({
  items: Joi.array().items(draftItemSchema).min(1).max(5).required(),
});

module.exports = { submitSchema, draftSchema };
