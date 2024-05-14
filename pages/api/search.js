import { readdir, readFile, stat } from 'fs/promises';
import path from 'path';
import { convert } from 'opencc-js';

export default async function handler(req, res) {
  const { query } = req.query;

  if (query) {
    // 先用简体字关键字进行搜索
    let poems = await searchPoems(query);
    // 如果简体字搜索无结果，尝试繁体字搜索
    if (poems.length === 0) {
      const converter = await convert({ from: 'cn', to: 'tw' });
      const convertedQuery = converter(query); // 这里需要调用转换器来转换查询字符串
      poems = await searchPoems(convertedQuery);
    }

    res.status(200).json(poems);
    return; // 结束响应
  } else {
    res.status(400).json({ error: 'Missing query parameter' });
    return; // 结束响应
  }
}

const searchPoems = async (keyword) => {
  const categories = await readdir(path.join(process.cwd(), 'public'));

  const poems = [];

  for (const category of categories) {
    const categoryDirPath = path.join(process.cwd(), 'public', category);
     // 使用 stat 检查是否为目录
    const categoryStat = await stat(categoryDirPath);
    if (!categoryStat.isDirectory()) {
      continue; // 如果不是目录，则跳过当前循环
    }
    const files = await readdir(categoryDirPath);
    const validFiles = files.filter(file => file.endsWith('.json'));

    for (const file of validFiles) {
      const filePath = path.join(categoryDirPath, file);
      const fileContent = await readFile(filePath, 'utf8');
      const jsonContent = JSON.parse(fileContent);

      if (!Array.isArray(jsonContent) || jsonContent.length === 0) {
        console.error(`File ${filePath} does not contain an array or is empty.`);
        continue;
      }

      const batchSize = 1000; // 每批处理的诗词数目
      for (let i = 0; i < jsonContent.length; i += batchSize) {
        const batch = jsonContent.slice(i, i + batchSize);
        for (const item of batch) {
          if (poemsPushIfMatched(item, keyword)) {
            // 如果找到匹配项，直接推送到结果数组中，无需break
            poems.push(item);
          }
        }
      }
    }
  }

  return poems;
};

function poemsPushIfMatched(item, keyword) {
  for (const key in item) {
    if (Object.prototype.hasOwnProperty.call(item, key)) {
      const value = item[key];

      if (isStringMatch(value, keyword) || isArrayMatch(value, keyword)) {
        return item; // 返回整个匹配的诗词对象
      }
    }
  }
  return null; // 没有找到匹配项，返回null
}

function isStringMatch(value, keyword) {
  return typeof value === 'string' && value.toLowerCase().includes(keyword.toLowerCase());
}

function isArrayMatch(value, keyword) {
  return Array.isArray(value) && value.some(line => isStringMatch(line, keyword));
}
