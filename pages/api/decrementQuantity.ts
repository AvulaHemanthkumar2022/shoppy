// /pages/api/decrementQuantity.ts

import { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient } from '@prisma/client';
import { enableCors } from '@/lib/cors';

const prisma = new PrismaClient();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // 🔐 Set CORS headers for all requests
  res.setHeader('Access-Control-Allow-Origin', 'http://localhost:5173');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return; // ✅ Prevent further execution
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  const { productId, userId, guestId } = req.body;

  if (!productId || (!userId && !guestId)) {
    return res.status(400).json({ message: 'Missing required fields' });
  }

  try {
    const cartItem = await prisma.cartItem.findFirst({
      where: {
        productId: parseInt(productId),
        OR: [
          userId ? { userId: parseInt(userId) } : {},
          guestId ? { guestId } : {},
        ],
      },
    });

    if (!cartItem) return res.status(404).json({ message: 'Cart item not found' });

    if (cartItem.quantity <= 1) {
      return res.status(400).json({ message: 'Minimum quantity is 1' });
    }

    const updatedItem = await prisma.cartItem.update({
      where: { id: cartItem.id },
      data: { quantity: { decrement: 1 } },
    });

    return res.status(200).json({ message: 'Quantity decreased', updatedItem });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Internal server error' });
  }
}
