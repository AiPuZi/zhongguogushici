export default function Poem({ title, author, paragraphs }) {
  return (
    <div>
      {title && <h3>{title}</h3>}
      {author && <p>{author}</p>}
      {paragraphs.map((paragraph, index) => (
        // 使用 split 方法将每个段落的字符串按 <br> 分割，然后遍历数组渲染每一行
        <div key={index}>
          {paragraph.split('<br>').map((line, lineIndex) => (
            <p key={lineIndex}>{line}</p>
          ))}
        </div>
      ))}
    </div>
  );
}
