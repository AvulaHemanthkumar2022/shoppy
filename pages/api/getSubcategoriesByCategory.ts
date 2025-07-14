import type { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient } from '@prisma/client';
import { enableCors } from '@/lib/cors';

const prisma = new PrismaClient();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  enableCors(res);
  if (req.method === 'OPTIONS') return res.status(200).end();

  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const { categoryId } = req.query;

  if (!categoryId || isNaN(Number(categoryId))) {
    return res.status(400).json({ message: 'Invalid or missing categoryId.' });
  }

  try {
    const subcategories = await prisma.subcategory.findMany({
      where: {
        categoryId: Number(categoryId),
      },
      orderBy: {
        id: 'asc',
      },
    });

    return res.status(200).json({
      message: 'Subcategories fetched successfully.',
      subcategories,
    });
  } catch (error) {
    console.error('Error fetching subcategories:', error);
    return res.status(500).json({ message: 'Internal server error.' });
  }
}
