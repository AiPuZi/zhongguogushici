// pages/api/search.js
import fs from 'fs';
import path from 'path';

export default function handler(req, res) {
  const { query, category, page = 1, perPage = 10 } = req.query;

  const poemsPerPage = parseInt(perPage, 10);
  const currentPage = Math.max(1, parseInt(page, 10));
  const startIndex = (currentPage - 1) * poemsPerPage;

  if (category) {
    const categoryDirPath = path.join(process.cwd(), 'public', category);

    fs.readdir(categoryDirPath, (err, files) => {
      if (err) {
        console.error(`Error reading directory ${categoryDirPath}:`, err);
        return res.status(500).json({ error: 'Failed to read directory' });
      }

      let allPoems = [];

      files.forEach(file => {
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
        }
      });

      const paginatedPoems = allPoems.slice(startIndex, startIndex + poemsPerPage);

      res.status(200).json({
        poems: paginatedPoems,
        page: currentPage,
        perPage: poemsPerPage,
        total: allPoems.length,
        totalPages: Math.ceil(allPoems.length / poemsPerPage),
      });
    });
  } else if (query) {
    // 此处省略了处理 query 参数的逻辑，因为您需要根据实际情况决定如何实现
    // 例如，您可能需要从数据库或其他数据源中获取满足查询条件的诗词数据
  } else {
    res.status(400).json({ error: 'No valid category or query provided' });
  }
}
