import {
    DecoratorNode,
    DOMConversionMap,
    DOMConversionOutput,
    DOMExportOutput,
    EditorConfig,
    LexicalEditor,
    LexicalNode,
    NodeKey,
    SerializedLexicalNode,
    Spread,
} from "lexical";
import { ReactElement, Suspense, lazy } from "react";

export type CarouselImage = {
    src: string;
    alt: string;
    id: string;
};

export type SerializedCarouselNode = Spread<
    {
        images: CarouselImage[];
        width?: string;
        imagesPerSlide?: number;
        loop?: boolean;
        height?: string;
        gap?: string;
    },
    SerializedLexicalNode
>;

const CarouselComponent = lazy(() => import("./carousel-component"));

export class CarouselNode extends DecoratorNode<ReactElement> {
    __images: CarouselImage[];
    __width: string;
    __imagesPerSlide: number;
    __loop: boolean;
    __height: string;
    __gap: string;

    static getType(): string {
        return "carousel";
    }

    static clone(node: CarouselNode): CarouselNode {
        return new CarouselNode(
            node.__images,
            node.__width,
            node.__imagesPerSlide,
            node.__loop,
            node.__height,
            node.__gap,
            node.__key
        );
    }

    static importJSON(serializedNode: SerializedCarouselNode): CarouselNode {
        return new CarouselNode(
            serializedNode.images,
            serializedNode.width,
            serializedNode.imagesPerSlide,
            serializedNode.loop,
            serializedNode.height,
            serializedNode.gap
        );
    }

    constructor(
        images: CarouselImage[] = [],
        width: string = "inherit",
        imagesPerSlide: number = 1,
        loop: boolean = false,
        height: string = "inherit",
        gap: string = "1rem",
        key?: NodeKey
    ) {
        super(key);
        this.__images = images;
        this.__width = width;
        this.__imagesPerSlide = imagesPerSlide;
        this.__loop = loop;
        this.__height = height;
        this.__gap = gap;
    }

    exportJSON(): SerializedCarouselNode {
        return {
            images: this.__images,
            width: this.__width,
            imagesPerSlide: this.__imagesPerSlide,
            loop: this.__loop,
            height: this.__height,
            gap: this.__gap,
            type: "carousel",
            version: 1,
        };
    }

    getImages(): CarouselImage[] {
        return this.__images;
    }

    setImages(images: CarouselImage[]): void {
        const writable = this.getWritable();
        writable.__images = images;
    }

    getWidth(): string {
        return this.__width;
    }

    setWidth(width: string): void {
        const writable = this.getWritable();
        writable.__width = width;
    }

    getImagesPerSlide(): number {
        return this.__imagesPerSlide;
    }

    setImagesPerSlide(imagesPerSlide: number): void {
        const writable = this.getWritable();
        writable.__imagesPerSlide = imagesPerSlide;
    }

    getLoop(): boolean {
        return this.__loop;
    }

    setLoop(loop: boolean): void {
        const writable = this.getWritable();
        writable.__loop = loop;
    }

    getHeight(): string {
        return this.__height;
    }

    setHeight(height: string): void {
        const writable = this.getWritable();
        writable.__height = height;
    }

    getGap(): string {
        return this.__gap;
    }

    setGap(gap: string): void {
        const writable = this.getWritable();
        writable.__gap = gap;
    }

    createDOM(config: EditorConfig): HTMLElement {
        const span = document.createElement("span");
        const theme = config.theme;
        const className = theme.image;
        if (className !== undefined) {
            span.className = className;
        }
        return span;
    }

    updateDOM(): false {
        return false;
    }

    decorate(): ReactElement {
        return (
            <Suspense fallback={null}>
                <CarouselComponent
                    images={this.__images}
                    nodeKey={this.getKey()}
                    width={this.__width}
                    imagesPerSlide={this.__imagesPerSlide}
                    loop={this.__loop}
                    height={this.__height}
                    gap={this.__gap}
                />
            </Suspense>
        );
    }
}

export function $createCarouselNode(
    images: CarouselImage[],
): CarouselNode {
    return new CarouselNode(images);
}

export function $isCarouselNode(
    node: LexicalNode | null | undefined
): node is CarouselNode {
    return node instanceof CarouselNode;
}
