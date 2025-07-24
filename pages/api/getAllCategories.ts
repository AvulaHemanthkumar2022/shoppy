// pages/api/getAllCategories.ts

import type { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient } from '@prisma/client';
import { enableCors } from '@/lib/cors';

const prisma = new PrismaClient();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  enableCors(req, res);

  if (req.method === 'OPTIONS') return res.status(200).end();

  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const categories = await prisma.category.findMany({
      orderBy: {
        id: 'asc',
      },
      include: {
        subcategories: true, // if you want to include subcategories too
      },
    });

    return res.status(200).json({
      message: 'Categories fetched successfully.',
      categories,
    });
  } catch (error) {
    console.error('Error fetching categories:', error);
    return res.status(500).json({ message: 'Internal server error.' });
  }
}
