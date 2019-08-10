import { Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import RequestWithUser from '../../interface/requestWithUser';
import { JWT_SECRET } from '../../../utils/config';

async function authMiddleware(
  req: RequestWithUser,
  res: Response,
  next: NextFunction
) {
  const token = req.header('x-auth-token');
  if (!token) {
    return res
      .status(401)
      .json({ errors: [{ msg: 'No token, Authorization denied' }] });
  }
  try {
    const decoded: any = await jwt.verify(token, `${JWT_SECRET}`);
    req.user = decoded.user;
    next();
  } catch (err) {
    return res.status(401).json({ errors: [{ msg: 'Token is not valid' }] });
  }
}

export default authMiddleware;
