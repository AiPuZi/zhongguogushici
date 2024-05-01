// pages/api/search.js
import fs from 'fs';
import path from 'path';

export default function handler(req, res) {
  const { query, category, page = 1, perPage = 10 } = req.query;

  const poemsPerPage = parseInt(perPage, 10);
  const currentPage = Math.max(1, parseInt(page, 10));
  const startIndex = (currentPage - 1) * poemsPerPage;

  if (category) {
    // ...处理分类参数的逻辑...
  } else if (query) {
    const allPoems = [];
    const publicDirPath = path.join(process.cwd(), 'public');

    // 获取所有分类目录
    const categories = fs.readdirSync(publicDirPath);

    // 读取每个分类目录中的诗词文件
    categories.forEach(category => {
      const categoryDirPath = path.join(publicDirPath, category);
      const poemFiles = fs.readdirSync(categoryDirPath);

      poemFiles.forEach(file => {
        const filePath = path.join(categoryDirPath, file);
        const fileContents = fs.readFileSync(filePath, 'utf8');
        const jsonContent = JSON.parse(fileContents);
        allPoems.push(...jsonContent);
      });
    });

    // 搜索包含查询关键词的诗词
    const searchRegex = new RegExp(query, 'i'); // 不区分大小写
    const filteredPoems = allPoems.filter(poem => 
      searchRegex.test(poem.title) || searchRegex.test(poem.content.join(' ')) || (poem.author && searchRegex.test(poem.author))
    );

    // 分页
    const paginatedPoems = filteredPoems.slice(startIndex, startIndex + poemsPerPage);

    res.status(200).json({
      poems: paginatedPoems,
      page: currentPage,
      perPage: poemsPerPage,
      total: filteredPoems.length,
      totalPages: Math.ceil(filteredPoems.length / poemsPerPage),
    });
  } else {
    res.status(400).json({ error: 'No valid category or query provided' });
  }
}
