import type { CarouselImage } from "@/components/editor/nodes/carousel-node"

export type CarouselDomOptions = {
  images: CarouselImage[]
  carouselId?: string
  imagesPerSlide?: number
  loop?: boolean
  navigation?: boolean
  pagination?: boolean
}

function newCarouselId(): string {
  return `carousel-${Math.random().toString(36).slice(2, 11)}`
}

function escapeAttr(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/"/g, "&quot;")
    .replace(/</g, "&lt;")
}

export function buildCarouselHtmlString(options: CarouselDomOptions): string {
  const {
    images,
    carouselId = newCarouselId(),
    imagesPerSlide = 1,
    loop = false,
    navigation = true,
    pagination = true,
  } = options

  const slides = images
    .map((image) => {
      const src = escapeAttr(image.src)
      const alt = escapeAttr(image.alt ?? "")
      const id = escapeAttr(image.id)
      return `<div class="swiper-slide"><img src="${src}" alt="${alt}" data-slide-id="${id}" /></div>`
    })
    .join("")

  const nav =
    navigation && images.length > 0
      ? `<div class="swiper-button-prev"></div><div class="swiper-button-next"></div>`
      : ""
  const pag =
    pagination && images.length > 0 ? `<div class="swiper-pagination"></div>` : ""

  return `<div class="swiper swiper-container" data-carousel-id="${escapeAttr(carouselId)}" data-slides-per-view="${imagesPerSlide}" data-navigation="${navigation}" data-pagination="${pagination}" data-loop="${loop}"><div class="swiper-wrapper">${slides}</div>${nav}${pag}</div>`
}

export function buildCarouselElement(options: CarouselDomOptions): HTMLDivElement {
  const template = document.createElement("template")
  template.innerHTML = buildCarouselHtmlString(options).trim()
  return template.content.firstElementChild as HTMLDivElement
}

export function parseCarouselElement(element: HTMLElement): CarouselDomOptions {
  const images: CarouselImage[] = []
  element.querySelectorAll(".swiper-slide img").forEach((img, index) => {
    const el = img as HTMLImageElement
    images.push({
      id: el.getAttribute("data-slide-id") || `slide-${index}`,
      src: el.getAttribute("src") || "",
      alt: el.getAttribute("alt") || "",
    })
  })

  return {
    images,
    carouselId: element.getAttribute("data-carousel-id") || undefined,
    imagesPerSlide: Number.parseInt(element.getAttribute("data-slides-per-view") || "1", 10),
    loop: element.getAttribute("data-loop") === "true",
    navigation: element.getAttribute("data-navigation") !== "false",
    pagination: element.getAttribute("data-pagination") !== "false",
  }
}

export function isCarouselContainerElement(node: Node): node is HTMLElement {
  if (!(node instanceof HTMLElement)) return false
  return (
    node.classList.contains("swiper-container") ||
    (node.classList.contains("swiper") && node.hasAttribute("data-carousel-id"))
  )
}
