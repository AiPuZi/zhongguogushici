import React, { useState, useEffect } from 'react';
import Poem from './components/PoemsContainer';

// 假设这是你的诗词文件路径列表
const poemFiles = [
  '/mengxue/poem3.json',
  '/mengxue/poem4.json',
  // 更多文件路径...
];

function App() {
  const [poemsData, setPoemsData] = useState([]);

  useEffect(() => {
    // 使用Promise.all来并发处理所有文件的请求
    Promise.all(poemFiles.map(file =>
      fetch(file).then(response => response.json())
    )).then(data => {
      // 当所有文件都被成功读取后，更新状态
      setPoemsData(data.flat()); // 使用flat()以防文件中有多首诗
    }).catch(error => {
      console.error('Error fetching poem data:', error);
    });
  }, []);

  return (
    <div className="App">
      {poemsData.map((poemData, index) => (
        <Poem
          key={index}
          title={poemData.title}
          author={poemData.author}
          content={poemData.content}
          // 其他属性...
        />
      ))}
    </div>
  );
}

export default App;
