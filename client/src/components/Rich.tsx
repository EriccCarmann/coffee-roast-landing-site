import type { ReactNode } from 'react';
import { PHONE_DISPLAY, PHONE_TEL } from '../data/site';

// Renders translation strings that contain a tiny, fixed set of tags:
//   <b>..</b>  <i>..</i>  <br/>  <phone/>
// It builds real React elements, so there is no dangerouslySetInnerHTML
// and nothing from a string can inject arbitrary HTML.
const TOKEN = /(<\/?(?:b|i)>|<br\/>|<phone\/>)/g;

type OpenTag = { tag: 'strong' | 'em'; children: ReactNode[] };

export default function Rich({ text }: { text: string }) {
  const root: { children: ReactNode[] } = { children: [] };
  const stack: Array<{ children: ReactNode[]; tag?: 'strong' | 'em' }> = [root];
  let key = 0;

  const top = () => stack[stack.length - 1];
  const close = () => {
    const node = stack.pop() as OpenTag;
    const Tag = node.tag;
    top().children.push(<Tag key={key++}>{node.children}</Tag>);
  };

  for (const part of String(text).split(TOKEN)) {
    if (!part) continue;
    if (part === '<br/>') {
      top().children.push(<br key={key++} />);
    } else if (part === '<phone/>') {
      top().children.push(
        <a key={key++} href={`tel:${PHONE_TEL}`}>
          {PHONE_DISPLAY}
        </a>,
      );
    } else if (part === '<b>' || part === '<i>') {
      stack.push({ tag: part === '<b>' ? 'strong' : 'em', children: [] });
    } else if (part === '</b>' || part === '</i>') {
      if (stack.length > 1) close();
    } else {
      top().children.push(part);
    }
  }
  while (stack.length > 1) close(); // tolerate an unclosed tag

  return <>{root.children}</>;
}
