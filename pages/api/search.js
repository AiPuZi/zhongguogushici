import { readdir, readFile, stat } from 'fs/promises';
import path from 'path';

// 内联 Promise.allLimit 函数
async function Promise.allLimit(arr, limit) {
  let i = 0;
  const result = [];
  const executing = [];

  const execute = async () => {
    if (i < arr.length) {
      const p = arr[i++]();
      const e = p.then(result => result);
      result.push(e);
      const r = e.then(() => executing.splice(executing.indexOf(r), 1));
      executing.push(r);
      await Promise.race(executing);
      return execute();
    }
  };

  await Promise.all([...Array(limit)].map(() => execute()));
  return Promise.all(result);
}

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

  // 通过 Promise.all() 并行处理每个分类目录的搜索
  const matchingPoems = await Promise.all(categories.flatMap(category => searchCategory(category, keyword)));

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
  const tasks = validFiles.map(file => searchFile(path.join(categoryDirPath, file), keyword));
  
  // 通过 Promise.allLimit() 并行处理每个文件的搜索
  const matchingPoems = await Promise.allLimit(tasks, 10); // 限制并行处理的任务数量为10

  return matchingPoems;
}

async function searchFile(filePath, keyword) {
  const fileContent = await readFile(filePath, 'utf8');
  const jsonContent = JSON.parse(fileContent);

  if (!Array.isArray(jsonContent) || jsonContent.length === 0) {
    console.error(`File ${filePath} does not contain an array or is empty.`);
    return [];
  }

  return jsonContent.filter(item => poemsPushIfMatched(item, keyword));
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
