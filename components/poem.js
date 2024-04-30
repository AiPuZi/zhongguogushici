export default function Poem({ title, author, paragraphs }) {
  // 如果 paragraphs 不是数组，使用空数组作为默认值
  const safeParagraphs = Array.isArray(paragraphs) ? paragraphs : [];
  // 将段落数组转换成一个字符串，段落之间用 <br><br> 分隔
  const combinedParagraphs = safeParagraphs.join('<br><br>');

  return (
    <div>
      {title && <h3>{title}</h3>}
      {author && <p>{author}</p>}
      {/* 使用 dangerouslySetInnerHTML 渲染包含 <br> 的段落字符串 */}
      <div dangerouslySetInnerHTML={{ __html: combinedParagraphs }} />
    </div>
  );
}
