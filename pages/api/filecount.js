import { readdir } from 'fs/promises';
import path from 'path';

export default async function handler(req, res) {
  const { category } = req.query;
  if (!category) {
    res.status(400).json({ error: 'Missing category parameter' });
    return;
  }

  const categoryDirPath = path.join(process.cwd(), 'public', category);

  try {
    const files = await readdir(categoryDirPath);
    const jsonFiles = files.filter(file => file.endsWith('.json'));
    res.status(200).json({ count: jsonFiles.length });
  } catch (error) {
    console.error('Failed to read directory:', error);
    res.status(500).json({ error: 'Failed to read the directory or the category does not exist.' });
  }
}
