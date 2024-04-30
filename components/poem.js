export default function Poem({ title, chapter, section, content, comment }) {
  // 将内容数组转换成字符串，每段之间用 <br><br> 分隔
  const combinedContent = content.join('<br><br>');

  // 如果存在评论，则将其也转换成字符串
  const combinedComment = comment ? comment.join('<br><br>') : null;

  return (
    <div>
      {/* 只有当 title 存在时，才显示标题 */}
      {title && <h3>{title}</h3>}
      {/* 只有当 chapter 存在时，才显示章节 */}
      {chapter && <h4>{chapter}</h4>}
      {/* 只有当 section 存在时，才显示节 */}
      {section && <h5>{section}</h5>}
      {/* 显示内容 */}
      <div dangerouslySetInnerHTML={{ __html: combinedContent }} />
      {/* 如果存在评论，显示评论 */}
      {combinedComment && (
        <div className="comments" dangerouslySetInnerHTML={{ __html: combinedComment }} />
      )}
    </div>
  );
}
