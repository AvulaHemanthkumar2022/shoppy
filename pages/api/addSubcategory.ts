// pages/api/addSubcategory.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient } from '@prisma/client';
import { enableCors } from '@/lib/cors';

const prisma = new PrismaClient();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  enableCors(req, res);

  if (req.method === 'OPTIONS') return res.status(200).end();

  // ✅ Handle preflight request
  if (req.method === 'OPTIONS') {
    return res.status(200).end(); // Stop here for preflight
  }

  // Only allow POST
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const { name, categoryId } = req.body;

  if (!name || !categoryId) {
    return res.status(400).json({ message: 'Missing required fields.' });
  }

  try {
    const subcategory = await prisma.subcategory.create({
      data: {
        name,
        categoryId: parseInt(categoryId),
      },
    });

    return res.status(201).json({
      message: 'Subcategory added successfully.',
      subcategoryId: subcategory.id,
    });
  } catch (error) {
    console.error('Prisma error:', error);
    return res.status(500).json({ message: 'Internal server error.' });
  }
}
