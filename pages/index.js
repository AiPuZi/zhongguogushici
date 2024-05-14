import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import Poem from '../components/poem';
import { useRouter } from 'next/router';
import * as OpenCC from 'opencc-js/core'; // 导入opencc-js核心
import * as Locale from 'opencc-js/preset'; // 导入opencc-js预设

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

  const converter = OpenCC.ConverterFactory(Locale.from.hk, Locale.to.cn);

  // 将页面中的所有繁体字转换为简体字
  const simplifiedPoetryData = poetryData.map(item => {
    const simplifiedContent = item.content.map(paragraph => converter(paragraph)).join('\n');
    return { ...item, content: simplifiedContent };
  });

  return {
    props: {
      initialPoetryData: simplifiedPoetryData,
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
    const converter = OpenCC.ConverterFactory(Locale.from.hk, Locale.to.cn);
    const simplifiedData = data.map(item => ({
      ...item,
      // 分段处理诗词内容
      content: item.content.map(paragraph => converter(paragraph).split('\n')), 
    }));
    setPoetryData(simplifiedData);
    if (currentPage === 0) {
      preFetchNextPage(currentCategory, currentPage, poemsPerPage, keyword, setNextPageData); // Pre-fetch data for next page
    }
  }
};
    if (initialPoetryData && initialPoetryData.length > 0) {
      fetchDataAndSetPoetryData();
    }

    return () => {
      cancel = true;
    };
  }, [currentCategory, currentPage, poemsPerPage, router.query.query, initialPoetryData]); // Add initialPoetryData as a dependency

  const handleCategoryChange = (category, event) => {
  event.preventDefault();
  // 更新页面内容
  setCurrentCategory(category);
};

  const handleSearch = async (event) => {
    event.preventDefault();
    const data = await fetchData(currentCategory, 0, poemsPerPage, searchKeyword);
    const converter = OpenCC.ConverterFactory(Locale.from.hk, Locale.to.cn);
    const simplifiedData = data.map(item => ({
      ...item,
      content: item.content.map(paragraph => converter(paragraph)).join('\n'), // 进行繁简转换
    }));
    setPoetryData(simplifiedData);
    if (data.length < poemsPerPage) {
      // 如果搜索结果不足一页，则禁用下一页按钮
      setNextPageData([]);
    } else {
      preFetchNextPage(currentCategory, 0, poemsPerPage, searchKeyword, setNextPageData); // Pre-fetch data for next page
    }
  };

  const goToNextPage = async () => {
  if (nextPageData.length > 0) {
    setCurrentPage(prevPage => prevPage + 1);
    const converter = OpenCC.ConverterFactory(Locale.from.hk, Locale.to.cn);
    const simplifiedData = nextPageData.map(item => ({
      ...item,
      content: item.content.map(paragraph => converter(paragraph).split('\n')), // 分段处理诗词内容
    }));
    setPoetryData(simplifiedData);
    setNextPageData([]);
    const keyword = router.query.query ? decodeURIComponent(router.query.query) : '';
    router.push({
      pathname: router.pathname,
      query: { ...router.query, page: currentPage + 1 },
    });
  } else {
    console.log("没有下一页数据可加载");
  }
};

  const goToPrevPage = () => {
    setCurrentPage(prevPage => (prevPage > 0 ? prevPage - 1 : 0));
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
        <a onClick={(e) => handleCategoryChange('quantangshi', e)}>全唐诗</a>
        <a onClick={(e) => handleCategoryChange('tangshisanbaishou', e)}>唐三百</a> 
        <a onClick={(e) => handleCategoryChange('shuimotangshi', e)}>水墨唐诗</a>
        <a onClick={(e) => handleCategoryChange('yudingquantangshi', e)}>御定全唐诗</a>
        <a onClick={(e) => handleCategoryChange('quansongci', e)}>全宋词</a>
        <a onClick={(e) => handleCategoryChange('songcisanbaishou', e)}>宋三百</a>
        <a onClick={(e) => handleCategoryChange('yuanqu', e)}>元曲</a>
        <a onClick={(e) => handleCategoryChange('huajianji', e)}>花间集</a>
        <a onClick={(e) => handleCategoryChange('nantangerzhuci', e)}>南唐二主词</a>
        <a onClick={(e) => handleCategoryChange('shijing', e)}>诗经</a>
        <a onClick={(e) => handleCategoryChange('chuci', e)}>楚辞</a>
        <a onClick={(e) => handleCategoryChange('lunyu', e)}>论语</a>
        <a onClick={(e) => handleCategoryChange('mengxue', e)}>蒙学</a>
        <a onClick={(e) => handleCategoryChange('nalanxingde', e)}>纳兰性德</a>
        <a onClick={(e) => handleCategoryChange('youmengying', e)}>幽梦影</a>
        <a onClick={(e) => handleCategoryChange('caocaoshiji', e)}>曹操诗集</a>
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
        本站收录诗词数十万首，难免出现错漏。网站在使用上亦存在一些小问题，详情请至留言板查看或反馈。    
        <br /><a href="https://www.winglok.com" target="_blank">留言板</a>
      </div>
      
      <footer>
        <a href="https://www.winglok.com">GUSHICI.WANG</a><span>版权所有</span>
      </footer>
    </>
  );
}

export default Home;
