import { readdir, readFile } from 'fs/promises';
import path from 'path';

export default async function handler(req, res) {
  const { category, page = 1, perPage = 10, fileIndex = 0 } = req.query;

  if (!category) {
    res.status(400).json({ error: 'Missing category parameter' });
    return;
  }

  const poemsPerPage = parseInt(perPage, 10);
  const currentPage = Math.max(1, parseInt(page, 10));
  const startIndex = (currentPage - 1) * poemsPerPage;
  const categoryDirPath = path.join(process.cwd(), 'public', category);

  try {
    const files = await readdir(categoryDirPath);
    const validFiles = files.filter(file => file.endsWith('.json'));

    if (fileIndex < 0 || fileIndex >= validFiles.length) {
      res.status(400).json({ error: 'Invalid file index' });
      return;
    }

    const filePath = path.join(categoryDirPath, validFiles[fileIndex]);
    const fileContents = await readFile(filePath, 'utf8');
    const jsonContent = JSON.parse(fileContents);

    if (!Array.isArray(jsonContent) || jsonContent.length === 0) {
      console.error(`File ${filePath} does not contain an array or is empty.`);
      res.status(400).json({ error: 'File does not contain an array or is empty' });
      return;
    }

    const paginatedPoems = jsonContent.slice(startIndex, startIndex + poemsPerPage);
    const totalPages = Math.ceil(jsonContent.length / poemsPerPage);

    res.status(200).json({ poems: paginatedPoems, totalPages, currentFile: fileIndex, totalFiles: validFiles.length });
  } catch (error) {
    console.error('Failed to read directory or parse files:', error);
    res.status(500).json({ error: 'Failed to read directory or parse files' });
  }
}
