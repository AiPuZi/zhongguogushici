export default function Poem({ title, author, content, chapter, section, comments = [] }) {
  const combinedContent = Array.isArray(content) ? content.join('<br><br>') : content;

  const commentElements = comments.map((comment, index) => (
    <p key={index}>{comment}</p>
  ));

  // 如果标题和作者都不存在，直接返回内容和评论
  if (!title && !author) {
    return (
      <div>
        <div dangerouslySetInnerHTML={{ __html: combinedContent }} />
        <div className="comments">
          {commentElements}
        </div>
      </div>
    );
  }

  // 否则，返回包含章节、标题、作者、内容和评论的完整结构
 return (
    <div>
      {section && <h4>{section}</h4>}
      {chapter && <h5>{chapter}</h5>}
      {title && <h3>{title}</h3>}
      {author && <h4>{author}</h4>}
      <div dangerouslySetInnerHTML={{ __html: combinedContent }} />
      <div className="comments">
        {commentElements}
      </div>
    </div>
  );
}
