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

  const { subcategoryId } = req.query;

  if (!subcategoryId || isNaN(Number(subcategoryId))) {
    return res.status(400).json({ message: 'Invalid or missing subcategoryId.' });
  }

  try {
    const products = await prisma.product.findMany({
      where: {
        subcategoryId: Number(subcategoryId),
      },
      orderBy: {
        id: 'asc',
      },
    });

    return res.status(200).json({
      message: 'Products fetched successfully.',
      products,
    });
  } catch (error) {
    console.error('Error fetching products:', error);
    return res.status(500).json({ message: 'Internal server error.' });
  }
}
