const fs = require('fs');
const path = require('path');
import Poem from './components/poem';

// 读取存储文件的目录
const directoryPath = './public/mengxue';

// 读取目录下的所有文件
fs.readdir(directoryPath, (err, files) => {
  if (err) {
    throw err;
  }
  // 遍历每个文件
  files.forEach(file => {
    // 读取文件内容
    fs.readFile(path.join(directoryPath, file), 'utf8', (err, data) => {
      if (err) {
        throw err;
      }
      const jsonData = JSON.parse(data);
      // 遍历处理文件中的每首诗歌数据
      jsonData.forEach(poemData => {
        // 使用 Poem 组件来渲染数据
        return (
          <Poem
            title={poemData.title}
            author={poemData.author}
            content={poemData.content}
            // 其他属性
          />
        );
      });
    });
  });
});
