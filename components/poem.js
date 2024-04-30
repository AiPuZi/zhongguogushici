export default function Poem({ title, chapter, section, content, comment }) {
  // 将内容数组转换成字符串，每段之间用 <br><br> 分隔
  const combinedContent = content.join('<br><br>');

  // 如果存在评论，则将其也转换成字符串
  const combinedComment = comment ? comment.join('<br><br>') : null;

  return (
    <div>
      {title && <h3>{title}</h3>}
      {chapter && <h4>{chapter}</h4>}
      {section && <h5>{section}</h5>}
      <div dangerouslySetInnerHTML={{ __html: combinedContent }} />
      {combinedComment && (
        <div className="comments" dangerouslySetInnerHTML={{ __html: combinedComment }} />
      )}
    </div>
  );
}
