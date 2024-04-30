import fs from 'fs';
import path from 'path';

export default function handler(req, res) {
  const { query, category, page, perPage } = req.query;

  if (category) {
    const poemsPerPage = parseInt(perPage, 10) || 10;
    const currentPage = Math.max(1, parseInt(page, 10));
    const startIndex = (currentPage - 1) * poemsPerPage;

    // 使用process.cwd()来获取当前工作目录，这通常指向项目根目录
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
          // 对于每个文件的内容进行检查和处理
          // 如果文件内容不是数组，或者文件内容为空，则跳过该文件
          if (!Array.isArray(jsonContent) || jsonContent.length === 0) {
            console.error(`File ${filePath} does not contain an array or is empty.`);
            return [];
          }
          return jsonContent.map(poem => {
            // 处理每首诗的格式
            return {
              title: poem.title || "",
              author: poem.author || "",
              paragraphs: poem.paragraphs || [],
            };
          });
        } catch (error) {
          // 如果读取或解析出错，记录错误信息并跳过该文件
          console.error(`Error reading or parsing file ${filePath}:`, error);
          return [];
        }
      });

      // 确保返回的总是数组格式的数据
      res.status(200).json(poems);
    });
  } else if (query) {
    // 如果提供了查询参数，则执行搜索逻辑
    // 注意：这里应该实现您的实际搜索逻辑，以下是一个简单示例
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
