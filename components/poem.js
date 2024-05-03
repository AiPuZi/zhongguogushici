export default function Poem({ title, author, content, paragraphs, chapter, section, comments = [], rhythmic }) {
  const combinedContent = Array.isArray(content) ? content.join('<br><br>') : content;
  const subtitle = chapter || section; // 定义副标题
  const commentElements = comments.map((comment, index) => (
    <p key={index}>{comment}</p>
  ));

  return (
    <div>
      {subtitle && <h4>{subtitle}</h4>}
      {/* 如果有 title，就展示 title，否则如果有 rhythmic，就展示 rhythmic */}
      {title ? <h3>{title}</h3> : (rhythmic && <h3>{rhythmic}</h3>)}
      {paragraphs && paragraphs.map((para, index) => <p key={index}>{para}</p>)}
      {author && <h4>{author}</h4>}
      <div dangerouslySetInnerHTML={{ __html: combinedContent }} />
      <div className="comments">
        {commentElements}
      </div>
    </div>
  );
}
