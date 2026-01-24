
import { SerializedEditorState, SerializedLexicalNode } from "lexical";
import { marked } from "marked";

// Types for processInlineTokens
interface InlineToken {
    type: string;
    text: string;
    tokens?: InlineToken[];
    href?: string;
}

// ----------------------------------------------------------------------
// Helper to process inline tokens (bold, italic, link, text)
// ----------------------------------------------------------------------
function processInlineTokens(tokens: InlineToken[] = []): any[] {
    const children: any[] = [];

    tokens.forEach((token) => {
        if (token.type === "text" || token.type === "escape") {
            // Basic text node. 
            // marked sometimes nests tokens inside 'text' if it's complex, but usually 'tokens' is undefined for leaf text
            if (token.tokens && token.tokens.length > 0) {
                children.push(...processInlineTokens(token.tokens));
            } else {
                // Decode HTML entities if necessary (marked escapes by default)
                // simple unescape for common ones
                const decodedText = token.text
                    .replace(/&amp;/g, "&")
                    .replace(/&lt;/g, "<")
                    .replace(/&gt;/g, ">")
                    .replace(/&quot;/g, '"')
                    .replace(/&#39;/g, "'");

                children.push({
                    detail: 0,
                    format: 0,
                    mode: "normal",
                    style: "",
                    text: decodedText,
                    type: "text",
                    version: 1,
                });
            }
        }
        else if (token.type === "strong") {
            // Bold (Format = 1)
            // Recurse for parsed inner content
            const innerChildren = processInlineTokens(token.tokens);
            innerChildren.forEach((child) => {
                if (child.type === "text") {
                    // Apply bold format (bitmask 1)
                    child.format |= 1;
                }
            });
            children.push(...innerChildren);
        }
        else if (token.type === "em") {
            // Italic (Format = 2)
            const innerChildren = processInlineTokens(token.tokens);
            innerChildren.forEach((child) => {
                if (child.type === "text") {
                    // Apply italic format (bitmask 2)
                    child.format |= 2;
                }
            });
            children.push(...innerChildren);
        }
        else if (token.type === "link") {
            // Link Node
            // children of link are the text inside []
            const linkChildren = processInlineTokens(token.tokens);

            children.push({
                children: linkChildren,
                direction: "ltr",
                format: "",
                indent: 0,
                type: "link",
                version: 1,
                rel: "noreferrer",
                target: null,
                title: null,
                url: token.href || "",
            });
        }
        // Handle other types as plain text fallback
        else {
            // e.g. code, codespan, del, etc.
            children.push({
                detail: 0,
                format: 0,
                mode: "normal",
                style: "",
                text: token.text,
                type: "text",
                version: 1,
            });
        }
    });

    return children;
}


// ----------------------------------------------------------------------
// Helpers to create Block Nodes using processInlineTokens
// ----------------------------------------------------------------------

function createParagraphNode(tokens: any[]): any {
    return {
        children: processInlineTokens(tokens),
        direction: "ltr",
        format: "",
        indent: 0,
        type: "paragraph",
        version: 1,
    };
}

function createHeadingNode(tokens: any[], tag: string): any {
    return {
        children: processInlineTokens(tokens),
        direction: "ltr",
        format: "",
        indent: 0,
        type: "heading",
        version: 1,
        tag: tag,
    };
}

function createListNode(items: any[], tag: "ul" | "ol"): any {
    const listType = tag === "ul" ? "bullet" : "number";

    return {
        children: items.map((itemTokens: any[]) => ({
            children: processInlineTokens(itemTokens),
            direction: "ltr",
            format: "",
            indent: 0,
            type: "listitem",
            version: 1,
            value: 1
        })),
        direction: "ltr",
        format: "",
        indent: 0,
        type: "list",
        version: 1,
        listType: listType,
        start: 1,
        tag: tag
    };
}


export function markdownToLexical(markdown: string): SerializedEditorState {
    const tokens = marked.lexer(markdown);
    const children: SerializedLexicalNode[] = [];

    tokens.forEach((token) => {
        if (token.type === "heading") {
            // @ts-ignore
            children.push(createHeadingNode(token.tokens, `h${token.depth}`));
        } else if (token.type === "paragraph") {
            // @ts-ignore
            children.push(createParagraphNode(token.tokens));
        } else if (token.type === "list") {
            // token.items is Array of ListItem
            // ListItem has .tokens checking for direct text or nested paragraph
            const listItemsTokens = token.items.map((item: any) => {
                // Sometimes item.tokens has a paragraph as first child if loose
                // We flatten straightforwardly
                return item.tokens;
            });
            const tag = token.ordered ? "ol" : "ul";
            children.push(createListNode(listItemsTokens, tag));
        } else if (token.type === "space") {
            // ignore
        } else {
            // Fallback
            // @ts-ignore
            if (token.text) {
                // construct a dummy token list for the fallback text
                // @ts-ignore
                children.push(createParagraphNode([{ type: 'text', text: token.text }]));
            }
        }
    });

    return {
        root: {
            children: children,
            direction: "ltr",
            format: "",
            indent: 0,
            type: "root",
            version: 1,
        },
    };
}
