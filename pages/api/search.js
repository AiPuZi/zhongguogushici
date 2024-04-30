import fs from 'fs';
import path from 'path';

export default function handler(req, res) {
  const { query, category, page, perPage } = req.query;

  if (category) {
    const poemsPerPage = parseInt(perPage, 10) || 10;
    const currentPage = Math.max(1, parseInt(page, 10));
    const startIndex = (currentPage - 1) * poemsPerPage;
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

      // 根据分页信息截取诗词数组
      const paginatedPoems = allPoems.slice(startIndex, startIndex + poemsPerPage);

      res.status(200).json(paginatedPoems);
    });
  } else if (query) {
    // 处理查询参数的逻辑
    // 注意：这里的搜索逻辑需要根据实际需求进行实现，以下是一个简单的示例
    const examplePoems = [
      // 示例诗词数据
    ];

    const filteredPoems = examplePoems.filter(poem =>
      poem.title.includes(query) || poem.author.includes(query)
    );

    res.status(200).json(filteredPoems);
  } else {
    res.status(400).json({ error: 'No valid category or query provided' });
  }
}
