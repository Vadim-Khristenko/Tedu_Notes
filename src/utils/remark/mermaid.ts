import { visit } from "unist-util-visit";
import type { Plugin } from "unified";
import type { Root, Code, Parent } from "mdast";

function escapeAttr(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/"/g, "&quot;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/\n/g, "&#10;");
}

const remarkMermaid: Plugin<[], Root> = () => {
  return (tree) => {
    visit(tree, "code", (node: Code, index?: number, parent?: Parent) => {
      if (!parent || typeof index !== "number") return;
      if (!node.lang || node.lang.toLowerCase() !== "mermaid") return;

      const raw = escapeAttr(node.value);
      parent.children[index] = {
        type: "html",
        value: `<div class="mermaid-block" data-mermaid="${raw}"></div>`
      } as any;
    });
  };
};

export default remarkMermaid;
