import { check } from 'express-validator';

const validator = [
  check('status', 'Status is required')
    .not()
    .isEmpty(),
  check('skills', 'Skills in required')
    .not()
    .isEmpty()
];

export default validator;
