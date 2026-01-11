
import { Editor, Frame } from "@craftjs/core"
import { resolverWithFallback } from "../user-components"

export function ReadOnlySection({ content }: { content: any }) {
    if (!content) return null

    return (
        <div className="pointer-events-none select-none relative z-0">
            <Editor enabled={false} resolver={resolverWithFallback}>
                <Frame json={JSON.stringify(content)} />
            </Editor>
            <div className="absolute inset-0 z-10 bg-transparent" />
        </div>
    )
}
