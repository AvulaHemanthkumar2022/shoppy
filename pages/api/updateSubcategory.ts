import type { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient } from '@prisma/client';
import { enableCors } from '@/lib/cors';

const prisma = new PrismaClient();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  enableCors(req, res);

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'PUT') return res.status(405).json({ message: 'Method not allowed' });

  const { id, name, img, categoryId } = req.body;

  if (!id || isNaN(Number(id))) {
    return res.status(400).json({ message: 'Valid subcategory ID is required.' });
  }

  try {
    const subcategory = await prisma.subcategory.update({
      where: { id: Number(id) },
      data: {
        ...(name && { name }),
        ...(img && { img }),
        ...(categoryId && { categoryId: Number(categoryId) }),
      },
    });

    return res.status(200).json({ message: 'Subcategory updated successfully.', subcategory });
  } catch (error) {
    console.error('Error updating subcategory:', error);
    return res.status(500).json({ message: 'Internal server error.' });
  }
}
