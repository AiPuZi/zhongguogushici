export default function Poem({ title, author, content, chapter, section, comments = [], rhythmic }) {
  const subtitle = chapter && section ? `${chapter} - ${section}` : chapter || section || rhythmic || author || title; // 根据优先级选择副标题
  const commentElements = comments.map((comment, index) => (
    <p key={index}>{comment}</p>
  ));

  return (
    <div>
      {subtitle && <h4>{subtitle}</h4>}
      {title && <h3>{title}</h3>}
      {author && <h4>{author}</h4>}
      {rhythmic && <h3>{rhythmic}</h3>}
      {content && Array.isArray(content) && (
        <div>
          {content.map((item, index) => (
            <div key={index}>
              {item.type && <h5>{item.type}</h5>}
              {item.content && Array.isArray(item.content) && (
                <div>
                  {item.content.map((subitem, idx) => (
                    <div key={idx}>
                      {subitem.chapter && <h6>{subitem.chapter}</h6>}
                      {subitem.author && <h6>{subitem.author}</h6>}
                      {subitem.paragraphs && Array.isArray(subitem.paragraphs) && (
                        <div>
                          {subitem.paragraphs.map((paragraph, i) => (
                            <p key={i}>{paragraph}</p>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
      <div className="comments">
        {commentElements}
      </div>
    </div>
  );
}
