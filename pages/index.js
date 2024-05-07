import Head from 'next/head';
import { useState, useEffect } from 'react';
import Poem from '../components/poem';

// 用于获取诗词数据的函数
async function getPoetryData(category, page, perPage) {
  const response = await fetch(`/api/search?category=${category}&page=${page}&perPage=${perPage}`);
  const data = await response.json();
  return Array.isArray(data) ? data : [];
}

export async function getStaticProps() {
  const baseUrl = process.env.API_BASE_URL;
  const categories = ['quantangshi', 'tangshisanbaishou', 'shuimotangshi', 'yudingquantangshi', 'quansongci', 'songcisanbaishou', 'yuanqu', 'huajianji', 'nantangerzhuci', 'shijing', 'chuci', 'lunyu', 'mengxue', 'nalanxingde', 'youmengying'];
  const initialPoetryData = {};

  for (const category of categories) {
    const response = await fetch(`${baseUrl}/api/search?category=${category}&page=0&perPage=1`);
    const data = await response.json();
    const firstPoem = Array.isArray(data) ? data[0] || null : null;
    if (firstPoem) {
      initialPoetryData[category] = {
        title: firstPoem.title || '',
        author: firstPoem.author || '',
        chapter: firstPoem.chapter || '',
        section: firstPoem.section || '',
        content: Array.isArray(firstPoem.content) ? firstPoem.content : firstPoem.paragraphs || firstPoem.para || [],
        comments: Array.isArray(firstPoem.comment) ? firstPoem.comment : [],
        rhythmic: firstPoem.rhythmic || '',
      };
    }
  }

  return {
    props: {
      initialPoetryData,
    },
    revalidate: 10,
  };
}



export default function Home({ initialPoetryData }) {
  const [currentCategory, setCurrentCategory] = useState('quantangshi');
  const [poetryData, setPoetryData] = useState(initialPoetryData[currentCategory] || []);
  const [nextPageData, setNextPageData] = useState([]);
  const [searchInput, setSearchInput] = useState('');
  const [currentPage, setCurrentPage] = useState(0);
  const poemsPerPage = 9;

  useEffect(() => {
    loadPoetryData();
  }, [currentCategory, currentPage]);

  const loadPoetryData = async () => {
    const currentPageData = await getPoetryData(currentCategory, currentPage, poemsPerPage);
    setPoetryData(prevData => [...prevData, ...currentPageData]);

    const nextPage = currentPage + 1;
    const nextPageData = await getPoetryData(currentCategory, nextPage, poemsPerPage);
    setNextPageData(nextPageData);
  };

  const handleCategoryChange = async (category, event) => {
    event.preventDefault();
    setCurrentCategory(category);
    setCurrentPage(0);
    window.location.hash = category;
  };

  const handleSearch = async (event) => {
    event.preventDefault();
    window.location.href = `/search?query=${encodeURIComponent(searchInput)}`;
  };

  const goToNextPage = async () => {
    setCurrentPage(prevPage => prevPage + 1);
    setPoetryData(prevData => [...prevData, ...nextPageData]);
    const nextPageData = await getPoetryData(currentCategory, currentPage + 1, poemsPerPage);
    setNextPageData(nextPageData);
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
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
          />
          <button id="searchButton" onClick={handleSearch}>搜索</button>
        </div>
      </header>
              
      <nav className="poetry-navigation">
  {Object.keys(initialPoetryData).map((category, index) => (
    <a key={index} href={`#${category}`} onClick={(e) => handleCategoryChange(category, e)}>{category}</a>
  ))}
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
      </main>

      <div className="pagination-buttons">
        <button onClick={goToPrevPage} disabled={currentPage === 0}>上一页</button>
        <button onClick={goToNextPage} disabled={nextPageData.length === 0}>下一页</button>
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
