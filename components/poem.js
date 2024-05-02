export default function Poem({ title, author, content, chapter, section, comments = [] }) {
  const combinedContent = Array.isArray(content) ? content.join('<br><br>') : content;
  const subtitle = chapter || section; // 定义副标题

  const commentElements = comments.map((comment, index) => (
    <p key={index}>{comment}</p>
  ));

  return (
    <div>
      {subtitle && <h4>{subtitle}</h4>}
      <h3>{title}</h3>
      {author && <h4>{author}</h4>}
      <div dangerouslySetInnerHTML={{ __html: combinedContent }} />
      <div className="comments">
        {commentElements}
      </div>
    </div>
  );
}
