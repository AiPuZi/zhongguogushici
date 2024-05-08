import React, { useState, useEffect } from 'react';
import Head from 'next/head';

import Poem from '../components/poem';
import { useRouter } from 'next/router';

async function getPoetryData(category, page, perPage) {
  const response = await fetch(`/api/poems?category=${category}&page=${page}&perPage=${perPage}`);

  const data = await response.json();

  return (Array.isArray(data) ? data : []).map(item => {
    let content = item.paragraphs || item.content || item.para || [];

    if (typeof content === 'string') {
      content = content.split('\n');
    } else if (!Array.isArray(content)) {
      content = [];
    }

    const title = item.title || '';
    const author = item.author || '';
    const chapter = item.chapter || '';
    const section = item.section || '';
    const comments = Array.isArray(item.comment) ? item.comment : [];

    return {
      title,
      author,
      chapter,
      section,
      content,
      comments,
      rhythmic: item.rhythmic || '',
    };
  });
}

export async function getStaticProps() {
  const baseUrl = process.env.API_BASE_URL;
  const response = await fetch(`${baseUrl}/api/poems?category=quantangshi&page=0&perPage=9`);
  const data = await response.json();
  const poetryData = Array.isArray(data) ? data : [];

  return {
    props: {
      initialPoetryData: poetryData.map(poem => ({
        title: poem.title || '',
        author: poem.author || '',
        chapter: poem.chapter || '',
        section: poem.section || '',
        content: Array.isArray(poem.content) ? poem.content : poem.paragraphs || poem.para || [],
        comments: Array.isArray(poem.comment) ? poem.comment : [],
        rhythmic: poem.rhythmic || '', // 包含 rhythmic 字段
      })),
    },
    revalidate: 10,
  };
}

// 在Home组件定义之前添加searchPoems函数
async function searchPoems(keyword) {
  try {
    const response = await fetch(`/api/search?query=${encodeURIComponent(keyword)}`);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching data:', error);
    return [];
  }
}

function Home({ initialPoetryData }) {
  const router = useRouter();
  const [currentCategory, setCurrentCategory] = useState('quantangshi');
  const [poetryData, setPoetryData] = useState(initialPoetryData || []);
  const [searchKeyword, setSearchKeyword] = useState('');
  const [currentPage, setCurrentPage] = useState(0);
  const poemsPerPage = 9;

  useEffect(() => {
    const fetchData = async () => {
      let keyword = '';

      if (router.query.query) {
        keyword = decodeURIComponent(router.query.query);
      }

      if (keyword) {
        const data = await searchPoems(keyword);
        setPoetryData(data);
      } else {
        const data = await getPoetryData(currentCategory, currentPage, poemsPerPage);
        setPoetryData(data);
      }
    };

    fetchData();
  }, [currentCategory, currentPage, poemsPerPage, router.query]);

  const handleCategoryChange = (category, event) => {
    event.preventDefault();
    setCurrentCategory(category);
    setCurrentPage(0);
    setPoetryData([]);
    setSearchKeyword('');
  };

  const handleSearch = async (event) => {
  event.preventDefault();

  if (searchKeyword) {
    const data = await searchPoems(searchKeyword); // 使用searchKeyword状态
    setPoetryData(data);
  } else {
    setPoetryData(initialPoetryData);
  }
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
            value={searchKeyword}
            onChange={(e) => setSearchKeyword(e.target.value)}
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
  {Array.isArray(poetryData) && poetryData.map((poem, index) => (
    <div key={index} className="poem">
      <Poem
        title={poem.title}
        author={poem.author}
        content={poem.content}
        chapter={poem.chapter}
        section={poem.section}
        comments={poem.comments}
        rhythmic={poem.rhythmic}
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

export default Home;
