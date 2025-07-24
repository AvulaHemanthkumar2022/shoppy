import type { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient } from '@prisma/client';
import { enableCors } from '@/lib/cors';

const prisma = new PrismaClient();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  enableCors(req, res);

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'DELETE') return res.status(405).json({ message: 'Method not allowed' });

  const { id } = req.query;

  if (!id || isNaN(Number(id))) {
    return res.status(400).json({ message: 'Valid category ID is required.' });
  }

  try {
    await prisma.category.delete({
      where: { id: Number(id) },
    });

    return res.status(200).json({ message: 'Category deleted successfully.' });
  } catch (error) {
    console.error('Error deleting category:', error);
    return res.status(500).json({ message: 'Internal server error.' });
  }
}

