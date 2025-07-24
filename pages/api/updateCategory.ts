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
  if (req.method !== 'PUT') return res.status(405).json({ message: 'Method not allowed' });

  const form = formidable({
    uploadDir,
    keepExtensions: true,
    maxFileSize: 5 * 1024 * 1024,
  });

  form.parse(req, async (err, fields, files) => {
    if (err) {
      console.error('Form parse error:', err);
      return res.status(400).json({ message: 'Error parsing form', error: err.message });
    }

    const id = Array.isArray(fields.id) ? fields.id[0] : fields.id;
    const name = Array.isArray(fields.name) ? fields.name[0] : fields.name;

    if (!id || isNaN(Number(id))) {
      return res.status(400).json({ message: 'Valid category ID is required.' });
    }

    const imgInput = files.img;
    const imgFile = Array.isArray(imgInput) ? imgInput[0] : imgInput;
    const imgUrl = imgFile?.filepath ? `/uploads/${path.basename(imgFile.filepath)}` : undefined;

    try {
      const category = await prisma.category.update({
        where: { id: Number(id) },
        data: {
          ...(name && { name }),
          ...(imgUrl && { img: imgUrl }),
        },
      });

      return res.status(200).json({
        message: 'Category updated successfully.',
        category,
      });
    } catch (error) {
      console.error('Error updating category:', error);
      return res.status(500).json({ message: 'Internal server error.' });
    }
  });
}
