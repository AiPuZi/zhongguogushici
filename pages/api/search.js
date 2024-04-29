// pages/api/search.js
export default function handler(req, res) {
  // 从请求中获取搜索查询参数
  const { query } = req.query;

  // 这里应该实现您的搜索逻辑
  // 以下是一个示例数据和简单的搜索逻辑
  const poems = [
    { title: "静夜思", author: "李白", content: "床前明月光，疑是地上霜。举头望明月，低头思故乡。" },
    // 更多示例诗词数据...
  ];

  // 简单过滤模拟搜索
  const filteredPoems = poems.filter(poem =>
    poem.title.includes(query) || poem.author.includes(query)
  );

  // 返回过滤后的诗词数据
  res.status(200).json(filteredPoems);
}

