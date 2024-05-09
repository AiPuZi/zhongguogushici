export default function Poem({ title, author, content, chapter, section, comments = [], rhythmic }) {
  // 确保 chapter 和 paragraphs 属性存在，即使它们未在组件中使用
  chapter = chapter || "";
  const paragraphs = Array.isArray(content) ? content : [content];
  
  const subtitle = chapter || section; // 定义副标题
  const commentElements = comments.map((comment, index) => (
    <p key={index}>{comment}</p>
  ));

  return (
    <div>
      {subtitle && <h4>{subtitle}</h4>}
      {title && <h3>{title}</h3>}
      {author && <h4>{author}</h4>}
      {/* 渲染段落 */}
      {paragraphs.map((paragraph, index) => (
        <p key={index} style={{ marginBottom: '16px' }}>{paragraph}</p>
      ))}
      <div className="comments">
        {commentElements}
      </div>
    </div>
  );
}
