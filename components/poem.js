export default function Poem({ title, author, content, chapter }) {
  const combinedContent = content.join('<br><br>');

  return (
    <div>
     {chapter && <h5>{chapter}</h5>}
      <h3>{title}</h3>
      <h4>{author}</h4>
      <div dangerouslySetInnerHTML={{ __html: combinedContent }} />
    </div>
  );
}
