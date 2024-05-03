export default function Poem({ title, author, paragraphs, chapter, section, comments, rhythmic }) {
  const combinedContent = Array.isArray(content) ? content.join('<br><br>') : content;
  const subtitle = chapter || section; // 定义副标题
  
  // 处理评论元素，同时展示 surname 和 place
  const commentElements = comments.map((comment, index) => (
    <p key={index}>{comment.surname} - {comment.place}</p>
  ));

  return (
    <div>
      {subtitle && <h4>{subtitle}</h4>}
      {title ? <h3>{title}</h3> : (rhythmic && <h3>{rhythmic}</h3>)}
      {paragraphs && paragraphs.map((para, index) => <p key={index}>{para}</p>)}
      {author && <h4>{author}</h4>}
      <div dangerouslySetInnerHTML={{ __html: combinedContent }} />
      <div className="comments">
        {/* 直接使用 commentElements 展示 surname 和 place */}
        {commentElements}
      </div>
    </div>
  );
}
