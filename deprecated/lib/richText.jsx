// richText.jsx
// Renders the limited markup that raysume emits into React elements.
//
// The resume JSON carries <strong> and <em> because the source YAML uses
// **bold** and *italic*, and raysume converts those before writing. Rendering
// with dangerouslySetInnerHTML would work and would also mean any future change
// to the source could inject arbitrary HTML into the page. Instead this parses
// an allow-list of exactly two tags and emits React elements. Anything else in
// the string is treated as literal text.

const ENTITIES = {
  '&amp;': '&', '&lt;': '<', '&gt;': '>', '&quot;': '"',
  '&#x27;': "'", '&#39;': "'", '&nbsp;': ' ',
};

export function decodeEntities(text) {
  return text.replace(/&(?:amp|lt|gt|quot|nbsp|#x27|#39);/g, m => ENTITIES[m] ?? m);
}

const TAG = /<(strong|em)>([\s\S]*?)<\/\1>/g;

export function richText(input) {
  if (!input) return null;
  const nodes = [];
  let last = 0;
  let match;
  TAG.lastIndex = 0;

  while ((match = TAG.exec(input)) !== null) {
    if (match.index > last) {
      nodes.push(decodeEntities(input.slice(last, match.index)));
    }
    const [, tag, inner] = match;
    const content = decodeEntities(inner);
    nodes.push(tag === 'strong'
      ? <strong key={nodes.length}>{content}</strong>
      : <em key={nodes.length}>{content}</em>);
    last = match.index + match[0].length;
  }

  if (last < input.length) nodes.push(decodeEntities(input.slice(last)));
  return nodes;
}

/**
 * Decodes entities and strips markup, for fields rendered as plain strings
 * rather than through RichText.
 *
 * raysume HTML-escapes every value before writing the JSON, so an ampersand
 * arrives as &amp; and an apostrophe as &#x27;. RichText already decodes those
 * on its way to React elements. Fields that skip RichText - section titles,
 * an entry's location and context - would otherwise render the escape sequence
 * literally on screen, which is exactly the "&amp;" showing up as text.
 */
export function plain(text) {
  if (!text) return '';
  return decodeEntities(String(text).replace(/<[^>]+>/g, ''));
}

export default function RichText({ children }) {
  return <>{richText(children)}</>;
}
