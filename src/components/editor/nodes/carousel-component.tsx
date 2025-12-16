import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { useLexicalNodeSelection } from "@lexical/react/useLexicalNodeSelection";
import { mergeRegister } from "@lexical/utils";
import {
    $getNodeByKey,
    CLICK_COMMAND,
    COMMAND_PRIORITY_LOW,
    KEY_DELETE_COMMAND,
    KEY_BACKSPACE_COMMAND,
    NodeKey,
} from "lexical";
import { useParams } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { CarouselImage, CarouselNode, $isCarouselNode } from "./carousel-node";
import {
    Carousel,
    CarouselContent,
    CarouselItem,
    CarouselNext,
    CarouselPrevious,
} from "@/components/ui/carousel";
import { Button } from "@/components/ui/button";
import { ImagePlus, Pencil, Trash, Settings } from "lucide-react";
import MediaLibraryDialog from "@/components/MediaGallery/media-select";
import { cn } from "@/lib/utils";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { ManageSlidesDialog } from "./manage-slides-dialog";

type CarouselComponentProps = {
    images: CarouselImage[];
    nodeKey: NodeKey;
    width: string;
    imagesPerSlide: number;
    loop: boolean;
    height: string;
    gap: string;
};

export default function CarouselComponent({
    images,
    nodeKey,
    width,
    imagesPerSlide,
    loop,
    height,
    gap,
}: CarouselComponentProps) {
    const [editor] = useLexicalComposerContext();
    const [isSelected, setSelected, clearSelection] = useLexicalNodeSelection(nodeKey);
    const [isMediaOpen, setMediaOpen] = useState(false);
    const [isHovered, setHovered] = useState(false);
    const params = useParams();
    const siteId = params?.siteId as string;
    const ref = useRef<HTMLDivElement>(null);
    const [settingsOpen, setSettingsOpen] = useState(false);
    const [manageOpen, setManageOpen] = useState(false);

    // Local state for responsiveness
    const [localLoop, setLocalLoop] = useState(loop ?? false);
    const [localImagesPerSlide, setLocalImagesPerSlide] = useState(imagesPerSlide || 1);
    const [localWidth, setLocalWidth] = useState(width || "100%");
    const [localHeight, setLocalHeight] = useState(height || "inherit");
    const [localGap, setLocalGap] = useState(gap || "1rem");

    // Sync local state with props (e.g. for undo/redo)
    useEffect(() => {
        setLocalLoop(loop ?? false);
        setLocalImagesPerSlide(imagesPerSlide || 1);
        setLocalWidth(width || "100%");
        setLocalHeight(height || "inherit");
        setLocalGap(gap || "1rem");
    }, [loop, imagesPerSlide, width, height, gap]);

    const onDelete = useCallback(
        (payload: KeyboardEvent) => {
            if (isSelected && $getNodeByKey(nodeKey)) {
                const event: KeyboardEvent = payload;
                event.preventDefault();
                const node = $getNodeByKey(nodeKey);
                if (node) {
                    node.remove();
                }
            }
            return false;
        },
        [isSelected, nodeKey]
    );

    useEffect(() => {
        return mergeRegister(
            editor.registerCommand(
                CLICK_COMMAND,
                (event: MouseEvent) => {
                    if (event.target === ref.current) {
                        if (!event.shiftKey) {
                            clearSelection();
                        }
                        setSelected(true);
                        return true;
                    }
                    return false;
                },
                COMMAND_PRIORITY_LOW
            ),
            editor.registerCommand(
                KEY_DELETE_COMMAND,
                onDelete,
                COMMAND_PRIORITY_LOW
            ),
            editor.registerCommand(
                KEY_BACKSPACE_COMMAND,
                onDelete,
                COMMAND_PRIORITY_LOW
            )
        );
    }, [clearSelection, editor, isSelected, nodeKey, onDelete, setSelected]);

    const handleSelectImages = (selectedImages: any[]) => {
        editor.update(() => {
            const node = $getNodeByKey(nodeKey);
            if ($isCarouselNode(node)) {
                const newImages: CarouselImage[] = selectedImages.map((img) => ({
                    src: img.url,
                    alt: img.alt || "Carousel Image",
                    id: img.id,
                }));
                const currentImages = node.getImages();
                node.setImages([...currentImages, ...newImages]);
            }
        });
        setMediaOpen(false);
    };

    const handleUpdateImages = (newImages: CarouselImage[]) => {
        editor.update(() => {
            const node = $getNodeByKey(nodeKey);
            if ($isCarouselNode(node)) {
                node.setImages(newImages);
            }
        });
    };

    const handleDelete = () => {
        editor.update(() => {
            const node = $getNodeByKey(nodeKey);
            if (node) node.remove();
        })
    }

    return (
        <div
            ref={ref}
            className={cn(
                "relative my-4 group rounded-md overflow-hidden border transition-all",
                isSelected && "ring-2 ring-primary"
            )}
            onMouseEnter={() => setHovered(true)}
            onMouseLeave={() => setHovered(false)}
            onClick={() => setSelected(true)}
        >
            {images.length === 0 ? (
                <div className="flex flex-col items-center justify-center p-12 bg-muted/30 border-dashed border-2 rounded-md">
                    <Button onClick={() => setMediaOpen(true)} variant="outline">
                        <ImagePlus className="w-4 h-4 mr-2" />
                        Select Images for Carousel
                    </Button>
                </div>
            ) : (
                <>
                    <div className="relative">
                        <Carousel
                            className="w-full"
                            opts={{
                                loop: localLoop,
                                align: "start",
                            }}
                        >
                            <CarouselContent
                                style={{
                                    marginLeft: `calc(-1 * ${localGap})`
                                }}
                            >
                                {images.map((img, index) => (
                                    <CarouselItem
                                        key={index}
                                        className="pl-4"
                                        style={{
                                            flexBasis: `${100 / localImagesPerSlide}%`,
                                            paddingLeft: localGap
                                        }}
                                    >
                                        <div className="p-1">
                                            <div
                                                className={cn(
                                                    "flex items-center justify-center relative overflow-hidden rounded-md bg-muted select-none pointer-events-none mx-auto",
                                                    !localHeight || localHeight === "inherit" ? "aspect-video" : "h-full"
                                                )}
                                                style={{
                                                    width: localWidth === "100%" ? undefined : localWidth,
                                                    height: localHeight === "inherit" ? undefined : localHeight
                                                }}
                                            >
                                                {/* Use styled img typical of editor */}
                                                <img
                                                    src={img.src}
                                                    alt={img.alt}
                                                    className="object-cover w-full h-full"
                                                />
                                            </div>
                                        </div>
                                    </CarouselItem>
                                ))}
                            </CarouselContent>
                            <CarouselPrevious className="left-2" />
                            <CarouselNext className="right-2" />
                        </Carousel>

                        {/* Editor Controls Overlay */}
                        <div className={cn(
                            "absolute top-2 right-2 flex gap-2 transition-opacity duration-200 z-10",
                            isHovered || isSelected || settingsOpen ? "opacity-100" : "opacity-0"
                        )}>
                            <Popover open={settingsOpen} onOpenChange={setSettingsOpen}>
                                <PopoverTrigger asChild>
                                    <Button size="icon" variant="secondary">
                                        <Settings className="w-4 h-4" />
                                    </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-80" align="end">
                                    <div className="grid gap-4">
                                        <div className="space-y-2">
                                            <h4 className="font-medium leading-none">Carousel Settings</h4>
                                            <p className="text-sm text-muted-foreground">
                                                Configure the appearance of the carousel.
                                            </p>
                                        </div>
                                        <div className="grid gap-2">
                                            <div className="flex items-center justify-between">
                                                <Label htmlFor="loop">Loop Images</Label>
                                                <Switch
                                                    id="loop"
                                                    checked={localLoop}
                                                    onCheckedChange={(checked) => {
                                                        setLocalLoop(checked);
                                                        editor.update(() => {
                                                            const node = $getNodeByKey(nodeKey);
                                                            if ($isCarouselNode(node)) {
                                                                node.setLoop(checked);
                                                            }
                                                        });
                                                    }}
                                                />
                                            </div>
                                            <div className="grid gap-2">
                                                <Label htmlFor="per-slide">Images per Slide</Label>
                                                <Input
                                                    id="per-slide"
                                                    type="number"
                                                    min={1}
                                                    max={10}
                                                    value={localImagesPerSlide}
                                                    onChange={(e) => {
                                                        const val = parseInt(e.target.value);
                                                        if (val > 0) {
                                                            setLocalImagesPerSlide(val);
                                                            editor.update(() => {
                                                                const node = $getNodeByKey(nodeKey);
                                                                if ($isCarouselNode(node)) {
                                                                    node.setImagesPerSlide(val);
                                                                }
                                                            });
                                                        }
                                                    }}
                                                />
                                            </div>
                                            <div className="grid grid-cols-2 gap-2">
                                                <div className="grid gap-2">
                                                    <Label htmlFor="width">Width (px)</Label>
                                                    <Input
                                                        id="width"
                                                        type="number"
                                                        placeholder="Auto"
                                                        value={parseInt(localWidth) || ""}
                                                        onChange={(e) => {
                                                            const val = e.target.value;
                                                            const newVal = val ? `${val}px` : "100%";
                                                            setLocalWidth(newVal);
                                                            editor.update(() => {
                                                                const node = $getNodeByKey(nodeKey);
                                                                if ($isCarouselNode(node)) {
                                                                    node.setWidth(newVal);
                                                                }
                                                            });
                                                        }}
                                                    />
                                                </div>
                                                <div className="grid gap-2">
                                                    <Label htmlFor="height">Height (px)</Label>
                                                    <Input
                                                        id="height"
                                                        type="number"
                                                        placeholder="Auto"
                                                        value={parseInt(localHeight) || ""}
                                                        onChange={(e) => {
                                                            const val = e.target.value;
                                                            const newVal = val ? `${val}px` : "inherit";
                                                            setLocalHeight(newVal);
                                                            editor.update(() => {
                                                                const node = $getNodeByKey(nodeKey);
                                                                if ($isCarouselNode(node)) {
                                                                    node.setHeight(newVal);
                                                                }
                                                            });
                                                        }}
                                                    />
                                                </div>
                                            </div>
                                            <div className="grid gap-2">
                                                <Label htmlFor="gap">Gap (px)</Label>
                                                <Input
                                                    id="gap"
                                                    type="number"
                                                    placeholder="16"
                                                    value={parseInt(localGap) || ""}
                                                    onChange={(e) => {
                                                        const val = e.target.value;
                                                        const newVal = val ? `${val}px` : "0px";
                                                        setLocalGap(newVal);
                                                        editor.update(() => {
                                                            const node = $getNodeByKey(nodeKey);
                                                            if ($isCarouselNode(node)) {
                                                                node.setGap(newVal);
                                                            }
                                                        });
                                                    }}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                    <div className="pt-2 border-t">
                                        <Button
                                            variant="outline"
                                            className="w-full"
                                            onClick={() => {
                                                setSettingsOpen(false);
                                                setManageOpen(true);
                                            }}
                                        >
                                            Manage Slides
                                        </Button>
                                    </div>
                                </PopoverContent>
                            </Popover>
                            <Button size="icon" variant="secondary" onClick={() => setMediaOpen(true)}>
                                <Pencil className="w-4 h-4" />
                            </Button>
                            <Button size="icon" variant="destructive" onClick={handleDelete}>
                                <Trash className="w-4 h-4" />
                            </Button>
                        </div>
                    </div>
                </>
            )}

            <MediaLibraryDialog
                siteId={siteId}
                isOpen={isMediaOpen}
                onClose={() => setMediaOpen(false)}
                onSelect={handleSelectImages}
                multiSelect={true}
            />

            <ManageSlidesDialog
                open={manageOpen}
                onOpenChange={setManageOpen}
                images={images}
                onUpdate={handleUpdateImages}
            />
        </div>
    );
}
