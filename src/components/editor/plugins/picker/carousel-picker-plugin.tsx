import { LexicalEditor } from "lexical";
import { INSERT_CAROUSEL_COMMAND } from "../carousel-plugin";
import { GalleryHorizontal } from "lucide-react";
import { ComponentPickerOption } from "./component-picker-option";

export function CarouselPickerPlugin() {
    return new ComponentPickerOption("Carousel", {
        icon: <GalleryHorizontal className="w-4 h-4" />,
        keywords: ["slideshow", "gallery", "slider", "images"],
        onSelect: (_, editor) => {
            editor.dispatchCommand(INSERT_CAROUSEL_COMMAND, undefined);
        },
    });
}
