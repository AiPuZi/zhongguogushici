export default function Poem({ title, author, paragraphs }) {
  // 将段落数组转换成一个字符串，段落之间用 <br> 分隔
  // 如果段落内部已经包含 <br>，这将保留所有的换行
  const combinedParagraphs = paragraphs.join('<br><br>');

  return (
    <div>
      {title && <h3>{title}</h3>}
      {author && <p>{author}</p>}
      {/* 使用 dangerouslySetInnerHTML 渲染包含 <br> 的段落字符串 */}
      <div dangerouslySetInnerHTML={{ __html: combinedParagraphs }} />
    </div>
  );
}
