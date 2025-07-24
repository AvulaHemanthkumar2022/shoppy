// /pages/api/incrementQuantity.ts

import { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient } from '@prisma/client';


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
    const product = await prisma.product.findUnique({ where: { id: parseInt(productId) } });
    if (!product) return res.status(404).json({ message: 'Product not found' });

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

    if (product.noOfProduct <= cartItem.quantity) {
        return res.status(400).json({ message: 'No more stock available' });
      }
      

    const updatedItem = await prisma.cartItem.update({
      where: { id: cartItem.id },
      data: { quantity: { increment: 1 } },
    });

    return res.status(200).json({ message: 'Quantity increased', updatedItem });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Internal server error' });
  }
}
