export default function Poem({ title, author, paragraphs }) {
  return (
    <div>
      {title && <h3>{title}</h3>}
      {author && <p>{author}</p>}
      {paragraphs.map((paragraph, index) => (
        <p key={index}>{paragraph}</p>
      ))}
    </div>
  );
}
