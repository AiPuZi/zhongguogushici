import Head from 'next/head';
import { useState, useEffect } from 'react';
import Poem from '../components/poem';

async function getPoetryData(category, page, perPage) {
  const response = await fetch(`/api/search?category=${category}&page=${page}&perPage=${perPage}`);
  const data = await response.json();
  return data.map(item => ({
    title: item.title || '',
    author: item.author || '',
    content: item.content || [],
    comments: item.comments || [],
    rhythmic: item.rhythmic || '',
  }));
}

export default function Home({ initialPoetryData }) {
  const [currentCategory, setCurrentCategory] = useState('quantangshi');
  const [poetryData, setPoetryData] = useState(initialPoetryData || []);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(0);
  const poemsPerPage = 9;

  useEffect(() => {
    setLoading(true);
    getPoetryData(currentCategory, currentPage, poemsPerPage).then(newPoems => {
      if (currentPage === 0) {
        setPoetryData(newPoems);
      } else {
        setPoetryData(prevPoems => [...prevPoems, ...newPoems]);
      }
      setLoading(false);
    });
  }, [currentPage, currentCategory]);

  const handleCategoryChange = (category) => {
  setCurrentCategory(category);
  setCurrentPage(0);
  setPoetryData([]);
};

  const goToNextPage = () => {
    if (!loading && poetryData.length >= poemsPerPage) {
      setCurrentPage(prevPage => prevPage + 1);
    }
  };

  const goToPrevPage = () => {
    if (!loading && currentPage > 0) {
      setCurrentPage(prevPage => prevPage - 1);
    }
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
          <Poem key={index} {...poem} />
        ))}
        {loading && <p>Loading...</p>}
      </main>
      <div className="pagination-buttons">
        <button onClick={goToPrevPage} disabled={loading || currentPage === 0}>上一页</button>
        <button onClick={goToNextPage} disabled={loading || poetryData.length < poemsPerPage}>下一页</button>
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

export async function getStaticProps() {
  // 这里我们调用 getPoetryData 函数来获取全唐诗的第一页数据
  const initialPoetryData = await getPoetryData('quantangshi', 0, 9);

  // 返回的对象将会被用作页面组件的 props
  return {
    props: {
      initialPoetryData,
    },
    // 你可以设置 revalidate 来开启 ISR，如果数据更新不频繁，可以设置较长时间
    revalidate: 3600, // 例如，每小时更新一次
  };
}
