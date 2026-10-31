import React from 'react';

function renderNode(node, key) {
  if (!node) return null;

  if (Array.isArray(node)) {
    return node.map((child, index) => renderNode(child, index));
  }

  if (node.type === 'text') {
    let result = node.value || '';

    if (node.bold) {
      result = <strong>{result}</strong>;
    }

    if (node.italic) {
      result = <em>{result}</em>;
    }

    return <React.Fragment key={key}>{result}</React.Fragment>;
  }

  const children = (node.children || []).map((child, index) =>
    renderNode(child, index),
  );

  switch (node.type) {
    case 'root':
      return <React.Fragment key={key}>{children}</React.Fragment>;
    case 'paragraph':
      return <p key={key}>{children}</p>;
    case 'heading': {
      const level = Math.min(Math.max(Number(node.level) || 2, 1), 6);
      return React.createElement(`h${level}`, {key}, children);
    }
    case 'list':
      return node.listType === 'ordered'
        ? <ol key={key}>{children}</ol>
        : <ul key={key}>{children}</ul>;
    case 'list-item':
      return <li key={key}>{children}</li>;
    case 'link':
      return <a key={key} href={node.url}>{children}</a>;
    default:
      return <React.Fragment key={key}>{children}</React.Fragment>;
  }
}

export function ShopifyRichText({value}) {
  if (!value) return null;

  let document;

  try {
    document = typeof value === 'string' ? JSON.parse(value) : value;
  } catch {
    return <p>{String(value)}</p>;
  }

  return renderNode(document, 'root');
}
