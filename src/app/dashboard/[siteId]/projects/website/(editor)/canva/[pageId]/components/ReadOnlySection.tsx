
import { Editor, Frame } from "@craftjs/core"
import { resolverWithFallback } from "../user-components"

export function ReadOnlySection({ content, interactive = false }: { content: any, interactive?: boolean }) {
    if (!content) return null

    return (
        <div className={`relative z-0 ${interactive ? "" : "pointer-events-none select-none"}`}>
            <Editor enabled={false} resolver={resolverWithFallback}>
                <Frame json={JSON.stringify(content)} />
            </Editor>
            {!interactive && <div className="absolute inset-0 z-10 bg-transparent" />}
        </div>
    )
}
