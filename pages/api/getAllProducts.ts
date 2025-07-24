// pages/api/getAllProducts.ts

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
    const products = await prisma.product.findMany({
      orderBy: {
        id: 'asc',
      },
      include: {
        subcategory: {
          include: {
            category: true,
          },
        },
      },
    });

    return res.status(200).json({
      message: 'All products fetched successfully.',
      products,
    });
  } catch (error) {
    console.error('Error fetching all products:', error);
    return res.status(500).json({ message: 'Internal server error.' });
  }
}
