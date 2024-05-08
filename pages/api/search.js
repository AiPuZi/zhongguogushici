import { readdir, readFile } from 'fs/promises';
import path from 'path';

export default async function handler(req, res) {
  const { query } = req.query;

  if (keyword) {
    const poems = await searchPoems(keyword);
    res.status(200).json(poems);
  } else {
    res.status(400).json({ error: 'Missing keyword parameter' });
  }
}

// 搜索诗词的函数
async function searchPoems(keyword) {
  const categories = await readdir(path.join(process.cwd(), 'public'));

  const poems = [];
  for (const category of categories) {
    const categoryDirPath = path.join(process.cwd(), 'public', category);

    try {
      const files = await readdir(categoryDirPath);
      const validFiles = files.filter(file => file.endsWith('.json'));

      for (const file of validFiles) {
        const filePath = path.join(categoryDirPath, file);
        const fileContents = await readFile(filePath, 'utf8');
        const jsonContent = JSON.parse(fileContents);

        if (!Array.isArray(jsonContent) || jsonContent.length === 0) {
          console.error(`File ${filePath} does not contain an array or is empty.`);
          continue;
        }

        for (const poem of jsonContent) {
          if (
            poem.title.toLowerCase().includes(keyword.toLowerCase()) ||
            (poem.author && poem.author.toLowerCase().includes(keyword.toLowerCase()))
          ) {
            poems.push(poem);
          }
        }
      }
    } catch (error) {
      console.error('Failed to read directory or parse files:', error);
    }
  }

  return poems;
}
