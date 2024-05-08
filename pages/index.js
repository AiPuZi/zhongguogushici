import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import Poem from '../components/poem';
import { useRouter } from 'next/router';

async function fetchData(category, page, perPage, keyword) {
  let url = `/api/poems?category=${category}&page=${page}&perPage=${perPage}`;

  if (keyword) {
    url = `/api/search?query=${encodeURIComponent(keyword)}`;
  }

  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  const data = await response.json();

  return data.map(item => ({
    title: item.title || '',
    author: item.author || '',
    chapter: item.chapter || '',
    section: item.section || '',
    content: Array.isArray(item.paragraphs) ? item.paragraphs : item.content || item.para || [],
    comments: Array.isArray(item.comment) ? item.comment : [],
    rhythmic: item.rhythmic || '',
  }));
}

const maxCachedPages = 5;

export async function getStaticProps() {
  const baseUrl = process.env.API_BASE_URL;
  const response = await fetch(`${baseUrl}/api/poems?category=quantangshi&page=0&perPage=9`);
  const data = await response.json();

  const poetryData = Array.isArray(data) ? data.map(item => ({
    ...item,
    content: Array.isArray(item.paragraphs) ? item.paragraphs : item.content || item.para || [],
  })) : [];

  return {
    props: {
      initialPoetryData: poetryData,
    },
    revalidate: 10,
  };
}

function Home({ initialPoetryData }) {
  const router = useRouter();
  const [currentCategory, setCurrentCategory] = useState('quantangshi');
  const [poetryData, setPoetryData] = useState(initialPoetryData || []);
  const [searchKeyword, setSearchKeyword] = useState('');
  const [currentPage, setCurrentPage] = useState(0);
  const [pageList, setPageList] = useState([initialPoetryData]);

  const poemsPerPage = 9;

  useEffect(() => {
    const fetchDataAndSetPoetryData = async () => {
      let keyword = '';

      if (router.query.query) {
        keyword = decodeURIComponent(router.query.query);
      }

      const data = await fetchData(currentCategory, currentPage, poemsPerPage, keyword);

      setPoetryData(data);
    };

    fetchDataAndSetPoetryData();
  }, [currentCategory, currentPage, poemsPerPage, router.query]);

  useEffect(() => {
    const prefetchNextPages = async () => {
      for (let i = 1; i <= maxCachedPages - 1; i++) {
        const nextPage = currentPage + i;
        const totalPages = Math.ceil(poetryData.length / poemsPerPage);

        if (nextPage <= totalPages) {
          const data = await fetchData(currentCategory, nextPage, poemsPerPage, searchKeyword);
          setPageList((prevList) => [...prevList, data]);
        }
      }
    };

    prefetchNextPages();
  }, [currentCategory, currentPage, poetryData, poemsPerPage, searchKeyword]);

  const handleCategoryChange = (category, event) => {
    event.preventDefault();
    setCurrentCategory(category);
    setCurrentPage(0);
    setPoetryData([]);
    setSearchKeyword('');
  };

  const handleSearch = async (event) => {
    event.preventDefault();
    const data = await fetchData(currentCategory, 0, poemsPerPage, searchKeyword); // Reset to page 0 on search
    setPoetryData(data);
    setCurrentPage(0);
  };

  const handleNextPage = async () => {
    if (currentPage + 1 < pageList.length) {
      setCurrentPage(currentPage + 1);
    } else {
      const nextPage = currentPage + 1;
      const data = await fetchData(currentCategory, nextPage, poemsPerPage, searchKeyword);

      // 添加新分页到pageList，并移除最旧的分页
      setPageList((prevList) => [
        ...prevList.slice(-maxCachedPages + 1),
        data,
      ]);

      setCurrentPage(nextPage);
    }
  };

  const handlePreviousPage = () => {
    setCurrentPage(Math.max(currentPage - 1, 0));
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
        <button onClick={handlePreviousPage} disabled={currentPage === 0}>上一页</button>
        <button onClick={handleNextPage}>下一页</button>
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
