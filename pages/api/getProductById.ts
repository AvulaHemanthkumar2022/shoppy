import type { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient } from '@prisma/client';
import { enableCors } from '@/lib/cors'; // Adjust the path as needed

const prisma = new PrismaClient();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  enableCors(req, res);

  if (req.method === 'OPTIONS') return res.status(200).end();

  if (req.method !== "GET") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  const id = parseInt(req.query.id as string);

  if (isNaN(id)) {
    return res.status(400).json({ message: "Invalid ID" });
  }

  try {
    const product = await prisma.product.findUnique({
      where: { id },
      include: {
        subcategory: {
          include: {
            category: true,
          },
        },
      },
    });

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    res.status(200).json({ product });
  } catch (err) {
    console.error("Error fetching product:", err);
    res.status(500).json({ message: "Error retrieving product", error: err });
  }
}
