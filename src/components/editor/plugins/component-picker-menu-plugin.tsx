"use client"

/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */
import {
  JSX,
  RefObject,
  useCallback,
  useLayoutEffect,
  useMemo,
  useState,
} from "react"
import dynamic from "next/dynamic"
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext"
import { useBasicTypeaheadTriggerMatch } from "@lexical/react/LexicalTypeaheadMenuPlugin"
import { TextNode } from "lexical"
import { createPortal } from "react-dom"

import { useEditorModal } from "@/components/editor/editor-hooks/use-modal"
import {
  Command,
  CommandGroup,
  CommandItem,
  CommandList,
} from "@/components/ui/command"

import { ComponentPickerOption } from "./picker/component-picker-option"

const LexicalTypeaheadMenuPlugin = dynamic(
  () =>
    import("@lexical/react/LexicalTypeaheadMenuPlugin").then(
      (mod) => mod.LexicalTypeaheadMenuPlugin<ComponentPickerOption>
    ),
  { ssr: false }
)

type MenuPosition = { top: number; left: number }

function ComponentPickerMenuContent({
  anchorElementRef,
  options,
  selectedIndex,
  selectOptionAndCleanUp,
  setHighlightedIndex,
}: {
  anchorElementRef: RefObject<HTMLElement | null>
  options: Array<ComponentPickerOption>
  selectedIndex: number | null
  selectOptionAndCleanUp: (option: ComponentPickerOption) => void
  setHighlightedIndex: (index: number) => void
}) {
  const [position, setPosition] = useState<MenuPosition>({ top: 0, left: 0 })

  useLayoutEffect(() => {
    const updatePosition = () => {
      const anchor = anchorElementRef.current
      if (!anchor) return
      const rect = anchor.getBoundingClientRect()
      setPosition({ top: rect.top, left: rect.left })
    }

    updatePosition()
    window.addEventListener("scroll", updatePosition, true)
    window.addEventListener("resize", updatePosition)
    return () => {
      window.removeEventListener("scroll", updatePosition, true)
      window.removeEventListener("resize", updatePosition)
    }
  }, [anchorElementRef, options.length])

  if (typeof document === "undefined" || !document.body) {
    return null
  }

  return createPortal(
    <div
      className="fixed z-[9999] w-[220px] rounded-lg border border-border bg-popover text-popover-foreground shadow-xl overflow-hidden"
      style={{ top: position.top, left: position.left }}
    >
      <Command
        onKeyDown={(e) => {
          if (e.key === "ArrowUp") {
            e.preventDefault()
            setHighlightedIndex(
              selectedIndex !== null
                ? (selectedIndex - 1 + options.length) % options.length
                : options.length - 1
            )
          } else if (e.key === "ArrowDown") {
            e.preventDefault()
            setHighlightedIndex(
              selectedIndex !== null
                ? (selectedIndex + 1) % options.length
                : 0
            )
          }
        }}
      >
        <CommandList className="max-h-[300px] overflow-y-auto p-1">
          <CommandGroup>
            {options.map((option, index) => (
              <CommandItem
                key={option.key}
                value={option.title}
                onSelect={() => {
                  selectOptionAndCleanUp(option)
                }}
                className={`flex items-center gap-2.5 rounded-md px-2.5 py-2 text-sm transition-colors cursor-pointer ${
                  selectedIndex === index
                    ? "bg-accent text-accent-foreground"
                    : "bg-transparent hover:bg-accent/50"
                }`}
              >
                <span className="text-muted-foreground">{option.icon}</span>
                {option.title}
              </CommandItem>
            ))}
          </CommandGroup>
        </CommandList>
      </Command>
    </div>,
    document.body
  )
}

export function ComponentPickerMenuPlugin({
  baseOptions = [],
  dynamicOptionsFn,
}: {
  baseOptions?: Array<ComponentPickerOption>
  dynamicOptionsFn?: ({
    queryString,
  }: {
    queryString: string
  }) => Array<ComponentPickerOption>
}): JSX.Element {
  const [editor] = useLexicalComposerContext()
  const [modal, showModal] = useEditorModal()
  const [queryString, setQueryString] = useState<string | null>(null)

  const checkForTriggerMatch = useBasicTypeaheadTriggerMatch("/", {
    minLength: 0,
  })

  const options = useMemo(() => {
    if (!queryString) {
      return baseOptions
    }

    const regex = new RegExp(queryString, "i")

    return [
      ...(dynamicOptionsFn?.({ queryString }) || []),
      ...baseOptions.filter(
        (option) =>
          regex.test(option.title) ||
          option.keywords.some((keyword) => regex.test(keyword))
      ),
    ]
  }, [baseOptions, dynamicOptionsFn, queryString])

  const onSelectOption = useCallback(
    (
      selectedOption: ComponentPickerOption,
      nodeToRemove: TextNode | null,
      closeMenu: () => void,
      matchingString: string
    ) => {
      editor.update(() => {
        nodeToRemove?.remove()
        selectedOption.onSelect(matchingString, editor, showModal)
        closeMenu()
      })
    },
    [editor, showModal]
  )

  return (
    <>
      {modal}
      <LexicalTypeaheadMenuPlugin
        onQueryChange={setQueryString}
        onSelectOption={onSelectOption}
        triggerFn={checkForTriggerMatch}
        options={options}
        menuRenderFn={(
          anchorElementRef,
          { selectedIndex, selectOptionAndCleanUp, setHighlightedIndex }
        ) => {
          return anchorElementRef.current && options.length ? (
            <ComponentPickerMenuContent
              anchorElementRef={anchorElementRef}
              options={options}
              selectedIndex={selectedIndex}
              selectOptionAndCleanUp={selectOptionAndCleanUp}
              setHighlightedIndex={setHighlightedIndex}
            />
          ) : null
        }}
      />
    </>
  )
}
