import { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // 👉 Handle CORS preflight
  if (req.method === 'OPTIONS') {
    res.setHeader('Access-Control-Allow-Origin', 'http://localhost:5173');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    res.status(200).end(); // end early
    return;
  }

  // 👉 Allow CORS for main request
  res.setHeader('Access-Control-Allow-Origin', 'http://localhost:5173');

  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  const { productId, userId, guestId } = req.body;

  if (!productId || (!userId && !guestId)) {
    return res.status(400).json({ message: 'Missing required fields' });
  }

  try {
    const numericProductId = parseInt(productId);

    const existing = await prisma.cartItem.findFirst({
      where: {
        productId: numericProductId,
        OR: [
          userId ? { userId: parseInt(userId) } : {},
          guestId ? { guestId } : {}
        ]
      }
    });

    if (existing) {
      return res.status(200).json({ message: 'Product already in cart' });
    }

    const cartItem = await prisma.cartItem.create({
      data: {
        productId: numericProductId,
        ...(userId ? { userId: parseInt(userId) } : {}),
        ...(guestId ? { guestId } : {})
      }
    });

    res.status(200).json(cartItem);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Something went wrong', error });
  }
}
