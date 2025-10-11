import { visit } from "unist-util-visit";

// Enhanced plural plugin for Russian
// Syntax variants supported:
// {plural:5|"яблоко"|"яблока"|"яблок"}
// {plural:n|яблоко|яблока|яблок}  -> uses nearest preceding number 'n' from text
// Forms can be quoted with single/double quotes or unquoted (no pipe inside).
export default function remarkPluralRu() {
  return (tree: any) => {
    visit(tree, "text", (node: any, index: number | null | undefined, parent: any) => {
      if (!node || typeof node.value !== "string") return;

      const orig = node.value;

      const re = /\{\s*plural\s*:\s*([0-9]+|n)\s*\|\s*(?:"([^"]+)"|'([^']+)'|([^|}]+))\s*\|\s*(?:"([^"]+)"|'([^']+)'|([^|}]+))\s*\|\s*(?:"([^"]+)"|'([^']+)'|([^|}]+))\s*\}/g;

      let result = "";
      let lastIndex = 0;
      let m: RegExpExecArray | null;

      while ((m = re.exec(orig)) !== null) {
        const match = m[0];
        const countToken = m[1];
        const one = m[2] ?? m[3] ?? (m[4] ?? "");
        const few = m[5] ?? m[6] ?? (m[7] ?? "");
        const many = m[8] ?? m[9] ?? (m[10] ?? "");

        let n: number | null = null;

        if (/^\d+$/.test(countToken)) {
          n = Math.abs(parseInt(countToken, 10));
        } else if (countToken === "n") {
          // find last number in the text before this match
          const before = orig.slice(0, m.index);
          const nums = before.match(/\d+/g);
          if (nums && nums.length) {
            n = Math.abs(parseInt(nums[nums.length - 1], 10));
          } else {
            // look into previous sibling text nodes
            if (parent && Array.isArray(parent.children) && typeof index === "number") {
              for (let i = index - 1; i >= 0 && n === null; i--) {
                const sib = parent.children[i];
                if (sib && typeof sib.value === "string") {
                  const nums2 = (sib.value as string).match(/\d+/g);
                  if (nums2 && nums2.length) {
                    n = Math.abs(parseInt(nums2[nums2.length - 1], 10));
                    break;
                  }
                }
              }
            }
          }
        }

        let replacement = match;
        if (n !== null && !isNaN(n)) {
          const mod10 = n % 10;
          const mod100 = n % 100;
          if (mod10 === 1 && mod100 !== 11) replacement = one;
          else if (mod10 >= 2 && mod10 <= 4 && !(mod100 >= 12 && mod100 <= 14)) replacement = few;
          else replacement = many;
        }

        result += orig.slice(lastIndex, m.index) + replacement;
        lastIndex = m.index + match.length;
      }

      if (lastIndex === 0) return; // nothing changed
      result += orig.slice(lastIndex);
      node.value = result;
    });
  };
}
