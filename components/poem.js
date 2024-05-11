export default function Poem({ title, author, content, chapter, source, rhythmic, paragraphs, comments = [], abstract }) {
  const subtitle = chapter || source || rhythmic || author || title; // 根据优先级选择副标题
  const commentElements = comments.map((comment, index) => (
    <p key={index}>{comment}</p>
  ));

  return (
    <div>
      {abstract && abstract.map((paragraph, index) => (
        <p key={index} style={{ fontStyle: 'italic' }}>{paragraph}</p>
      ))}
      {subtitle && <h4>{subtitle}</h4>}
      {title && <h3>{title}</h3>}
      {author && !paragraphs && <h4>{author}</h4>}
      {source && <h4>{source}</h4>}
      {rhythmic && <h3>{rhythmic}</h3>}
      {content && (
        <div>
          {Array.isArray(content) ? content.map((paragraph, index) => (
            <p key={index} style={{ marginBottom: '16px' }}>{paragraph}</p>
          )) : <p>{content}</p>}
        </div>
      )}
      {paragraphs && paragraphs.map((paragraph, index) => (
        <div key={index}>
          {paragraph.chapter && <h4>{paragraph.chapter}</h4>}
          {paragraph.source && <h4>{paragraph.source}</h4>}
          {paragraph.author && <h4>{paragraph.author}</h4>}
          {paragraph.paragraphs && (
            <div>
              {paragraph.paragraphs.map((p, idx) => (
                <p key={idx} style={{ marginBottom: '16px' }}>{p}</p>
              ))}
            </div>
          )}
        </div>
      ))}
      <div className="comments">
        {commentElements}
      </div>
    </div>
  );
}
