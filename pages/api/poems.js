// pages/api/poems.js
import fs from 'fs';
import path from 'path';

export default function handler(req, res) {
  const { page = 1, perPage = 10 } = req.query;

  // 计算分页参数
  const pageNumber = parseInt(page, 10);
  const poemsPerPage = parseInt(perPage, 10);
  const startIndex = (pageNumber - 1) * poemsPerPage;
  const endIndex = startIndex + poemsPerPage;

  // 读取所有诗词数据
  const dataPath = path.join(process.cwd(), 'public', 'poems.json');
  const allPoems = JSON.parse(fs.readFileSync(dataPath, 'utf8'));

  // 获取当前页的诗词
  const paginatedPoems = allPoems.slice(startIndex, endIndex);

  // 返回分页数据
  res.status(200).json({
    poems: paginatedPoems,
    page: pageNumber,
    perPage: poemsPerPage,
    total: allPoems.length,
    totalPages: Math.ceil(allPoems.length / poemsPerPage),
  });
}
