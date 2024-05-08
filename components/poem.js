export default function Poem({ title, author, content, chapter, section, comments = [], rhythmic }) {
  const subtitle = chapter || section; // 定义副标题
  const commentElements = comments.map((comment, index) => (
    <p key={index}>{comment}</p>
  ));

  let contentElements = null;
  if (Array.isArray(content)) {
    // 如果内容是字符串数组，则将每行内容渲染为一个段落
    contentElements = content.map((line, index) => <p key={index} style={{ marginBottom: '16px' }}>{line}</p>);
  } else {
    // 如果内容是字符串，则直接渲染为一个段落
    contentElements = <p>{content}</p>;
  }

  return (
    <div>
      {subtitle && <h4>{subtitle}</h4>}
      {title ? <h3>{title}</h3> : (rhythmic && <h3>{rhythmic}</h3>)}
      {author && <h4>{author}</h4>}
      {/* 渲染诗词内容 */}
      <div>
        {contentElements}
      </div>
      <div className="comments">
        {commentElements}
      </div>
    </div>
  );
}
