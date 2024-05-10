import React, { useState, useEffect } from 'react';
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

async function preFetchNextPage(category, currentPage, poemsPerPage, keyword, setNextPageData) {
  const data = await fetchData(category, currentPage + 1, poemsPerPage, keyword);
  setNextPageData(data);
}

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
  const [nextPageData, setNextPageData] = useState([]);
  const [searchKeyword, setSearchKeyword] = useState('');
  const [currentPage, setCurrentPage] = useState(0);
  const poemsPerPage = 9;

  useEffect(() => {
    let cancel = false;
    const fetchDataAndSetPoetryData = async () => {
      const keyword = router.query.query ? decodeURIComponent(router.query.query) : '';
      const data = await fetchData(currentCategory, currentPage, poemsPerPage, keyword);
      if (!cancel) {
        setPoetryData(data);
        if (currentPage === 0) {
          preFetchNextPage(currentCategory, currentPage, poemsPerPage, keyword, setNextPageData); // Pre-fetch data for next page
        }
      }
    };

    if (currentCategory !== '') {
      fetchDataAndSetPoetryData();
    }

    return () => {
      cancel = true;
    };
  }, [currentCategory, currentPage, poemsPerPage, router.query.query]);

  const handleCategoryChange = async (category, event) => {
    event.preventDefault();
    setCurrentCategory(category);
    setCurrentPage(0);
    const data = await fetchData(category, 0, poemsPerPage, '');
    setPoetryData(data);
    preFetchNextPage(category, 0, poemsPerPage, '', setNextPageData); // Pre-fetch data for next page
  };

  const handleSearch = async (event) => {
    event.preventDefault();
    const data = await fetchData(currentCategory, 0, poemsPerPage, searchKeyword);
    setPoetryData(data);
    preFetchNextPage(currentCategory, 0, poemsPerPage, searchKeyword, setNextPageData); // Pre-fetch data for next page
  };

  const goToNextPage = async () => {
  if (nextPageData.length > 0) {
    // 增加当前页的页数
    setCurrentPage((prevPage) => prevPage + 1);
    // 更新页面数据为预取的数据
    setPoetryData(nextPageData);
    // 清空nextPageData状态，以便下一次的预取操作
    setNextPageData([]);
    // 预取下一页的数据
    const keyword = router.query.query ? decodeURIComponent(router.query.query) : '';
    await preFetchNextPage(currentCategory, currentPage + 1, poemsPerPage, keyword, setNextPageData);
  }
};

  const goToPrevPage = () => {
    setCurrentPage(prevPage => (prevPage > 0 ? prevPage - 1 : 0));
  };

  return (
    <>
      <Head>
        <title>古诗词网</title>
        // <link rel="icon" type="image/png" href="/logo.png" />
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
        <button onClick={goToNextPage} disabled={nextPageData.length === 0}>下一页</button>
      </div>

      <div className="attribution">
        本站有几十万首诗词，数据量庞大，难免出现错漏。如你在查阅中发现问题，请至留言板留言反馈。    
        <br />在使用方面，网站还存在以下几个问题（有空会不断更新处理）：
        <br />1.全唐诗分类诗词数量非常多，打开首页时加载较缓慢，要等一会才能使用下一页按钮。
        <br />2.第一次点击下一页按钮时需要点击两次才能显示下一页内容，第二次以后就不用。
        <br />3.搜索的时候较缓慢，需要等10秒左右才能显示结果。如果搜索的内容不存在，页面会显示空白。
        <br /><a href="https://www.winglok.com" target="_blank">留言板</a>
      </div>
      
      <footer>
        <a href="https://www.winglok.com">GUSHICI.WANG</a><span>版权所有</span>
      </footer>
    </>
  );
}

export default Home;
