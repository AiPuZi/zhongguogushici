import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import Poem from '../components/poem';
import { useRouter } from 'next/router';

// 假设您的 NEXT_PUBLIC_API_BASE_URL 是在 .env.local 或类似文件中定义的
const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;

async function fetchData(category, page, perPage, fileIndex, baseUrl, searchKeyword) {
  let url = `${baseUrl}/api/poems?category=${category}&page=${page}&perPage=${perPage}&fileIndex=${fileIndex}`;
  
  if (searchKeyword) {
    url += `&searchKeyword=${encodeURIComponent(searchKeyword)}`;
  }

  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }
  
  return await response.json();
}

async function fetchFileCount(category) {
  const url = `${baseUrl}/api/filecount?category=${category}`;
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }
  return await response.json();
}

export async function getStaticProps() {
  // 确保baseUrl是定义好的，否则在构建时可能会遇到问题
  if (!baseUrl) {
    console.error('NEXT_PUBLIC_API_BASE_URL environment variable is not set');
    return {
      props: {
        initialPoetryData: [],
        initialFileCount: 0,
      },
    };
  }

  const initialData = await fetchData('quantangshi', 1, 9, 0, baseUrl);
  return {
    props: {
      initialPoetryData: initialData.poems,
      initialFileCount: initialData.totalFiles,
    },
    revalidate: 10,
  };
}

function Home({ initialPoetryData, initialFileCount }) {
  const router = useRouter();
  const [currentCategory, setCurrentCategory] = useState('quantangshi');
  const [poetryData, setPoetryData] = useState(initialPoetryData);
  const [currentPage, setCurrentPage] = useState(1);
  const [currentFileIndex, setCurrentFileIndex] = useState(0);
  const [fileCount, setFileCount] = useState(initialFileCount);
  const poemsPerPage = 9;
  const [searchKeyword, setSearchKeyword] = useState('');

  useEffect(() => {
    let cancel = false;

    const fetchAndSetPoetryData = async () => {
      try {
        const data = await fetchData(currentCategory, currentPage, poemsPerPage, currentFileIndex, baseUrl);
        if (!cancel) {
          setPoetryData(data.poems);
        }
      } catch (error) {
        console.error('Error fetching poetry data:', error);
      }
    };

    fetchAndSetPoetryData();

    return () => {
      cancel = true;
    };
  }, [currentCategory, currentPage, currentFileIndex]);

  useEffect(() => {
    const fetchAndSetFileCount = async () => {
      try {
        const data = await fetchFileCount(currentCategory);
        setFileCount(data.count);
      } catch (error) {
        console.error('Error fetching file count:', error);
      }
    };

    fetchAndSetFileCount();
  }, [currentCategory]);

  const handleCategoryChange = async (category) => {
    setCurrentCategory(category);
    setCurrentPage(1);
    setCurrentFileIndex(0);
  };

  const handleSearch = async (event) => {
    event.preventDefault();
    try {
      const data = await fetchData(currentCategory, 1, poemsPerPage, 0, baseUrl, searchKeyword);
      setPoetryData(data.poems);
      setCurrentPage(1);
      setCurrentFileIndex(0);
    } catch (error) {
      console.error('Error performing search:', error);
    }
  };
  
  const goToNextPage = async () => {
    const nextPage = currentPage + 1;
    const data = await fetchData(currentCategory, nextPage, poemsPerPage, currentFileIndex);
    
    if (data.poems.length > 0) {
      // There is data in the current file, simply update the page
      setCurrentPage(nextPage);
    } else if (currentFileIndex < fileCount - 1) {
      // No more data in the current file, move to the next file
      setCurrentFileIndex(currentFileIndex + 1);
      setCurrentPage(1);
    }
  };

  const goToPrevPage = async () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    } else if (currentFileIndex > 0) {
      // Move to the previous file last page
      const prevFileIndex = currentFileIndex - 1;
      const data = await fetchData(currentCategory, 1, poemsPerPage, prevFileIndex);
      setCurrentFileIndex(prevFileIndex);
      setCurrentPage(Math.ceil(data.poems.length / poemsPerPage));
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
        本站有几十万首诗词，数据量庞大，难免出现错漏。如你在查阅中发现问题，请至留言板留言反馈。    
        <br />在使用方面，网站还存在以下几个问题（有空会不断更新处理）：
        <br />1.第一次点击下一页按钮时需要点击两次才有反应，以后就不用。唐诗分类第一次可能要点击几次。
        <br />2.全唐诗分类诗词数量非常多，所以从其他分类点击回这个分类时加载较缓慢，要等几秒才能显示。
        <br />3.搜索的时候比较缓慢，需要等8秒左右才能显示。如果搜索的内容不存在，页面会显示空白。
        <br /><a href="https://www.winglok.com" target="_blank">留言板</a>
      </div>
      
      <footer>
        <a href="https://www.winglok.com">GUSHICI.WANG</a><span>版权所有</span>
      </footer>
    </>
  );
}

export default Home;
