// pages/api/search.js
import fs from 'fs';
import path from 'path';

export default function handler(req, res) {
  const { query, category, page = 1, perPage = 10 } = req.query;

  // 分类查询逻辑
  if (category) {
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

      let paginatedPoems = allPoems.slice(startIndex, startIndex + poemsPerPage);

      // 检查是否需要加载更多诗词以填满当前页
      if (paginatedPoems.length < poemsPerPage && allPoems.length < startIndex + poemsPerPage) {
        // 计算剩余需要加载的诗词数量
        const remainingPoemsToLoad = poemsPerPage - paginatedPoems.length;
        // 计算下一个需要加载的文件的数量
        const filesToLoad = Math.ceil(remainingPoemsToLoad / poemsPerPage);
        let loadedFiles = 0;

        // 加载剩余的文件
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
            loadedFiles++;

            if (loadedFiles === filesToLoad) {
              // 获取填满当前页的诗词
              paginatedPoems = allPoems.slice(startIndex, startIndex + poemsPerPage);
              return false; // 终止循环
            }
          } catch (error) {
            console.error(`Error reading or parsing file ${filePath}:`, error);
            return res.status(500).json({ error: 'Error reading or parsing file' });
          }
        });
      }

      res.status(200).json(paginatedPoems);
    });
  } else if (query) {
    // 处理查询参数的逻辑
    // 注意：这里的搜索逻辑需要根据实际需求进行实现，以下是一个简单的示例
    const examplePoems = [
      { title: "静夜思", author: "李白", content: "床前明月光，疑是地上霜。举头望明月，低头思故乡。" },
      // 更多示例诗词数据...
    ];

    const filteredPoems = examplePoems.filter(poem =>
      poem.title.includes(query) ||
      poem.author.includes(query) ||
      poem.content.includes(query)
    );

    res.status(200).json(filteredPoems);
  } else {
    // 如果没有提供分类或查询参数，返回错误响应
    res.status(400).json({ error: 'Missing category or query parameter' });
  }
}
