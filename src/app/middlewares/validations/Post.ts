import { check } from 'express-validator';

const validator = [
  check('text', 'Text is required')
    .not()
    .isEmpty()
];

export default validator;
