import React from 'react';

export default function Poem({ title, author, paragraphs }) {
  const safeParagraphs = Array.isArray(paragraphs) ? paragraphs : [];
  const hasContent = safeParagraphs.some(paragraph => paragraph.trim() !== '');
  const combinedParagraphs = hasContent ? safeParagraphs.join('<br><br>') : '内容不可用';

  return (
    <div>
      {title && <h3>{title}</h3>}
      {author && <p>{author}</p>}
      <div dangerouslySetInnerHTML={{ __html: combinedParagraphs }} />
    </div>
  );
}
