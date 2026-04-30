import React, { useState, useEffect, useCallback, useRef } from 'react';
import Head from 'next/head';
import Poem from '../components/poem';
import { useRouter } from 'next/router';
import Link from 'next/link';

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
  const response = await fetch(`${baseUrl}/api/poems?category=quantangshi&page=1&perPage=9`);
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
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const poemsPerPage = 9;
  
  const pageCacheRef = useRef(new Map());
  
  useEffect(() => {
    pageCacheRef.current.set('quantangshi-1-', initialPoetryData || []);
  }, [initialPoetryData]);

  const getCacheKey = useCallback((category, page, keyword) => {
    return `${category}-${page}-${keyword || ''}`;
  }, []);

  const preFetchPage = useCallback(async (category, page, keyword) => {
    const cacheKey = getCacheKey(category, page, keyword);
    if (pageCacheRef.current.has(cacheKey) || page < 1) return;
    
    console.log('正在预取页面:', { category, page, cacheKey });
    try {
      const data = await fetchData(category, page, poemsPerPage, keyword);
      pageCacheRef.current.set(cacheKey, data);
      console.log('预取完成:', cacheKey);
    } catch (error) {
      console.error('预取失败:', error);
    }
  }, [getCacheKey, poemsPerPage]);

  const loadPage = useCallback(async (category, page, keyword) => {
    const cacheKey = getCacheKey(category, page, keyword);
    
    console.log('加载页面:', { category, page, cacheKey, hasCache: pageCacheRef.current.has(cacheKey) });
    
    if (pageCacheRef.current.has(cacheKey)) {
      console.log('使用缓存:', cacheKey);
      setPoetryData(pageCacheRef.current.get(cacheKey));
      setCurrentPage(page);
      preFetchPage(category, page - 1, keyword);
      preFetchPage(category, page + 1, keyword);
      return;
    }

    console.log('从服务器加载:', cacheKey);
    setIsLoading(true);
    try {
      const data = await fetchData(category, page, poemsPerPage, keyword);
      pageCacheRef.current.set(cacheKey, data);
      setPoetryData(data);
      setCurrentPage(page);
      preFetchPage(category, page - 1, keyword);
      preFetchPage(category, page + 1, keyword);
    } catch (error) {
      console.error('加载页面失败:', error);
    } finally {
      setIsLoading(false);
    }
  }, [getCacheKey, preFetchPage, poemsPerPage]);

  useEffect(() => {
    const keyword = router.query.query ? decodeURIComponent(router.query.query) : '';
    if (currentCategory !== 'quantangshi' || currentPage !== 1 || keyword) {
      loadPage(currentCategory, currentPage, keyword);
    }
  }, [currentCategory, router.query.query]);

  useEffect(() => {
    preFetchPage('quantangshi', 2, '');
  }, []);

  const handleCategoryChange = async (category, event) => {
    event.preventDefault();
    setCurrentCategory(category);
    loadPage(category, 1, '');
  };

  const handleSearch = async (event) => {
    event.preventDefault();
    loadPage(currentCategory, 1, searchKeyword);
  };

  const goToNextPage = () => {
    const keyword = router.query.query ? decodeURIComponent(router.query.query) : searchKeyword;
    loadPage(currentCategory, currentPage + 1, keyword);
  };

  const goToPrevPage = () => {
    if (currentPage > 1) {
      const keyword = router.query.query ? decodeURIComponent(router.query.query) : searchKeyword;
      loadPage(currentCategory, currentPage - 1, keyword);
    }
  };
  
  return (
    <>
      <Head>
        <title>古诗词网</title>
        <link rel="icon" type="image/png" href="/logo.png" />
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
        <a href="/quantangshi" onClick={(e) => handleCategoryChange('quantangshi', e)}>全唐诗</a>
        <a href="/tangshisanbaishou" onClick={(e) => handleCategoryChange('tangshisanbaishou', e)}>唐三百</a> 
        <a href="/shuimotangshi" onClick={(e) => handleCategoryChange('shuimotangshi', e)}>水墨唐诗</a>
        <a href="/yudingquantangshi" onClick={(e) => handleCategoryChange('yudingquantangshi', e)}>御定全唐诗</a>
        <a href="/quansongci" onClick={(e) => handleCategoryChange('quansongci', e)}>全宋词</a>
        <a href="/songcisanbaishou" onClick={(e) => handleCategoryChange('songcisanbaishou', e)}>宋三百</a>
        <a href="/yuanqu" onClick={(e) => handleCategoryChange('yuanqu', e)}>元曲</a>
        <a href="/huajianji" onClick={(e) => handleCategoryChange('huajianji', e)}>花间集</a>
        <a href="/nantangerzhuci" onClick={(e) => handleCategoryChange('nantangerzhuci', e)}>南唐二主词</a>
        <a href="/shijing" onClick={(e) => handleCategoryChange('shijing', e)}>诗经</a>
        <a href="/chuci" onClick={(e) => handleCategoryChange('chuci', e)}>楚辞</a>
        <a href="/lunyu" onClick={(e) => handleCategoryChange('lunyu', e)}>论语</a>
        <a href="/mengxue" onClick={(e) => handleCategoryChange('mengxue', e)}>蒙学</a>
        <a href="/nalanxingde" onClick={(e) => handleCategoryChange('nalanxingde', e)}>纳兰性德</a>
        <a href="/youmengying" onClick={(e) => handleCategoryChange('youmengying', e)}>幽梦影</a>
        <a href="/caocaoshiji" onClick={(e) => handleCategoryChange('caocaoshiji', e)}>曹操诗集</a>
      </nav>
      
<main id="poetry-content">
        {Array.isArray(poetryData) && poetryData.length > 0 ? (
          poetryData.map((poem, index) => (
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
          ))
        ) : (
          <div className="no-results">未找到相关内容...</div>
        )}
      </main>

      {/* 分页按钮 */}
      <div className="pagination-buttons">
        <button onClick={goToPrevPage} disabled={currentPage === 1 || isLoading}>上一页</button>
        <button onClick={goToNextPage} disabled={poetryData.length < poemsPerPage || isLoading}>下一页</button>
      </div>

      <div className="attribution">    
        本站在使用上还存在一些小问题，详情请至留言板查看或反馈。
        <br /><a href="https://www.winglok.com" target="_blank">留言板</a>
      </div>
      
      <footer>
        <a href="/">古诗词网</a><span>版权所有</span>
      </footer>
    </>
  );
}

export default Home;
