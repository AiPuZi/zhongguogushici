
import Head from 'next/head';
import { useState, useEffect, useRef } from 'react';
import Poem from '../components/poem';

async function getPoetryData(category, page, perPage) {
  const response = await fetch(`/api/search?category=${category}&page=${page}&perPage=${perPage}`);
  const data = await response.json();
  return (Array.isArray(data) ? data : []).map(item => ({
    title: item.title || '',
    author: item.author || '',
    chapter: item.chapter || '',
    section: item.section || '',
    content: Array.isArray(item.paragraphs) ? item.paragraphs : (item.content || item.para || '').split('\n'),
    comments: Array.isArray(item.comment) ? item.comment : [],
    rhythmic: item.rhythmic || '', 
  }));
}

export async function getStaticProps() {
  const baseUrl = process.env.API_BASE_URL;
  const response = await fetch(`${baseUrl}/api/search?category=quantangshi&page=0&perPage=9`);
  const data = await response.json();
  const poetryData = Array.isArray(data) ? data : [];
  return {
    props: {
      initialPoetryData: poetryData,
    },
    revalidate: 10,
  };
}

export default function Home({ initialPoetryData }) {
  const [currentCategory, setCurrentCategory] = useState('quantangshi');
  const [poetryData, setPoetryData] = useState(initialPoetryData);
  const [searchInput, setSearchInput] = useState('');
  const [currentPage, setCurrentPage] = useState(0);
  const poemsPerPage = 9;
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const observer = useRef();

  useEffect(() => {
    const loadPoetryData = async () => {
      setLoading(true);
      const data = await getPoetryData(currentCategory, currentPage, poemsPerPage);
      setLoading(false);
      setPoetryData(prevData => [...prevData, ...data]);
    };

    if (currentPage !== 0 && !loading && hasMore) {
      loadPoetryData();
    }
  }, [currentCategory, currentPage]);

  useEffect(() => {
    observer.current = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && hasMore) {
        setCurrentPage(prevPage => prevPage + 1);
      }
    }, { threshold: 1 });

    if (observer.current) {
      observer.current.observe(document.querySelector('#loadMore'));
    }

    return () => {
      if (observer.current) {
        observer.current.disconnect();
      }
    };
  }, [hasMore]);

  const handleCategoryChange = (category, event) => {
    event.preventDefault();
    setCurrentCategory(category);
    setCurrentPage(0);
    setPoetryData([]);
    setHasMore(true);
    window.location.hash = category;
  };

  const handleSearch = async (event) => {
    event.preventDefault();
    window.location.href = `/search?query=${encodeURIComponent(searchInput)}`;
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
        {poetryData.map((poem, index) => (
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
        <div id="loadMore" style={{ height: '10px' }}></div>
        {loading && <p>Loading...</p>}
        {!hasMore && <p>No more poems to load.</p>}
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
