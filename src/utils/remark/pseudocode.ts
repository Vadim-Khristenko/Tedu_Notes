import { visit } from 'unist-util-visit';
import type { Plugin } from 'unified';

/**
 * remark plugin: normalize pseudocode fences to a supported language for highlighting
 * It maps fence languages like `just-ncv`, `pseudocode`, `ncvl` to `python` (or `text`)
 */
const pseudocode: Plugin = () => {
    return (tree: any) => {
        visit(tree, 'code', (node: any) => {
            if (!node.lang) return;
            const lang = String(node.lang).toLowerCase();
            const map: Record<string, string> = {
                'just-ncv': 'just-ncv',
                'pseudocode': 'just-ncv',
                'ncv': 'just-ncv',
                'ncvl': 'just-ncv',
                'ps': 'just-ncv'
            };
            if (map[lang]) {
                node.lang = map[lang];
            }
        });
    };
};

export default pseudocode;
