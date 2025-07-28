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
  const isPreflight = enableCors(req, res);
  if (isPreflight) return;
  if (req.method !== 'PUT') return res.status(405).json({ message: 'Method not allowed' });

  const form = formidable({
    uploadDir,
    keepExtensions: true,
    maxFileSize: 5 * 1024 * 1024,
  });

  form.parse(req, async (err, fields, files) => {
    if (err) {
      return res.status(400).json({ message: 'Image upload failed.', error: err.message });
    }

    const getField = (key: string): string => {
      const val = fields[key];
      return Array.isArray(val) ? val[0] : val || '';
    };

    const id = parseInt(getField('id'), 10);
    const name = getField('name');
    const MRP = parseFloat(getField('MRP'));
    const actualPrice = parseFloat(getField('actualPrice'));
    const noOfProduct = parseInt(getField('noOfProduct'), 10);
    const weight = getField('weight');
    const description = getField('description');
    const subcategoryId = parseInt(getField('subcategoryId'), 10);

    if (isNaN(id)) return res.status(400).json({ message: 'Valid product ID required.' });

    const imgInput = files.img;
    const imgFile = Array.isArray(imgInput) ? imgInput[0] : imgInput;
    const imgUrl = imgFile?.filepath ? `/uploads/${path.basename(imgFile.filepath)}` : undefined;

    try {
      const product = await prisma.product.update({
        where: { id },
        data: {
          ...(name && { name }),
          ...(MRP && !isNaN(MRP) && { MRP }),
          ...(actualPrice && !isNaN(actualPrice) && { actualPrice }),
          ...(noOfProduct && !isNaN(noOfProduct) && { noOfProduct }),
          ...(weight && { weight }),
          ...(description && { description }),
          ...(subcategoryId && !isNaN(subcategoryId) && { subcategoryId }),
          ...(imgUrl && { img: imgUrl }),
        },
      });

      res.status(200).json({ message: 'Product updated successfully.', product });

    } catch (error) {
      console.error('Error updating product:', error);
      return res.status(500).json({ message: 'Internal server error.' });
    }
  });
}
