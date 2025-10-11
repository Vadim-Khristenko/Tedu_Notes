import { visit } from "unist-util-visit";

// Remark plugin: enhanced attribute parser for headings
// - Parses attribute groups at end of heading text like: {#id .cls key="value" flag}
// - Supports:
//    - id via #id shorthand
//    - class via .classname shorthand (can be multiple)
//    - key=value where value can be quoted with single/double or unquoted
//    - bare flags (key) -> true
// - Applies attributes to node.data.hProperties and node.data.id for compatibility with rehype
// - Removes the attribute token from heading text

function unquote(value: string) {
  if (!value) return value;
  if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
    const inner = value.slice(1, -1);
    // unescape common sequences
    return inner.replace(/\\([\\"'])/g, "$1");
  }
  return value;
}

function parseAttributes(attrText: string) {
  const result: Record<string, any> = {};
  const classes: string[] = [];
  let id: string | undefined;

  // Combined regex to match tokens: #id, .class, key="val"|key='val'|key=val|key: "val"|key:val, barekey
  // allow separator '=' or ':' between key and value
  const re = /(#([A-Za-z0-9\-_:.]+))|(\.([A-Za-z0-9\-_:.]+))|([A-Za-z_:][-A-Za-z0-9_:.]*)\s*(?:[:=])\s*("(?:[^"\\]|\\.)*"|'(?:[^'\\]|\\.)*'|[^\s"']+)|([A-Za-z_:][-A-Za-z0-9_:.]*)/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(attrText)) !== null) {
    if (m[2]) {
      // #id
      id = m[2];
      continue;
    }
    if (m[4]) {
      // .class
      classes.push(m[4]);
      continue;
    }
    if (m[5] && m[6]) {
      // key = value
      const key = m[5];
      let raw = m[6];
      raw = unquote(raw);
      // coerce simple types
      if (/^\d+$/.test(raw)) {
        result[key] = Number(raw);
      } else if (raw === 'true' || raw === 'false') {
        result[key] = raw === 'true';
      } else {
        result[key] = raw;
      }
      continue;
    }
    if (m[7]) {
      // bare key -> boolean true
      result[m[7]] = true;
    }
  }

  if (classes.length) {
    // merge classes
    result['class'] = classes.join(' ');
  }
  if (id) result['id'] = id;

  return result;
}

export default function remarkAttrs() {
  return (tree: any) => {
    visit(tree, 'heading', (node: any) => {
      const children = node.children;
      if (!children || children.length === 0) return;
      const last = children[children.length - 1];
      if (last && last.type === 'text' && typeof last.value === 'string') {
        // match {...} at the end of the text node (supports multiline inside braces)
        const attrMatch = last.value.match(/\s*\{([\s\S]+)\}\s*$/);
        if (!attrMatch) return;

        const attrText = attrMatch[1].trim();
        if (!attrText) return;

        // parse attributes
        const attrs = parseAttributes(attrText);

        // remove the attribute token from the text node
        last.value = last.value.replace(/\s*\{[\s\S]+\}\s*$/, '');
        if (last.value === '') children.pop();

        node.data = node.data || {};
        node.data.hProperties = node.data.hProperties || {};

        // Merge attributes into hProperties
        for (const [key, val] of Object.entries(attrs)) {
          if (key === 'id') {
            node.data.hProperties.id = val;
            node.data.id = val;
            continue;
          }

          if (key === 'class' || key === 'className') {
            // merge classes
            const existing = node.data.hProperties.class || node.data.hProperties.className;
            if (existing) {
              node.data.hProperties.class = (String(existing) + ' ' + String(val)).trim();
            } else {
              node.data.hProperties.class = String(val);
            }
            continue;
          }

          // set other attributes directly
          node.data.hProperties[key] = val;
        }
      }
    });
  };
}
