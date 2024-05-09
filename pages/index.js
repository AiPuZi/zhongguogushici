import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import Poem from '../components/poem';
import { useRouter } from 'next/router';

async function fetchData(category, page, perPage) {
  const url = `/api/poems?category=${category}&page=${page}&perPage=${perPage}`;
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
  const categories = ['quantangshi', 'tangshisanbaishou', 'shuimotangshi', 'yudingquantangshi', 'quansongci', 'songcisanbaishou', 'yuanqu', 'huajianji', 'nantangerzhuci', 'shijing', 'chuci', 'lunyu', 'mengxue', 'nalanxingde', 'youmengying'];

  const baseUrl = process.env.API_BASE_URL;
  const initialData = {};

  for (const category of categories) {
    const response = await fetch(`${baseUrl}/api/poems?category=${category}&page=0&perPage=9`);
    const data = await response.json();
    initialData[category] = data.map(item => ({
      ...item,
      content: Array.isArray(item.paragraphs) ? item.paragraphs : item.content || item.para || [],
    }));
  }

  return {
    props: {
      initialData,
    },
    revalidate: 10,
  };
}

function Home({ initialData }) {
  const router = useRouter();
  const [currentCategory, setCurrentCategory] = useState('quantangshi');
  const [poetryData, setPoetryData] = useState(initialData[currentCategory] || []);
  const [nextPageData, setNextPageData] = useState([]);
  const [currentPage, setCurrentPage] = useState(1); // Start from page 1
  const poemsPerPage = 1; // 1 poem per page

  useEffect(() => {
    const fetchDataAndSetPoetryData = async () => {
      const data = await fetchData(currentCategory, currentPage - 1, poemsPerPage);
      setPoetryData(data);
    };
    fetchDataAndSetPoetryData();

    // Preload next page data
    const preloadNextPageData = async () => {
      const data = await fetchData(currentCategory, currentPage, poemsPerPage);
      setNextPageData(data);
    };
    preloadNextPageData();
  }, [currentCategory, currentPage, poemsPerPage]);

  const handleCategoryChange = (category, event) => {
    event.preventDefault();
    setCurrentCategory(category);
    setCurrentPage(1); // Reset to first page when category changes
    setPoetryData([]);
    setNextPageData([]);
  };

  const goToNextPage = () => {
    setCurrentPage(prevPage => prevPage + 1);
    setPoetryData(nextPageData);
    setNextPageData([]);
    // Preload data for the next next page
    const preloadNextPageData = async () => {
      const data = await fetchData(currentCategory, currentPage + 1, poemsPerPage);
      setNextPageData(data);
    };
    preloadNextPageData();
  };

  const goToPrevPage = () => {
    setCurrentPage(prevPage => (prevPage > 1 ? prevPage - 1 : 1)); // Ensure not to go below page 1
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

      {/* Pagination buttons */}
      <div className="pagination-buttons">
        <button onClick={goToPrevPage} disabled={currentPage === 1}>上一页</button>
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
