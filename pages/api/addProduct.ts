import type { NextApiRequest, NextApiResponse } from 'next';
import formidable, { File } from 'formidable';
import path from 'path';
import fs from 'fs';
import { PrismaClient } from '@prisma/client';
import { enableCors } from '@/lib/cors'; // ✅ Import your custom CORS function

const prisma = new PrismaClient();

export const config = {
  api: {
    bodyParser: false, // Required for formidable to parse multipart/form-data
  },
};

// Ensure the upload directory exists
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
    maxFileSize: 5 * 1024 * 1024, // 5 MB
  });

  form.parse(req, async (err, fields, files) => {
    if (err) {
      console.error('Form parse error:', err);
      return res.status(400).json({ message: 'Image upload failed.', error: err.message });
    }

    const getField = (key: string): string => {
      const val = fields[key];
      return Array.isArray(val) ? val[0] : val || '';
    };

    const name = getField('name');
    const MRP = parseFloat(getField('MRP'));
    const actualPrice = parseFloat(getField('actualPrice'));
    const noOfProduct = parseInt(getField('noOfProduct'), 10);
    const weight = getField('weight');
    const description = getField('description');
    const subcategoryId = parseInt(getField('subcategoryId'), 10);

    if (!name || isNaN(MRP) || isNaN(actualPrice) || isNaN(noOfProduct) || isNaN(subcategoryId)) {
      return res.status(400).json({ message: 'Missing or invalid fields.' });
    }

    const imgInput = files.img;
    const imgFile = Array.isArray(imgInput) ? imgInput[0] : imgInput;
    const imgUrl = imgFile && imgFile.filepath ? `/uploads/${path.basename(imgFile.filepath)}` : '';

    try {
      const subcategory = await prisma.subcategory.findUnique({
        where: { id: subcategoryId },
      });

      if (!subcategory) {
        return res.status(404).json({ message: 'Subcategory not found.' });
      }

      const product = await prisma.product.create({
        data: {
          name,
          MRP,
          actualPrice,
          noOfProduct,
          weight,
          description,
          img: imgUrl,
          subcategoryId,
        },
      });

      return res.status(201).json({ message: 'Product added successfully.', product });
    } catch (error) {
      console.error('Error saving product:', error);
      return res.status(500).json({ message: 'Internal server error.' });
    }
  });
}
