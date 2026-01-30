import jwt from 'jsonwebtoken';
import configs from '../configs.js';

export const decryptJWT = (authorizationHeader: string) => {
  try {
    if (!authorizationHeader) {
      throw new Error('No authorization header provided');
    }

    const bearer = authorizationHeader.split(' ');
    if (bearer.length !== 2 || bearer[0] !== 'Bearer') {
      throw new Error('Invalid authorization header format');
    }

    const token = bearer[1];    
    const decoded = jwt.verify(token, configs.secret_key as string);
    
    return {
      success: true,
      data: decoded
    };
  } catch (error: any) {
    return {
      success: false,
      error: error.message
    };
  }
}; 