export default function Poem({ title, author, section, chapter, content }) {
  // 将内容数组转换成字符串，每段之间用 <br><br> 分隔
  const combinedContent = Array.isArray(content) ? content.join('<br><br>') : '';

  return (
    <div>
      <h3>{title}</h3>
      <h4>{author}</h4>
      <h5>{section}</h5>
      <h5>{chapter}</h5>
      <div dangerouslySetInnerHTML={{ __html: combinedContent }} />
    </div>
  );
}
