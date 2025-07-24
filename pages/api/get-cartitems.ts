// pages/api/get-cartitems.ts

import { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient } from '@prisma/client';
import { enableCors } from '@/lib/cors';

const prisma = new PrismaClient();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {

  enableCors(req, res);

  if (req.method === 'OPTIONS') return res.status(200).end();

    
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const { userId, guestId } = req.query;

  if (!userId && !guestId) {
    return res.status(400).json({ error: 'userId or guestId is required' });
  }

  try {
    const cartItems = await prisma.cartItem.findMany({
      where: {
        OR: [
          userId ? { userId: Number(userId) } : undefined,
          guestId ? { guestId: String(guestId) } : undefined,
        ].filter(Boolean) as any,
      },
      include: {
        product: true,
      },
    });

    res.status(200).json({ cartItems });
  } catch (err) {
    console.error('Error fetching cart items:', err);
    res.status(500).json({ error: 'Something went wrong' });
  }
}
