export async function getStaticProps() {
  const baseUrl = process.env.API_BASE_URL;
  const response = await fetch(`${baseUrl}/api/search?category=quantangshi&page=0&perPage=9`);
  const poetryData = await response.json();
  return {
    props: {
      initialPoetryData: poetryData.map(poem => ({
        ...poem,
        author: poem.author,
        content: Array.isArray(poem.content) ? poem.content : [],
        comment: Array.isArray(poem.comment) ? poem.comment : []
      })),
    },
    revalidate: 10,
  };
}
