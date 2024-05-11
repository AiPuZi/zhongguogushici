export default function Poem({ title, author, content, chapter, section, comments = [], rhythmic }) {
  const subtitle = chapter ? `${chapter} - ${section}` : section; // 定义副标题
  const commentElements = comments.map((comment, index) => (
    <p key={index}>{comment}</p>
  ));

  // 检查是否有章节信息，如果有，则渲染章节标题、来源和作者
  const renderChapter = (chapterInfo) => {
    return (
      <div>
        <h4>{chapterInfo.chapter}</h4>
        <p><strong>来源：</strong>{chapterInfo.source}</p>
        <p><strong>作者：</strong>{chapterInfo.author}</p>
        {chapterInfo.paragraphs.map((paragraph, index) => (
          <p key={index} style={{ marginBottom: '16px' }}>{paragraph}</p>
        ))}
      </div>
    );
  };

  return (
    <div>
      {subtitle && <h4>{subtitle}</h4>}
      {title ? <h3>{title}</h3> : (rhythmic && <h3>{rhythmic}</h3>)}
      {author && <h4>{author}</h4>}
      {/* 如果内容是数组，则渲染每个章节 */}
      {Array.isArray(content) ? content.map((chapterInfo, index) => (
        <div key={index}>
          {renderChapter(chapterInfo)}
        </div>
      )) : (
        // 否则，直接渲染内容
        <div>
          {content}
        </div>
      )}
      <div className="comments">
        {commentElements}
      </div>
    </div>
  );
}
