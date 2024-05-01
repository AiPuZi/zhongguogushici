export default function Poem({ title, author, content, chapter, comments }) {
  const combinedContent = content.join('<br><br>');
  const commentElements = comments.map((comment, index) => (
    <p key={index}>{comment}</p>
  ));

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
