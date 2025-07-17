import type { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient } from '@prisma/client';
import formidable from 'formidable';
import fs from 'fs';
import path from 'path';

export const config = {
  api: {
    bodyParser: false, // 👈 Important for formidable
  },
};

const prisma = new PrismaClient();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const form = formidable({
    multiples: false,
    uploadDir: path.join(process.cwd(), '/public/uploads'),
    keepExtensions: true,
  });

  form.parse(req, async (err, fields, files) => {
    if (err) {
      console.error('Form error:', err);
      return res.status(500).json({ message: 'Form parsing error', error: err });
    }

    const name = Array.isArray(fields.name) ? fields.name[0] : fields.name || '';
    const categoryId = parseInt(Array.isArray(fields.categoryId) ? fields.categoryId[0] : fields.categoryId || '', 10);
    const imgFile = Array.isArray(files.img) ? files.img[0] : files.img as formidable.File | undefined;

    const imgPath = imgFile?.filepath;
    const relativePath = imgPath?.split('public')[1]; // e.g., "/uploads/file.jpg"

    if (!name || !categoryId || !relativePath) {
      return res.status(400).json({ message: 'Missing required fields.' });
    }

    try {
      const subcategory = await prisma.subcategory.create({
        data: {
          name,
          img: relativePath,
          categoryId,
        },
      });

      return res.status(201).json({ message: 'Subcategory added successfully.', subcategory });
    } catch (error) {
      console.error('Prisma error:', error);
      return res.status(500).json({ message: 'Internal server error.' });
    }
  });
}
