import fs from 'fs';
import path from 'path';

export default function handler(req, res) {
  const { category, page = 1, perPage = 10 } = req.query;
  const poemsPerPage = parseInt(perPage, 10);
  const currentPage = Math.max(1, parseInt(page, 10));
  const startIndex = (currentPage - 1) * poemsPerPage;
  const categoryDirPath = path.join(process.cwd(), 'public', category);

  fs.readdir(categoryDirPath, (err, files) => {
    if (err) {
      console.error('Failed to read directory', err);
      return res.status(500).json({ error: 'Failed to read directory' });
    }

    const validFiles = files.filter(file => file.endsWith('.json'));
    let allPoems = [];

    validFiles.forEach(file => {
      const filePath = path.join(categoryDirPath, file);
      try {
        const fileContents = fs.readFileSync(filePath, 'utf8');
        const jsonContent = JSON.parse(fileContents);
        if (!Array.isArray(jsonContent) || jsonContent.length === 0) {
          console.error(`File ${filePath} does not contain an array or is empty.`);
          return;
        }
        allPoems = allPoems.concat(jsonContent);
      } catch (error) {
        console.error(`Error reading or parsing file ${filePath}:`, error);
        return res.status(500).json({ error: 'Error reading or parsing file' });
      }
    });

    const paginatedPoems = allPoems.slice(startIndex, startIndex + poemsPerPage);
    res.status(200).json(paginatedPoems);
  });
}
