import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { $insertNodeToNearestRoot, mergeRegister } from "@lexical/utils";
import {
    COMMAND_PRIORITY_EDITOR,
    createCommand,
    LexicalCommand,
} from "lexical";
import { JSX, useEffect } from "react";
import { $createCarouselNode, CarouselNode } from "../nodes/carousel-node";

export const INSERT_CAROUSEL_COMMAND: LexicalCommand<void> = createCommand(
    "INSERT_CAROUSEL_COMMAND"
);

export default function CarouselPlugin(): JSX.Element | null {
    const [editor] = useLexicalComposerContext();

    useEffect(() => {
        if (!editor.hasNodes([CarouselNode])) {
            throw new Error("CarouselPlugin: CarouselNode not registered on editor");
        }

        return mergeRegister(
            editor.registerCommand(
                INSERT_CAROUSEL_COMMAND,
                () => {
                    const carouselNode = $createCarouselNode([]);
                    $insertNodeToNearestRoot(carouselNode);
                    return true;
                },
                COMMAND_PRIORITY_EDITOR
            )
        );
    }, [editor]);

    return null;
}
