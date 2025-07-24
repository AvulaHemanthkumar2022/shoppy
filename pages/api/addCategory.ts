import type { NextApiRequest, NextApiResponse } from 'next';
import formidable, { File } from 'formidable';
import path from 'path';
import fs from 'fs';
import { PrismaClient } from '@prisma/client';
import { enableCors } from '@/lib/cors';

const prisma = new PrismaClient();

export const config = {
  api: {
    bodyParser: false,
  },
};

const uploadDir = path.join(process.cwd(), '/public/uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  enableCors(req, res);

  if (req.method === 'OPTIONS') return res.status(200).end();

  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const form = formidable({
    uploadDir,
    keepExtensions: true,
    maxFileSize: 5 * 1024 * 1024,
  });

  form.parse(req, async (err, fields, files) => {
    if (err) {
      console.error('Form parse error:', err);
      return res.status(400).json({ message: 'Error parsing the form', error: err.message });
    }

    const name = Array.isArray(fields.name) ? fields.name[0] : fields.name;
    if (!name) {
      return res.status(400).json({ message: 'Category name is required.' });
    }

    const imgInput = files.img;
    const imgFile = Array.isArray(imgInput) ? imgInput[0] : imgInput;

    if (!name || !imgFile) {
      return res.status(400).json({ message: 'Name and image are required' });
    }

    let imgUrl = '';
    if (imgFile && imgFile.filepath) {
      imgUrl = `/uploads/${path.basename(imgFile.filepath)}`;
    }

    try {
      const category = await prisma.category.create({
        data: {
          name,
          img: imgUrl,
        },
      });

      return res.status(201).json({
        message: 'Category added successfully.',
        category,
      });
    } catch (error) {
      console.error('Error saving category to DB:', error);
      return res.status(500).json({ message: 'Internal server error.' });
    }
  });
}
