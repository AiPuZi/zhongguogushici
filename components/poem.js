export default function Poem({ title, author, paragraphs }) {
  // 检查每个段落是否包含换行符，并将它们替换为 <br> 标签
  const processedParagraphs = paragraphs.map(paragraph =>
    paragraph.includes('<br>') ? paragraph : paragraph.replace(/\n/g, '<br>')
  );

  // 将处理后的段落数组转换成一个字符串，段落之间用 <br><br> 分隔
  const combinedParagraphs = processedParagraphs.join('<br><br>');

  return (
    <div>
      {title && <h3>{title}</h3>}
      {author && <p>{author}</p>}
      {/* 使用 dangerouslySetInnerHTML 渲染包含 <br> 的段落字符串 */}
      <div dangerouslySetInnerHTML={{ __html: combinedParagraphs }} />
    </div>
  );
}
