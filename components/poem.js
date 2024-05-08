export default function Poem({ title, author, content, chapter, section, comments = [], rhythmic }) {
  const subtitle = chapter || section; // 定义副标题
  const commentElements = comments.map((comment, index) => (
    <p key={index}>{comment}</p>
  ));

// 如果 content 是一个数组，则将其连接为一个字符串
  if (Array.isArray(content)) {
    content = content.join('\n');
  }
  
  return (
    <div>
      {subtitle && <h4>{subtitle}</h4>}
      {title ? <h3>{title}</h3> : (rhythmic && <h3>{rhythmic}</h3>)}
      {author && <h4>{author}</h4>}
      {/* 直接渲染content数组的每个元素为一个段落 */}
      <div>
        {Array.isArray(content) ? content.map((paragraph, index) => (
          <p key={index} style={{ marginBottom: '16px' }}>{paragraph}</p>
        )) : <p>{content}</p>}
      </div>
      <div className="comments">
        {commentElements}
      </div>
    </div>
  );
}
