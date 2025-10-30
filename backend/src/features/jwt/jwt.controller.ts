import jwt, {JwtPayload} from 'jsonwebtoken';
import dotenv from 'dotenv';
import { UserTokenInfo } from './jwt.model.js';

// Load environment variables
dotenv.config();

const privateKey = process.env.JWT_PRIVATE_KEY?.replace(/\\n/g, '\n') || '';
const publicKey = process.env.JWT_PUBLIC_KEY?.replace(/\\n/g, '\n') || '';

interface TokenPayload extends JwtPayload {
  [key: string]: any;
  username: string;
  loginType: 'EMAIL' | 'CONTACT_NO';
  sessionId: string;
}

export function generateAccessToken(userTokenInfo: UserTokenInfo): string {
  if (!privateKey) {
    throw new Error('Private key is not defined in environment variables');
  }
  
  const options = {
    algorithm: process.env.JWT_ALGORITHM as jwt.Algorithm,
    expiresIn: process.env.JWT_ACCESS_TOKEN_EXPIRATION!
  } as jwt.SignOptions;
  
  return jwt.sign(userTokenInfo, privateKey as jwt.Secret, options);
}

export function generateRefreshToken(userTokenInfo: UserTokenInfo): string {
  if (!privateKey) {
    throw new Error('Private key is not defined in environment variables');
  }
  
  const options = {
    algorithm: process.env.JWT_ALGORITHM as jwt.Algorithm,
    expiresIn: process.env.JWT_REFRESH_TOKEN_EXPIRATION!
  } as jwt.SignOptions;
  
  return jwt.sign(userTokenInfo, privateKey as jwt.Secret, options);
}

// Verify Token
export function verifyToken(token: string): TokenPayload {
  if (!publicKey) {
    throw new Error('Public key is not defined in environment variables');
  }
  
  try {
    return jwt.verify(
      token,
      publicKey,
      {
        algorithms: [process.env.JWT_ALGORITHM as jwt.Algorithm]
      }
    ) as TokenPayload;
  } catch (error) {
    throw new Error('Invalid token');
  }
}
