import { Router, Request, Response } from 'express';
import { validationResult } from 'express-validator';
import RequestWithUser from '../interface/RequestWithUser';
import jwt from 'jsonwebtoken';
import gravatar from 'gravatar';
import bcrypt from 'bcryptjs';
import userModel from '../models/User';
import Controller from '../interface/Controller';
import registerValidator from '../middlewares/validations/Register';
import loginValidator from '../middlewares/validations/Login';
import authMiddleware from '../middlewares/authentication';

class AuthenticateController implements Controller {
  public path = '/auth';
  public router = Router();
  private user = userModel;

  constructor() {
    this.initializeRoutes();
  }

  private initializeRoutes() {
    this.router.get(this.path, authMiddleware, this.currentUser);
    this.router.post(`${this.path}/register`, registerValidator, this.register);
    this.router.post(`${this.path}/login`, loginValidator, this.login);
  }

  private currentUser = async (req: RequestWithUser, res: Response) => {
    await this.user
      .findById(req.user)
      .select('-password')
      .then(user => {
        return res.status(200).json(user);
      });
  };

  private register = async (req: Request, res: Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    const { name, email, password } = req.body;
    await this.user.findOne({ email }).then(user => {
      if (user) {
        return res
          .status(400)
          .json({ errors: [{ msg: 'User already exists' }] });
      }
    });
    try {
      const avatar = gravatar.url(email, {
        s: '200',
        r: 'pg',
        d: 'mm'
      });
      const user = new this.user({
        name,
        email,
        password,
        avatar
      });
      const salt = await bcrypt.genSalt(10);
      user.password = await bcrypt.hash(password, salt);
      user.save();
      return res.status(200).json(user);
    } catch (err) {
      console.error(err.message);
      return res.status(500).json({ errors: [{ msg: 'Server error' }] });
    }
  };

  private login = async (req: Request, res: Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    const { email, password } = req.body;
    try {
      const user = await this.user.findOne({ email });
      if (!user) {
        return res
          .status(400)
          .json({ errors: [{ msg: 'Invalid credentials' }] });
      }
      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        return res
          .status(400)
          .json({ errors: [{ msg: 'Invalid Credentials' }] });
      }
      const payload = {
        user: user.id
      };
      jwt.sign(
        payload,
        process.env.JWT_SECRET,
        { expiresIn: '3h' },
        (err, token) => {
          if (err) throw err;
          return res.status(200).json({ token });
        }
      );
    } catch (err) {
      console.error(err.message);
      return res.status(500).json({ errors: [{ msg: 'Server error' }] });
    }
  };
}

export default AuthenticateController;
