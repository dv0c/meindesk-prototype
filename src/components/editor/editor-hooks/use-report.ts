import { useCallback, useEffect, useRef } from "react"

const getElement = (): HTMLElement => {
  let element = document.getElementById("report-container")

  if (element === null) {
    element = document.createElement("div")
    element.id = "report-container"
    element.style.position = "fixed"
    element.style.bottom = "24px"
    element.style.right = "24px"
    element.style.fontSize = "14px"
    element.style.fontWeight = "500"
    element.style.padding = "12px 16px"
    element.style.background = "hsl(var(--popover) / 0.95)"
    element.style.backdropFilter = "blur(8px)"
    element.style.borderRadius = "8px"
    element.style.border = "1px solid hsl(var(--border) / 0.5)"
    element.style.boxShadow = "0 10px 25px -5px rgba(0, 0, 0, 0.25)"
    element.style.color = "hsl(var(--popover-foreground))"
    element.style.zIndex = "9999"

    if (document.body) {
      document.body.appendChild(element)
    }
  }

  return element
}

export function useReport(): (arg0: string) => ReturnType<typeof setTimeout> {
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const cleanup = useCallback(() => {
    if (timer.current !== null) {
      clearTimeout(timer.current)
      timer.current = null
    }

    if (document.body) {
      document.body.removeChild(getElement())
    }
  }, [])

  useEffect(() => {
    return cleanup
  }, [cleanup])

  return useCallback(
    (content) => {
      console.log(content)
      const element = getElement()
      if (timer.current !== null) {
        clearTimeout(timer.current)
      }
      element.innerHTML = content
      timer.current = setTimeout(cleanup, 1000)
      return timer.current
    },
    [cleanup]
  )
}
