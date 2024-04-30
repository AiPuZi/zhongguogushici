// Poem.js
export default function Poem({ title, author, content }) {
  // 确保 content 是数组
  const safeContent = Array.isArray(content) ? content : [];

  // 将内容数组转换成字符串，每段之间用 <br><br> 分隔
  const combinedContent = safeContent.join('<br><br>');

  return (
    <div>
      {title && <h3>{title}</h3>}
      {author && <h4>{author}</h4>} {/* 渲染作者 */}
      <div dangerouslySetInnerHTML={{ __html: combinedContent }} />
    </div>
  );
}
