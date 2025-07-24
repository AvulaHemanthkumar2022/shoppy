import { PrismaClient } from '@prisma/client';
import { hashPassword } from '@/lib/auth';
import type { NextApiRequest, NextApiResponse } from 'next';
import { enableCors } from '@/lib/cors';

const prisma = new PrismaClient();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {

    enableCors(req, res);

      if (req.method === 'OPTIONS') return res.status(200).end();

  if (req.method !== 'POST') return res.status(405).json({ message: 'Method not allowed' });

  const { name, email, password } = req.body;

  if (!name || !email || !password)          
    return res.status(400).json({ message: 'All fields are required' });

  const existingUser = await prisma.user.findUnique({ where: { email } });
  if (existingUser) return res.status(400).json({ message: 'User already exists' });

  const hashedPassword = await hashPassword(password);

  const user = await prisma.user.create({
    data: { name, email, password: hashedPassword },
  });

  res.status(201).json({ message: 'User registered successfully', user: { id: user.id, email: user.email } });
}
