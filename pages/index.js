import Head from 'next/head';
import { useState, useEffect } from 'react';
import Poem from '../components/poem';

// 用于预处理并统一诗词数据格式的函数
function preprocessPoetryData(data) {
  return data.map(item => {
    // 处理不同的内容字段，确保内容总是数组形式
    let content = item.paragraphs || item.para || item.content;
    if (typeof content === 'string') {
      content = content.split('\n'); // 假设内容以换行符分割
    } else if (!Array.isArray(content)) {
      content = []; // 如果内容既不是字符串也不是数组，使用空数组
    }

    // 提取作者，如果不存在则提供默认值
    const author = item.author;

    // 提取标题，如果不存在则提供默认值
    const title = item.title || item.rhythmic;
    const chapter = item.chapter || '';
    const comments = item.comment || []; // 如果 comment 字段不存在，使用空数组

    return {
      title,
      author,
      content, // 使用处理后的content数组
      chapter,
      comments,
    };
  });
}

// 用于获取诗词数据的函数
async function getPoetryData(category, page, perPage) {
  const response = await fetch(`/api/search?category=${category}&page=${page}&perPage=${perPage}`);
  const data = await response.json();
  return preprocessPoetryData(data); // 使用 preprocessPoetryData 函数处理数据
}

// 使用 getStaticProps 来预渲染页面
export async function getStaticProps() {
  const baseUrl = process.env.API_BASE_URL;
  const response = await fetch(`${baseUrl}/api/search?category=quantangshi&page=0&perPage=9`);
  const poetryData = await response.json();
  const processedData = preprocessPoetryData(poetryData); // 使用 preprocessPoetryData 函数处理数据
  return {
    props: {
      initialPoetryData: processedData,
    },
    revalidate: 10,
  };
}

export default function Home({ initialPoetryData }) {
  const [currentCategory, setCurrentCategory] = useState('quantangshi'); // 当前分类
  const [poems, setPoems] = useState(initialPoetryData); // 诗词数据
  const [searchInput, setSearchInput] = useState(''); // 搜索输入
  const [currentPage, setCurrentPage] = useState(1); // 当前页码
  const [totalPages, setTotalPages] = useState(0); // 总页数
  const poemsPerPage = 9; // 每页显示的诗词数量

useEffect(() => {
  if (currentPage !== 1 || currentCategory !== 'quantangshi') {
    const loadPoetryData = async () => {
      const data = await getPoetryData(currentCategory, currentPage, poemsPerPage);
      setPoems(data); // 使用 setPoems 而不是 setPoetryData
    };

    loadPoetryData();
  }
}, [currentCategory, currentPage, poemsPerPage]);
  
  // 处理分页按钮点击事件
 const handlePageChange = (newPage) => {
    fetch(`/api/poems?page=${newPage}&perPage=${poemsPerPage}`)
      .then((response) => response.json())
      .then((data) => {
        setPoems(data.poems);
        setCurrentPage(newPage);
        setTotalPages(data.totalPages);
      })
      .catch((error) => {
        console.error('Error fetching poems:', error);
      });
  };

  // 处理导航链接点击事件
  const handleCategoryChange = (category, event) => {
    event.preventDefault();
    setCurrentCategory(category);
    setCurrentPage(1); 
    window.location.hash = category;
  };

  // 处理搜索功能
  const handleSearch = async (event) => {
    event.preventDefault();
    window.location.href = `/search?query=${encodeURIComponent(searchInput)}`;
  };

  // 处理分页功能
  const goToNextPage = () => {
    setCurrentPage(prevPage => prevPage + 1);
  };

  const goToPrevPage = () => {
    setCurrentPage(prevPage => (prevPage > 0 ? prevPage - 1 : 0));
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
        <a href="#nantangerzhuci" onClick={(e) => handleCategoryChange('nantangerzhuci', e)}>南唐二主词</a>
        <a href="#shijing" onClick={(e) => handleCategoryChange('shijing', e)}>诗经</a>
        <a href="#chuci" onClick={(e) => handleCategoryChange('chuci', e)}>楚辞</a>
        <a href="#lunyu" onClick={(e) => handleCategoryChange('lunyu', e)}>论语</a>
        <a href="#mengxue" onClick={(e) => handleCategoryChange('mengxue', e)}>蒙学</a>
        <a href="#nalanxingde" onClick={(e) => handleCategoryChange('nalanxingde', e)}>纳兰性德</a>
        <a href="#youmengying" onClick={(e) => handleCategoryChange('youmengying', e)}>幽梦影</a>
      </nav>
      
    <main id="poetry-content">
 {poems.map((poem, index) => (
  <div key={index} className="poem">
    <Poem
      title={poem.title}
      author={poem.author}
      section={poem.section}
      chapter={poem.chapter}
      content={poem.content}
      comments={poem.comments}
      />
    </div>
  ))}
</main>

       {/* 分页按钮 */}
     <div className="pagination-buttons">
        <button onClick={() => handlePageChange(currentPage - 1)} disabled={currentPage <= 1}>
          上一页
        </button>
        <button onClick={() => handlePageChange(currentPage + 1)} disabled={currentPage >= totalPages}>
          下一页
        </button>
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
