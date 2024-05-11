import { readdir, readFile, stat } from 'fs/promises';
import path from 'path';

export default async function handler(req, res) {
  const { query } = req.query;

  if (!query) {
    res.status(400).json({ error: 'Missing query parameter' });
    return; // 结束响应
  }

  try {
    const poems = await searchPoems(query);
    res.status(200).json(poems);
  } catch (error) {
    console.error('Error searching for poems:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

async function searchPoems(keyword) {
  const categories = await readdir(path.join(process.cwd(), 'public'));

  // 并行处理搜索操作
  const matchingPoems = await Promise.all(categories.map(category => searchCategory(category, keyword)));

  return matchingPoems.flat();
}

async function searchCategory(category, keyword) {
  const categoryDirPath = path.join(process.cwd(), 'public', category);
  const categoryStat = await stat(categoryDirPath);

  if (!categoryStat.isDirectory()) {
    return []; // 如果不是目录，则返回空数组
  }

  const files = await readdir(categoryDirPath);
  const validFiles = files.filter(file => file.endsWith('.json'));
  const poems = [];

  for (const file of validFiles) {
    const filePath = path.join(categoryDirPath, file);
    const fileContent = await readFile(filePath, 'utf8');
    const jsonContent = JSON.parse(fileContent);

    if (!Array.isArray(jsonContent) || jsonContent.length === 0) {
      console.error(`File ${filePath} does not contain an array or is empty.`);
      continue;
    }

    for (const item of jsonContent) {
      if (poemsPushIfMatched(item, keyword)) {
        // 如果找到匹配项，直接推送到结果数组中
        poems.push(item);
      }
    }
  }

  return poems;
}

function poemsPushIfMatched(item, keyword) {
  for (const key in item) {
    if (Object.prototype.hasOwnProperty.call(item, key)) {
      const value = item[key];

      if (isStringMatch(value, keyword) || isArrayMatch(value, keyword)) {
        return true; // 找到匹配项，返回true
      }
    }
  }
  return false; // 没有找到匹配项，返回false
}

function isStringMatch(value, keyword) {
  return typeof value === 'string' && value.toLowerCase().includes(keyword.toLowerCase());
}

function isArrayMatch(value, keyword) {
  return Array.isArray(value) && value.some(line => isStringMatch(line, keyword));
}
