// pages/api/login.ts
import { PrismaClient } from '@prisma/client';
import { comparePasswords, generateToken } from '@/lib/auth';
import type { NextApiRequest, NextApiResponse } from 'next';
import { enableCors } from '@/lib/cors';

const prisma = new PrismaClient();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  enableCors(req, res);

  if (req.method === 'OPTIONS') return res.status(200).end();

  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: 'Email and password are required' });
  }

  const user = await prisma.user.findUnique({ where: { email } });

  if (!user) {
    return res.status(404).json({ message: 'User not found' });
  }

  const isValid = await comparePasswords(password, user.password);
  if (!isValid) {
    return res.status(401).json({ message: 'Invalid credentials' });
  }

  const token = generateToken({ id: user.id, email: user.email });

  res.status(200).json({
    message: 'Login successful',
    token,
    user: { id: user.id, email: user.email, name: user.name },
  });
}
