// pages/categories/[category]/[poem].js
import fs from 'fs';
import path from 'path';
import Head from 'next/head';

// 这个函数决定了哪些动态路径将被预渲染
export async function getStaticPaths() {
  const categoriesDir = path.join(process.cwd(), 'public');
  const categoryDirs = fs.readdirSync(categoriesDir);

  let paths = [];

  categoryDirs.forEach((category) => {
    const categoryPath = path.join(categoriesDir, category);
    const poemFiles = fs.readdirSync(categoryPath);

    poemFiles.forEach((file) => {
      const poem = file.replace(/\.json$/, ''); // 移除 ".json" 后缀
      paths.push({
        params: { category, poem },
      });
    });
  });

  return { paths, fallback: 'blocking' };
}

// 这个函数获取数据并传递给页面
export async function getStaticProps({ params }) {
  const { category, poem } = params;
  const filePath = path.join(process.cwd(), 'public', category, `${poem}.json`);
  const fileContents = fs.readFileSync(filePath, 'utf8');
  const poemData = JSON.parse(fileContents);

  return {
    props: {
      poemData,
    },
    revalidate: 3600, // 例如，每小时更新一次
  };
}

// 页面组件使用 getStaticProps 获取的数据进行渲染
export default function PoemPage({ poemData }) {
  return (
    <>
      <Head>
        <title>{poemData.title}</title>
      </Head>
      <main>
        <h1>{poemData.title}</h1>
        {/* 渲染诗词内容 */}
        {/* ... */}
      </main>
    </>
  );
}
