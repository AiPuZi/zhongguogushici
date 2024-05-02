import Head from 'next/head';
import { useState, useEffect } from 'react';
import Poem from '../components/poem';

// 这个 Poem 组件现在根据您的需求来决定如何显示诗词内容
const Poem = ({ title, author, content }) => {
  // 如果标题和作者都不存在，直接显示内容
  if (!title && !author) {
    return (
      <div>
        {content && content.map((line, index) => (
          <p key={index}>{line}</p>
        ))}
      </div>
    );
  } else {
    // 如果标题或作者存在，按照正常的格式显示
    return (
      <div>
        {title && <h1>{title}</h1>}
        {author && <p>作者：{author}</p>}
        {content && content.map((line, index) => (
          <p key={index}>{line}</p>
        ))}
      </div>
    );
  }
};

// 用于获取诗词数据的函数
async function getPoetryData(category, page, perPage) {
  const response = await fetch(`/api/search?category=${category}&page=${page}&perPage=${perPage}`);
  const data = await response.json();
  return (Array.isArray(data) ? data : []).map(item => {
    let content = item.paragraphs || item.content || [];
    if (typeof content === 'string') {
      content = content.split('\n'); // 假设内容以换行符分割
    } else if (!Array.isArray(content)) {
      content = []; // 如果内容既不是字符串也不是数组，使用空数组
    }

    const title = item.title || item.rhythmic || '';
    const author = item.author || '';

    const section = item.section || '';
    const chapter = item.chapter || '';
    const comments = Array.isArray(item.comment) ? item.comment : [];

    return {
      title,    // 可能为空串
      author,   // 可能为空串
      section,
      chapter,
      content,  // 总是存在，可能为空数组
      comments,
    };
  });
}

export async function getStaticProps() {
  const baseUrl = process.env.API_BASE_URL;
  const response = await fetch(`${baseUrl}/api/search?category=quantangshi&page=0&perPage=9`);
  const data = await response.json();
  const poetryData = Array.isArray(data) ? data : [];
  return {
    props: {
      initialPoetryData: poetryData.map(poem => ({
        title: poem.title || poem.rhythmic || '',
        author: poem.author || '',
        section: poem.section || '',
        chapter: poem.chapter || '',
        content: Array.isArray(poem.content) ? poem.content : [],
        comments: Array.isArray(poem.comment) ? poem.comment : [],
      })),
    },
    revalidate: 10,
  };
}

export default function Home({ initialPoetryData }) {
  const [currentCategory, setCurrentCategory] = useState('quantangshi');
  const [poetryData, setPoetryData] = useState(initialPoetryData);
  const [searchInput, setSearchInput] = useState('');
  const [currentPage, setCurrentPage] = useState(0);
  const poemsPerPage = 9; // 每页显示的诗词数量

  useEffect(() => {
    if (currentPage !== 0 || currentCategory !== 'quantangshi') {
      const loadPoetryData = async () => {
        const data = await getPoetryData(currentCategory, currentPage, poemsPerPage);
        setPoetryData(data);
      };

      loadPoetryData();
    }
  }, [currentCategory, currentPage]);

  const handleCategoryChange = (category, event) => {
    event.preventDefault();
    setCurrentCategory(category);
    setCurrentPage(0);
    window.location.hash = category;
  };

  const handleSearch = async (event) => {
    event.preventDefault();
    window.location.href = `/search?query=${encodeURIComponent(searchInput)}`;
  };

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
        <a href="#nantangerzhuci" onClick={(e) => handleCategoryChange('nantangerzhuci', e)}>南唐二主</a>
        <a href="#shijing" onClick={(e) => handleCategoryChange('shijing', e)}>诗经</a>
        <a href="#chuci" onClick={(e) => handleCategoryChange('chuci', e)}>楚辞</a>
        <a href="#lunyu" onClick={(e) => handleCategoryChange('lunyu', e)}>论语</a>
        <a href="#mengxue" onClick={(e) => handleCategoryChange('mengxue', e)}>蒙学</a>
        <a href="#nalanxingde" onClick={(e) => handleCategoryChange('nalanxingde', e)}>纳兰性德</a>
        <a href="#youmengying" onClick={(e) => handleCategoryChange('youmengying', e)}>幽梦影</a>
      </nav>
      
 <main id="poetry-content">
        {poetryData.map((poem, index) => (
          <div key={index} className="poem">
            <Poem
              title={poem.title}
              author={poem.author}
              content={poem.content} // 这里只传递 content，因为 Poem 组件已经根据 title 和 author 来决定渲染逻辑
              // 注意：这里不传递 section, chapter 和 comments，除非你的 Poem 组件需要它们
            />
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
