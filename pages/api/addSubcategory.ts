import type { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient } from '@prisma/client';
import { enableCors } from '@/lib/cors'; // If you're using CORS middleware

const prisma = new PrismaClient();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  enableCors(res); // 👈 Add this if CORS is needed

  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const { name, img, categoryId } = req.body;

  if (!name) {
    return res.status(400).json({ message: 'Subcategory name is required.' });
  }

  try {
    const subcategory = await prisma.subcategory.create({
      data: {
        name,
        img,
        categoryId: categoryId ? Number(categoryId) : null,
      },
    });

    return res.status(201).json({ message: 'Subcategory added successfully.', subcategory });
  } catch (error) {
    console.error('Error:', error);
    return res.status(500).json({ message: 'Internal server error.' });
  }
}
