import { readdir, readFile } from 'fs/promises';
import path from 'path';

export default async function handler(req, res) {
  const { category, page = 1, perPage = 10 } = req.query;

  if (category) {
    const poemsPerPage = parseInt(perPage, 10);
    const currentPage = Math.max(1, parseInt(page, 10));
    const startIndex = (currentPage - 1) * poemsPerPage;
    const categoryDirPath = path.join(process.cwd(), 'public', category);

    try {
      const files = await readdir(categoryDirPath);
      const validFiles = files.filter(file => file.endsWith('.json'));
      let allPoems = [];

      for (const file of validFiles) {
        const filePath = path.join(categoryDirPath, file);
        const fileContents = await readFile(filePath, 'utf8');
        const jsonContent = JSON.parse(fileContents);

        if (!Array.isArray(jsonContent) || jsonContent.length === 0) {
          console.error(`File ${filePath} does not contain an array or is empty.`);
          continue;
        }

        allPoems = allPoems.concat(jsonContent);
      }

      const paginatedPoems = allPoems.slice(startIndex, startIndex + poemsPerPage);

      res.status(200).json(paginatedPoems);
    } catch (error) {
      console.error('Failed to read directory or parse files:', error);
      res.status(500).json({ error: 'Failed to read directory or parse files' });
    }
  } else if (query) {
    // ...处理查询参数的逻辑...
  } else {
    res.status(400).json({ error: 'Missing category or query parameter' });
  }
}
