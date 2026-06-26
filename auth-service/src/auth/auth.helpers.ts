import { promisify } from 'util';
import { scrypt as _scrypt, randomBytes } from 'crypto';
import { UnauthorizedException } from '@nestjs/common';

const scrypt = promisify(_scrypt);

export const hashPassword = async (password: string) => {
  const salt = randomBytes(8).toString('hex');
  const hash = (await scrypt(password, salt, 32)) as Buffer;
  const res = salt + '.' + hash.toString('hex');
  return res;
};

export const comparePassword = async (password: string, hashedPassword: string) => {
  const [salt, storedHash] = hashedPassword.split('.');
  const hash = (await scrypt(password, salt, 32)) as Buffer;
  if (storedHash !== hash.toString('hex')) {
    throw new UnauthorizedException('Invalid Credentials');
  }
};
