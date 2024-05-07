import fs from 'fs';
import path from 'path';

export default function handler(req, res) {
  const { category } = req.query;

  if (!category) {
    return res.status(400).json({ error: 'Missing category parameter' });
  }

  const categoryDirPath = path.join(process.cwd(), 'public', category);

  fs.readdir(categoryDirPath, async (err, files) => {
    if (err) {
      console.error('Failed to read directory', err);
      return res.status(500).json({ error: 'Failed to read directory' });
    }

    const validFiles = files.filter(file => file.endsWith('.json'));

    if (validFiles.length === 0) {
      return res.status(404).json({ error: 'No poems found for this category' });
    }

    const firstFile = validFiles[0];
    const filePath = path.join(categoryDirPath, firstFile);

    try {
      const fileContents = await fs.promises.readFile(filePath, 'utf8');
      const jsonData = JSON.parse(fileContents);
      res.status(200).json(jsonData);
    } catch (error) {
      console.error('Error reading or parsing file:', error);
      return res.status(500).json({ error: 'Error reading or parsing file' });
    }
  });
}
