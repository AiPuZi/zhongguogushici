export default function Poem({ title, author, content, chapter, comments }) {
  // 将内容数组转换为字符串，并用 <br><br> 分隔
  const combinedContent = content.join('<br><br>');

  // 生成评论元素
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
      {chapter && <h5>{chapter}</h5>}
      <h3>{title}</h3>
      <h4>{author}</h4>
      <div dangerouslySetInnerHTML={{ __html: combinedContent }} />
      <div className="comments">
        {commentElements}
      </div>
    </div>
  );
}
