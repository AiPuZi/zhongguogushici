import Head from 'next/head';
import { useState, useEffect } from 'react';
import Poem from '../components/poem';

// 用于获取诗词数据的函数，这里是一个示例，你需要根据实际情况编写
async function getPoetryData(category, page, perPage) {
  const response = await fetch(`/api/search?category=${category}&page=${page}&perPage=${perPage}`);
  const data = await response.json();
  return (Array.isArray(data) ? data : []).map(item => ({
    title: item.title || '无标题',
    chapter: item.chapter,
    section: item.section,
    content: Array.isArray(item.content) ? item.content : ['内容不可用'],
    comment: Array.isArray(item.comment) ? item.comment : null
  }));
}

// 在这里使用 getStaticProps 来预渲染页面
export async function getStaticProps() {
  // 使用环境变量中定义的API基础URL
  const baseUrl = process.env.API_BASE_URL;
  const response = await fetch(`${baseUrl}/api/search?category=quantangshi&page=0&perPage=9`);
  const poetryData = await response.json();
  return {
    props: {
      initialPoetryData: poetryData,
    },
    revalidate: 10, // ISR: 页面内容更新后，每10秒重新生成一次
  };
}

export default function Home({ initialPoetryData }) {
  const [currentCategory, setCurrentCategory] = useState('quantangshi');
  const [poetryData, setPoetryData] = useState(initialPoetryData);
  const [searchInput, setSearchInput] = useState('');
  const [currentPage, setCurrentPage] = useState(0);
  const poemsPerPage = 9; // 每页显示的诗词数量

  // 当currentCategory或currentPage改变时，加载对应分类的诗词
useEffect(() => {
  if (currentPage !== 0 || currentCategory !== 'quantangshi') {
    const loadPoetryData = async () => {
      const data = await getPoetryData(currentCategory, currentPage, poemsPerPage);
      // 确保每个诗词的 content 字段都是数组
      const safeData = data.map(poem => ({
        ...poem,
        paragraphs: Array.isArray(poem.content) ? poem.content : []
      }));
      setPoetryData(safeData);
    };

    loadPoetryData();
  }
}, [currentCategory, currentPage]);

  // 处理导航链接点击事件
  const handleCategoryChange = (category, event) => {
    event.preventDefault(); // 阻止<a>标签的默认行为
    setCurrentCategory(category); // 更新状态以改变当前选中的分类
    setCurrentPage(0); // 重置到第一页
    window.location.hash = category; // 更新 URL 的 hash 部分以反映当前分类
  };

  // 处理搜索功能
  const handleSearch = async (event) => {
  event.preventDefault();
  // 使用路由导航到搜索页面，并传递查询参数
  window.location.href = `/search?query=${encodeURIComponent(searchInput)}`;
};

  // 处理分页功能
  const goToNextPage = () => {
    setCurrentPage((prevPage) => prevPage + 1);
  };

  const goToPrevPage = () => {
    setCurrentPage((prevPage) => (prevPage > 0 ? prevPage - 1 : 0));
  };
  
  return (
    <>
      <Head>
        <title>古诗词网</title>
        <link rel="icon" href="/logo.png" />
      </Head>

      <header>
        <div className="logo">
          <a href="/" style={{ textDecoration: 'none', color: 'inherit' }}>古诗词</a>
        </div>
        <div className="slogan">莫愁前路无知己，天下谁人不识君。</div>
        <div className="search-container">
          <input
            type="text"
            id="searchInput"
            placeholder="搜索标题、作者、内容..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
          />
          <button id="searchButton" onClick={handleSearch}>搜索</button>
        </div>
      </header>

      <nav className="poetry-navigation">
       <a href="#quantangshi" onClick={(e) => handleCategoryChange('quantangshi', e)}>全唐诗</a>
        <a href="#tangshisanbaishou" onClick={(e) => handleCategoryChange('tangshisanbaishou', e)}>唐三百</a>
        <a href="#shuimotangshi" onClick={(e) => handleCategoryChange('shuimotangshi', e)}>水墨唐诗</a>
        <a href="#yudingquantangshi" onClick={(e) => handleCategoryChange('yudingquantangshi', e)}>御定全唐诗</a>
        <a href="#quansongci" onClick={(e) => handleCategoryChange('quansongci', e)}>全宋词</a>
        <a href="#songcisanbaishou" onClick={(e) => handleCategoryChange('songcisanbaishou', e)}>宋三百</a>
        <a href="#yuanqu" onClick={(e) => handleCategoryChange('yuanqu', e)}>元曲</a>
        <a href="#huajianji" onClick={(e) => handleCategoryChange('huajianji', e)}>花间集</a>
        <a href="#nantangerzhuci" onClick={(e) => handleCategoryChange('nantangerzhuci', e)}>南唐二主</a>
        <a href="#shijing" onClick={(e) => handleCategoryChange('shijing', e)}>诗经</a>
        <a href="#chuci" onClick={(e) => handleCategoryChange('chuci', e)}>楚辞</a>
        <a href="#lunyu" onClick={(e) => handleCategoryChange('lunyu', e)}>论语</a>
        <a href="#mengxue" onClick={(e) => handleCategoryChange('mengxue', e)}>蒙学</a>
        <a href="#nalanxingde" onClick={(e) => handleCategoryChange('nalanxingde', e)}>纳兰性德</a>
        <a href="#youmengying" onClick={(e) => handleCategoryChange('youmengying', e)}>幽梦影</a>
      </nav>
      
    <main id="poetry-content">
        {/* 直接使用 poetryData 来渲染诗词 */}
        {Array.from({ length: Math.ceil(poetryData.length / 3) }).map((_, rowIndex) => (
          <div key={rowIndex} className="poem-row">
            {poetryData.slice(rowIndex * 3, rowIndex * 3 + 3).map((poem, poemIndex) => (
              <div key={poemIndex} className="poem">
                <Poem title={poem.title} author={poem.author} paragraphs={poem.paragraphs} />
              </div>
            ))}
          </div>
        ))}
      </main>

      {/* 分页按钮 */}
      <div className="pagination-buttons">
        <button onClick={goToPrevPage} disabled={currentPage === 0}>上一页</button>
        <button onClick={goToNextPage} disabled={poetryData.length < poemsPerPage}>下一页</button>
      </div>

      <div className="attribution">
        本站数据量庞大，难免出现错漏。如你在查阅中发现问题，请至留言板留言反馈。
        <br /><a href="https://www.winglok.com" target="_blank">留言板</a>
      </div>
      
      <footer>
        <a href="https://www.winglok.com">GUSHICI.WANG</a><span>版权所有</span>
      </footer>
    </>
  );
}
