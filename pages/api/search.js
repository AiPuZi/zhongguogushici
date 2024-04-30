import fs from 'fs';
import path from 'path';

export default function handler(req, res) {
  const { query, category, page, perPage } = req.query;

  if (category) {
    // 分类查询逻辑保持不变
    const poemsPerPage = parseInt(perPage, 10) || 10;
    const currentPage = Math.max(1, parseInt(page, 10));
    const startIndex = (currentPage - 1) * poemsPerPage;
    const categoryDirPath = path.join(process.cwd(), 'public', category);

    fs.readdir(categoryDirPath, (err, files) => {
      if (err) {
        console.error(`Error reading directory ${categoryDirPath}:`, err);
        return res.status(500).json({ error: 'Failed to read directory' });
      }

      const validFiles = files.filter(file => file.endsWith('.json'));
      const selectedFiles = validFiles.slice(startIndex, startIndex + poemsPerPage);

      const poems = selectedFiles.flatMap(file => {
        const filePath = path.join(categoryDirPath, file);
        try {
          const fileContents = fs.readFileSync(filePath, 'utf8');
          const jsonContent = JSON.parse(fileContents);
          if (!Array.isArray(jsonContent) || jsonContent.length === 0) {
            console.error(`File ${filePath} does not contain an array or is empty.`);
            return [];
          }
          return jsonContent.map(poem => {
            return {
              title: poem.title || "",
              author: poem.author || "",
              paragraphs: poem.paragraphs || [],
            };
          });
        } catch (error) {
          console.error(`Error reading or parsing file ${filePath}:`, error);
          return [];
        }
      });

      res.status(200).json(poems);
    });
  } else if (query) {
    // 处理查询参数的逻辑
    // 这里是搜索逻辑的示例，您需要根据您的实际需求实现搜索
    const examplePoems = [
      { title: "静夜思", author: "李白", content: "床前明月光，疑是地上霜。举头望明月，低头思故乡。" },
      // 更多示例诗词数据...
    ];

    const filteredPoems = examplePoems.filter(poem =>
      poem.title.includes(query) || poem.author.includes(query)
    );

    res.status(200).json(filteredPoems);
  } else {
    res.status(400).json({ error: 'No valid category or query provided' });
  }
}
