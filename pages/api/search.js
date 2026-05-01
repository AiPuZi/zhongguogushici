import { readdir, readFile, stat } from 'fs/promises';
import path from 'path';

// 模块级缓存 - 避免每次请求都读取文件
let cachedPoems = null;
let cachePromise = null;

/**
 * 预加载所有诗歌数据到内存
 */
async function loadAllPoems() {
  // 如果已有缓存，直接返回
  if (cachedPoems) {
    return cachedPoems;
  }

  // 如果正在加载，等待完成
  if (cachePromise) {
    return cachePromise;
  }

  // 开始加载
  cachePromise = (async () => {
    console.log('🔄 正在预加载诗歌数据...');
    const categories = await readdir(path.join(process.cwd(), 'public'));
    const allPoems = [];

    // 并行读取所有分类目录
    const categoryPromises = categories.map(async (category) => {
      const categoryDirPath = path.join(process.cwd(), 'public', category);
      
      try {
        const categoryStat = await stat(categoryDirPath);
        if (!categoryStat.isDirectory()) {
          return [];
        }

        const files = await readdir(categoryDirPath);
        const validFiles = files.filter(file => file.endsWith('.json'));

        // 并行读取同一分类下的所有文件
        const filePromises = validFiles.map(async (file) => {
          const filePath = path.join(categoryDirPath, file);
          try {
            const fileContent = await readFile(filePath, 'utf8');
            const jsonContent = JSON.parse(fileContent);

            if (!Array.isArray(jsonContent) || jsonContent.length === 0) {
              return [];
            }

            // 为每首诗添加来源分类
            return jsonContent.map(poem => ({
              ...poem,
              category: category
            }));
          } catch (err) {
            console.error(`Error reading ${filePath}:`, err.message);
            return [];
          }
        });

        const results = await Promise.all(filePromises);
        return results.flat();
      } catch (err) {
        console.error(`Error processing category ${category}:`, err.message);
        return [];
      }
    });

    const results = await Promise.all(categoryPromises);
    cachedPoems = results.flat();
    console.log(`✅ 加载完成，共 ${cachedPoems.length} 首诗歌`);
    
    return cachedPoems;
  })();

  return cachePromise;
}

export default async function handler(req, res) {
  const { query } = req.query;

  if (query) {
    // 确保数据已加载
    await loadAllPoems();
    
    const poems = searchPoems(query, cachedPoems);
    res.status(200).json(poems);
  } else {
    res.status(400).json({ error: 'Missing query parameter' });
  }
}

/**
 * 在内存中搜索诗歌
 */
function searchPoems(keyword, poems) {
  const lowerKeyword = keyword.toLowerCase();
  
  return poems.filter(poem => poemsPushIfMatched(poem, lowerKeyword));
}

function poemsPushIfMatched(item, keyword) {
  for (const key in item) {
    if (Object.prototype.hasOwnProperty.call(item, key)) {
      const value = item[key];

      if (isStringMatch(value, keyword) || isArrayMatch(value, keyword)) {
        return true;
      }
    }
  }
  return false;
}

function isStringMatch(value, keyword) {
  return typeof value === 'string' && value.toLowerCase().includes(keyword);
}

function isArrayMatch(value, keyword) {
  return Array.isArray(value) && value.some(line => isStringMatch(line, keyword));
}
