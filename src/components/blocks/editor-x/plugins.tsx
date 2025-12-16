import {
  CHECK_LIST,
  ELEMENT_TRANSFORMERS,
  MULTILINE_ELEMENT_TRANSFORMERS,
  TEXT_FORMAT_TRANSFORMERS,
  TEXT_MATCH_TRANSFORMERS,
} from "@lexical/markdown"
import { AutoFocusPlugin } from "@lexical/react/LexicalAutoFocusPlugin"
import { CheckListPlugin } from "@lexical/react/LexicalCheckListPlugin"
import { ClearEditorPlugin } from "@lexical/react/LexicalClearEditorPlugin"
import { ClickableLinkPlugin } from "@lexical/react/LexicalClickableLinkPlugin"
import { LexicalErrorBoundary } from "@lexical/react/LexicalErrorBoundary"
import { HashtagPlugin } from "@lexical/react/LexicalHashtagPlugin"
import { HistoryPlugin } from "@lexical/react/LexicalHistoryPlugin"
import { HorizontalRulePlugin } from "@lexical/react/LexicalHorizontalRulePlugin"
import { ListPlugin } from "@lexical/react/LexicalListPlugin"
import { MarkdownShortcutPlugin } from "@lexical/react/LexicalMarkdownShortcutPlugin"
import { RichTextPlugin } from "@lexical/react/LexicalRichTextPlugin"
import { TabIndentationPlugin } from "@lexical/react/LexicalTabIndentationPlugin"
import { TablePlugin } from "@lexical/react/LexicalTablePlugin"
import { useState } from "react"

import { ContentEditable } from "@/components/editor/editor-ui/content-editable"
import { ActionsPlugin } from "@/components/editor/plugins/actions/actions-plugin"
import { CharacterLimitPlugin } from "@/components/editor/plugins/actions/character-limit-plugin"
import { ClearEditorActionPlugin } from "@/components/editor/plugins/actions/clear-editor-plugin"
import { CounterCharacterPlugin } from "@/components/editor/plugins/actions/counter-character-plugin"
import { EditModeTogglePlugin } from "@/components/editor/plugins/actions/edit-mode-toggle-plugin"
import { ImportExportPlugin } from "@/components/editor/plugins/actions/import-export-plugin"
import { MarkdownTogglePlugin } from "@/components/editor/plugins/actions/markdown-toggle-plugin"
import { MaxLengthPlugin } from "@/components/editor/plugins/actions/max-length-plugin"
import { ShareContentPlugin } from "@/components/editor/plugins/actions/share-content-plugin"
import { SpeechToTextPlugin } from "@/components/editor/plugins/actions/speech-to-text-plugin"
import { TreeViewPlugin } from "@/components/editor/plugins/actions/tree-view-plugin"
import { AutoLinkPlugin } from "@/components/editor/plugins/auto-link-plugin"
import { AutocompletePlugin } from "@/components/editor/plugins/autocomplete-plugin"
import { CodeActionMenuPlugin } from "@/components/editor/plugins/code-action-menu-plugin"
import { CodeHighlightPlugin } from "@/components/editor/plugins/code-highlight-plugin"
import { ComponentPickerMenuPlugin } from "@/components/editor/plugins/component-picker-menu-plugin"
import { ContextMenuPlugin } from "@/components/editor/plugins/context-menu-plugin"
import { DragDropPastePlugin } from "@/components/editor/plugins/drag-drop-paste-plugin"
import { DraggableBlockPlugin } from "@/components/editor/plugins/draggable-block-plugin"
import { AutoEmbedPlugin } from "@/components/editor/plugins/embeds/auto-embed-plugin"
import { TwitterPlugin } from "@/components/editor/plugins/embeds/twitter-plugin"
import { YouTubePlugin } from "@/components/editor/plugins/embeds/youtube-plugin"
import { EmojiPickerPlugin } from "@/components/editor/plugins/emoji-picker-plugin"
import { EmojisPlugin } from "@/components/editor/plugins/emojis-plugin"
import { FloatingLinkEditorPlugin } from "@/components/editor/plugins/floating-link-editor-plugin"
import { FloatingTextFormatToolbarPlugin } from "@/components/editor/plugins/floating-text-format-plugin"
import { ImagesPlugin } from "@/components/editor/plugins/images-plugin"
import { KeywordsPlugin } from "@/components/editor/plugins/keywords-plugin"
import { LayoutPlugin } from "@/components/editor/plugins/layout-plugin"
import { LinkPlugin } from "@/components/editor/plugins/link-plugin"
import { ListMaxIndentLevelPlugin } from "@/components/editor/plugins/list-max-indent-level-plugin"
import { MentionsPlugin } from "@/components/editor/plugins/mentions-plugin"
import { AlignmentPickerPlugin } from "@/components/editor/plugins/picker/alignment-picker-plugin"
import { BulletedListPickerPlugin } from "@/components/editor/plugins/picker/bulleted-list-picker-plugin"
import { CheckListPickerPlugin } from "@/components/editor/plugins/picker/check-list-picker-plugin"
import { CodePickerPlugin } from "@/components/editor/plugins/picker/code-picker-plugin"
import { ColumnsLayoutPickerPlugin } from "@/components/editor/plugins/picker/columns-layout-picker-plugin"
import { DividerPickerPlugin } from "@/components/editor/plugins/picker/divider-picker-plugin"
import { EmbedsPickerPlugin } from "@/components/editor/plugins/picker/embeds-picker-plugin"
import { HeadingPickerPlugin } from "@/components/editor/plugins/picker/heading-picker-plugin"
import { ImagePickerPlugin } from "@/components/editor/plugins/picker/image-picker-plugin"
import { NumberedListPickerPlugin } from "@/components/editor/plugins/picker/numbered-list-picker-plugin"
import { ParagraphPickerPlugin } from "@/components/editor/plugins/picker/paragraph-picker-plugin"
import { QuotePickerPlugin } from "@/components/editor/plugins/picker/quote-picker-plugin"
import {
  DynamicTablePickerPlugin,
  TablePickerPlugin,
} from "@/components/editor/plugins/picker/table-picker-plugin"
import { TabFocusPlugin } from "@/components/editor/plugins/tab-focus-plugin"
import { BlockFormatDropDown } from "@/components/editor/plugins/toolbar/block-format-toolbar-plugin"
import { FormatBulletedList } from "@/components/editor/plugins/toolbar/block-format/format-bulleted-list"
import { FormatCheckList } from "@/components/editor/plugins/toolbar/block-format/format-check-list"
import { FormatCodeBlock } from "@/components/editor/plugins/toolbar/block-format/format-code-block"
import { FormatHeading } from "@/components/editor/plugins/toolbar/block-format/format-heading"
import { FormatNumberedList } from "@/components/editor/plugins/toolbar/block-format/format-numbered-list"
import { FormatParagraph } from "@/components/editor/plugins/toolbar/block-format/format-paragraph"
import { FormatQuote } from "@/components/editor/plugins/toolbar/block-format/format-quote"
import { ClearFormattingToolbarPlugin } from "@/components/editor/plugins/toolbar/clear-formatting-toolbar-plugin"
import { CodeLanguageToolbarPlugin } from "@/components/editor/plugins/toolbar/code-language-toolbar-plugin"
import { ElementFormatToolbarPlugin } from "@/components/editor/plugins/toolbar/element-format-toolbar-plugin"
import { FontBackgroundToolbarPlugin } from "@/components/editor/plugins/toolbar/font-background-toolbar-plugin"
import { FontColorToolbarPlugin } from "@/components/editor/plugins/toolbar/font-color-toolbar-plugin"
import { FontFamilyToolbarPlugin } from "@/components/editor/plugins/toolbar/font-family-toolbar-plugin"
import { FontFormatToolbarPlugin } from "@/components/editor/plugins/toolbar/font-format-toolbar-plugin"
import { FontSizeToolbarPlugin } from "@/components/editor/plugins/toolbar/font-size-toolbar-plugin"
import { HistoryToolbarPlugin } from "@/components/editor/plugins/toolbar/history-toolbar-plugin"
import { LinkToolbarPlugin } from "@/components/editor/plugins/toolbar/link-toolbar-plugin"
import { SubSuperToolbarPlugin } from "@/components/editor/plugins/toolbar/subsuper-toolbar-plugin"
import { ToolbarPlugin } from "@/components/editor/plugins/toolbar/toolbar-plugin"
import { TypingPerfPlugin } from "@/components/editor/plugins/typing-pref-plugin"
import { EMOJI } from "@/components/editor/transformers/markdown-emoji-transformer"
import { HR } from "@/components/editor/transformers/markdown-hr-transformer"
import { IMAGE } from "@/components/editor/transformers/markdown-image-transformer"
import { TABLE } from "@/components/editor/transformers/markdown-table-transformer"
import { TWEET } from "@/components/editor/transformers/markdown-tweet-transformer"
import { ButtonGroup } from "@/components/ui/button-group"
import { Separator } from "@/components/ui/separator"

const placeholder = "Start writing, or press '/' for commands..."
const maxLength = 50000

// Separate Toolbar Component
export function EditorToolbar() {
  const [isLinkEditMode, setIsLinkEditMode] = useState<boolean>(false)

  return (
    <ToolbarPlugin>
      {({ blockType }) => (
        <div className="flex items-center gap-1 overflow-x-auto bg-background border-b px-3 py-2">
          <HistoryToolbarPlugin />
          <Separator orientation="vertical" className="mx-1 h-5" />
          <BlockFormatDropDown>
            <FormatParagraph />
            <FormatHeading levels={["h1", "h2", "h3"]} />
            <FormatNumberedList />
            <FormatBulletedList />
            <FormatCheckList />
            <FormatCodeBlock />
            <FormatQuote />
          </BlockFormatDropDown>
          {blockType === "code" ? (
            <CodeLanguageToolbarPlugin />
          ) : (
            <>
              <FontSizeToolbarPlugin />
              <Separator orientation="vertical" className="mx-1 h-5" />
              <FontFormatToolbarPlugin />
              <Separator orientation="vertical" className="mx-1 h-5" />
              <LinkToolbarPlugin setIsLinkEditMode={setIsLinkEditMode} />
              <ButtonGroup>
                <FontColorToolbarPlugin />
                <FontBackgroundToolbarPlugin />
              </ButtonGroup>
              <Separator orientation="vertical" className="mx-1 h-5" />
              <ElementFormatToolbarPlugin />
            </>
          )}
        </div>
      )}
    </ToolbarPlugin>
  )
}

// Separate Content Component
export function EditorContent({ className, siteId }: { className?: string; siteId?: string }) {
  const [floatingAnchorElem, setFloatingAnchorElem] = useState<HTMLDivElement | null>(null)
  const [isLinkEditMode, setIsLinkEditMode] = useState<boolean>(false)

  const onRef = (_floatingAnchorElem: HTMLDivElement) => {
    if (_floatingAnchorElem !== null) {
      setFloatingAnchorElem(_floatingAnchorElem)
    }
  }

  return (
    <div className={`relative flex-1 min-h-0 overflow-visible ${className || ''}`}>
      <AutoFocusPlugin />
      <RichTextPlugin
        contentEditable={
          <div className="relative h-full">
            <div ref={onRef} className="h-full">
              <ContentEditable
                placeholder={placeholder}
                className="ContentEditable__root relative block h-full min-h-[400px] py-2 text-base leading-relaxed focus:outline-none [&_h1]:text-3xl [&_h1]:font-bold [&_h1]:mb-4 [&_h2]:text-2xl [&_h2]:font-semibold [&_h2]:mb-3 [&_h3]:text-xl [&_h3]:font-medium [&_h3]:mb-2 [&_p]:mb-3 [&_ul]:pl-6 [&_ol]:pl-6 [&_li]:mb-1"
              />
            </div>
          </div>
        }
        ErrorBoundary={LexicalErrorBoundary}
      />

      <ClickableLinkPlugin />
      <CheckListPlugin />
      <HorizontalRulePlugin />
      <TablePlugin />
      <ListPlugin />
      <TabIndentationPlugin />
      <HashtagPlugin />
      <HistoryPlugin />

      <MentionsPlugin />
      <DraggableBlockPlugin anchorElem={floatingAnchorElem} />
      <KeywordsPlugin />
      <EmojisPlugin />
      <ImagesPlugin captionsEnabled={false} />

      <LayoutPlugin />

      <AutoEmbedPlugin />
      <TwitterPlugin />
      <YouTubePlugin />

      <CodeHighlightPlugin />
      <CodeActionMenuPlugin anchorElem={floatingAnchorElem} />

      <MarkdownShortcutPlugin
        transformers={[
          TABLE,
          HR,
          IMAGE,
          EMOJI,
          TWEET,
          CHECK_LIST,
          ...ELEMENT_TRANSFORMERS,
          ...MULTILINE_ELEMENT_TRANSFORMERS,
          ...TEXT_FORMAT_TRANSFORMERS,
          ...TEXT_MATCH_TRANSFORMERS,
        ]}
      />
      <TypingPerfPlugin />
      <TabFocusPlugin />
      <AutocompletePlugin />
      <AutoLinkPlugin />
      <LinkPlugin />

      <ComponentPickerMenuPlugin
        baseOptions={[
          ParagraphPickerPlugin(),
          HeadingPickerPlugin({ n: 1 }),
          HeadingPickerPlugin({ n: 2 }),
          HeadingPickerPlugin({ n: 3 }),
          TablePickerPlugin(),
          CheckListPickerPlugin(),
          NumberedListPickerPlugin(),
          BulletedListPickerPlugin(),
          QuotePickerPlugin(),
          CodePickerPlugin(),
          DividerPickerPlugin(),
          EmbedsPickerPlugin({ embed: "tweet" }),
          EmbedsPickerPlugin({ embed: "youtube-video" }),
          ImagePickerPlugin(),
          ColumnsLayoutPickerPlugin(),
          AlignmentPickerPlugin({ alignment: "left" }),
          AlignmentPickerPlugin({ alignment: "center" }),
          AlignmentPickerPlugin({ alignment: "right" }),
          AlignmentPickerPlugin({ alignment: "justify" }),
        ]}
        dynamicOptionsFn={DynamicTablePickerPlugin}
      />

      <ContextMenuPlugin siteId={siteId} />
      <DragDropPastePlugin />
      <EmojiPickerPlugin />

      <FloatingLinkEditorPlugin
        anchorElem={floatingAnchorElem}
        isLinkEditMode={isLinkEditMode}
        setIsLinkEditMode={setIsLinkEditMode}
      />
      <FloatingTextFormatToolbarPlugin
        anchorElem={floatingAnchorElem}
        setIsLinkEditMode={setIsLinkEditMode}
      />

      <ListMaxIndentLevelPlugin />
    </div>
  )
}

// Separate Footer Component
export function EditorFooter() {
  return (
    <ActionsPlugin>
      <div className="flex items-center justify-between gap-2 border-t bg-muted/30 px-3 py-1.5 text-xs text-muted-foreground">
        <div className="flex items-center gap-2">
          <MaxLengthPlugin maxLength={maxLength} />
          <CharacterLimitPlugin maxLength={maxLength} charset="UTF-16" />
        </div>

        <CounterCharacterPlugin charset="UTF-16" />

        <div className="flex items-center gap-1">
          <ImportExportPlugin />
          <MarkdownTogglePlugin
            shouldPreserveNewLinesInMarkdown={true}
            transformers={[
              TABLE,
              HR,
              IMAGE,
              EMOJI,
              TWEET,
              CHECK_LIST,
              ...ELEMENT_TRANSFORMERS,
              ...MULTILINE_ELEMENT_TRANSFORMERS,
              ...TEXT_FORMAT_TRANSFORMERS,
              ...TEXT_MATCH_TRANSFORMERS,
            ]}
          />
          <>
            <ClearEditorActionPlugin />
            <ClearEditorPlugin />
          </>
        </div>
      </div>
    </ActionsPlugin>
  )
}

// Legacy combined Plugins (for backwards compatibility)
export function Plugins({ }) {
  const [floatingAnchorElem, setFloatingAnchorElem] = useState<HTMLDivElement | null>(null)
  const [isLinkEditMode, setIsLinkEditMode] = useState<boolean>(false)

  const onRef = (_floatingAnchorElem: HTMLDivElement) => {
    if (_floatingAnchorElem !== null) {
      setFloatingAnchorElem(_floatingAnchorElem)
    }
  }

  return (
    <div className="relative flex flex-col h-full">
      <EditorToolbar />
      <EditorContent />
      <EditorFooter />
    </div>
  )
}
