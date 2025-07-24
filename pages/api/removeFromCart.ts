import { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // 👉 Handle CORS preflight
  if (req.method === 'OPTIONS') {
    res.setHeader('Access-Control-Allow-Origin', 'http://localhost:5173');
    res.setHeader('Access-Control-Allow-Methods', 'DELETE, OPTIONS');
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

    const deletedItem = await prisma.cartItem.deleteMany({
      where: {
        productId: numericProductId,
        OR: [
          userId ? { userId: parseInt(userId) } : {},
          guestId ? { guestId } : {}
        ]
      }
    });

    if (deletedItem.count === 0) {
      return res.status(404).json({ message: 'Cart item not found' });
    }

    res.status(200).json({ message: 'Cart item removed successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Something went wrong', error });
  }
}
