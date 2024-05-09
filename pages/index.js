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

export async function getStaticProps() {
  const baseUrl = process.env.API_BASE_URL;
  const categories = ['quantangshi', 'tangshisanbaishou', 'shuimotangshi']; // Add more categories as needed
  const initialPoetryData = {};

  for (const category of categories) {
    const response = await fetch(`${baseUrl}/api/poems?category=${category}&page=0&perPage=9`);
    const data = await response.json();
    initialPoetryData[category] = Array.isArray(data) ? data.map(item => ({
      ...item,
      content: Array.isArray(item.paragraphs) ? item.paragraphs : item.content || item.para || [],
    })) : [];
  }

  return {
    props: {
      initialPoetryData,
    },
    revalidate: 10,
  };
}

function Home({ initialPoetryData }) {
  const router = useRouter();
  const [currentCategory, setCurrentCategory] = useState('quantangshi');
  const [poetryData, setPoetryData] = useState(initialPoetryData[currentCategory] || []);
  const [searchKeyword, setSearchKeyword] = useState('');
  const [currentPage, setCurrentPage] = useState(0);
  const [nextPageData, setNextPageData] = useState(null); 
  const [isLoadingMore, setIsLoadingMore] = useState(false); 
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
    const prefetchNextPageData = async () => {
      const nextPage = currentPage + 1;
      const totalPages = Math.ceil(poetryData.length / poemsPerPage);
      if (nextPage <= totalPages) {
        const data = await fetchData(currentCategory, nextPage, poemsPerPage, searchKeyword);
        setNextPageData(data);
      }
    };
    if (!nextPageData) {
      prefetchNextPageData();
    }
  }, [currentCategory, currentPage, nextPageData, poetryData, poemsPerPage, searchKeyword]);

  const handleCategoryChange = (category, event) => {
    event.preventDefault();
    setCurrentCategory(category);
    setCurrentPage(0);
    setPoetryData(initialPoetryData[category] || []);
    setSearchKeyword('');
  };

  const handleSearch = async (event) => {
    event.preventDefault();
    const data = await fetchData(currentCategory, 0, poemsPerPage, searchKeyword); 
    setPoetryData(data);
    setCurrentPage(0);
  };

  const goToNextPage = () => {
    setCurrentPage(prevPage => prevPage + 1);
  };

  const goToPrevPage = async () => {
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
        {/* Add more category links here */}
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

      {/* Pagination buttons */}
      <div className="pagination-buttons">
        <button onClick={goToPrevPage} disabled={currentPage === 0}>上一页</button>
        <button onClick={goToNextPage}>下一页</button>
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
