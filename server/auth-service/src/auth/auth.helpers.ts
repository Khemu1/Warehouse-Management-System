import { promisify } from 'util';
import { scrypt as _scrypt, randomBytes } from 'crypto';
import { ConflictException, UnauthorizedException } from '@nestjs/common';
import { User } from '@shared/entities/user.entity';
import { EntityManager } from 'typeorm';

const scrypt = promisify(_scrypt);

export const hashPassword = async (password: string) => {
  const salt = randomBytes(8).toString('hex');
  const hash = (await scrypt(password, salt, 32)) as Buffer;
  const res = salt + '.' + hash.toString('hex');
  return res;
};

export const comparePassword = async (
  password: string,
  hashedPassword: string,
) => {
  const [salt, storedHash] = hashedPassword.split('.');
  const hash = (await scrypt(password, salt, 32)) as Buffer;
  if (storedHash !== hash.toString('hex')) {
    throw new UnauthorizedException('Invalid Credentials');
  }
};

export const isEmailTaken = async (tx: EntityManager, email: string) => {
  const user = await tx.findOne(User, {
    where: { email },
  });
  if (user) {
    throw new ConflictException('Email already taken');
  }
};
