import { createElement } from 'react';

// Translations contain <strong>, <em>, <a href> and <br>. Instead of dangerouslySetInnerHTML
// we parse only those tags and build ordinary React elements from them.
const TAG = /<(\/?)(strong|em|a|br)\b([^>]*?)\/?>/gi;

function parseAttrs(src) {
  const attrs = {};
  src.replace(/([\w-]+)="([^"]*)"/g, (_, k, v) => { attrs[k] = v; });
  return attrs;
}

function parse(html) {
  const root = { children: [] };
  const stack = [root];
  const top = () => stack[stack.length - 1];
  let last = 0;
  let m;
  TAG.lastIndex = 0;
  while ((m = TAG.exec(html))) {
    if (m.index > last) top().children.push(html.slice(last, m.index));
    last = TAG.lastIndex;
    const [, closing, rawTag, attrSrc] = m;
    const tag = rawTag.toLowerCase();
    if (tag === 'br') top().children.push({ tag, props: {}, children: [] });
    else if (closing) { if (stack.length > 1) stack.pop(); }
    else {
      const node = { tag, props: parseAttrs(attrSrc), children: [] };
      top().children.push(node);
      stack.push(node);
    }
  }
  if (last < html.length) top().children.push(html.slice(last));
  return root.children;
}

const render = (nodes) => nodes.map((n, i) => (
  typeof n === 'string'
    ? n
    : createElement(n.tag, { key: i, ...n.props }, ...(n.tag === 'br' ? [] : render(n.children)))
));

export default function Rich({ html }) {
  return html.includes('<') ? <>{render(parse(html))}</> : html;
}
