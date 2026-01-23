import { cn } from "@/lib/utils";

interface SiteContainerProps extends React.HTMLAttributes<HTMLDivElement> {
    children: React.ReactNode;
}

export default function SiteContainer({
    children,
    className,
    ...props
}: SiteContainerProps) {
    return (
        <div
            className={cn("mx-auto w-full max-w-7xl px-4 md:px-6", className)}
            {...props}
        >
            {children}
        </div>
    );
}
