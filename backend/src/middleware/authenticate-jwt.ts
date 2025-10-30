import { Request, Response, NextFunction } from 'express';
import { verifyToken } from '../features/jwt/index.js';
import { Error } from '../error/index.js';

const authenticateJWT = (req: Request, res: Response, next: NextFunction) => {
  const token = req.header('Authorization')?.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: Error.UNAUTHORIZED });
  }

  try {
    const user = verifyToken(token);
    if (user.statusCode === 401) {
      return res.status(401).json({ message: Error.UNAUTHORIZED });
    }
    next();
  } catch (error) {
    console.log("Error: ", error);
    return res.status(401).json({ message: Error.UNAUTHORIZED });
  }
};

export default authenticateJWT;