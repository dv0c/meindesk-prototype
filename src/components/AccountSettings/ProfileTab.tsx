"use client"

import { useState } from "react"
import { useSession } from "next-auth/react"
import { Camera, Loader2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { toast } from "sonner"
// @ts-ignore
import { CldUploadWidget } from "next-cloudinary"
import { updateProfile } from "@/lib/actions/user-actions"
import { useRouter } from "next/navigation"

export function ProfileTab() {
    const { data: session, update } = useSession()
    const user = session?.user
    const router = useRouter()

    const [name, setName] = useState(user?.name || "")
    const [image, setImage] = useState(user?.image || "")
    const [isLoading, setIsLoading] = useState(false)
    const [isUploading, setIsUploading] = useState(false)

    const handleUpdateProfile = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsLoading(true)

        const result = await updateProfile({ name, image })

        if (result.success) {
            await update({ name, image }) // Update session client-side
            toast.success("Profile updated successfully")
            router.refresh()
        } else {
            toast.error("Failed to update profile")
        }

        setIsLoading(false)
    }

    const handleUploadSuccess = (result: any) => {
        setIsUploading(false)
        if (result.event === "success" && result.info?.secure_url) {
            setImage(result.info.secure_url)
            toast.success("Image uploaded. Click Save Changes to apply.")
        }
    }

    return (
        <div className="space-y-6">
            <div>
                <h3 className="text-lg font-medium">Profile</h3>
                <p className="text-sm text-muted-foreground">
                    Manage your public profile information.
                </p>
            </div>

            <div className="flex flex-col gap-6">
                {/* Avatar Section */}
                <div className="flex items-center gap-6">
                    <div className="relative group h-20 w-20">
                        <Avatar className="h-20 w-20 border-2 border-muted">
                            <AvatarImage src={image || ""} className="object-cover" />
                            <AvatarFallback className="text-xl bg-muted">{name?.charAt(0) || user?.email?.charAt(0)}</AvatarFallback>
                        </Avatar>

                        <CldUploadWidget
                            options={{ maxFiles: 1 }}
                            onSuccess={handleUploadSuccess}
                            onUploadAdded={() => setIsUploading(true)}
                            onClose={() => setIsUploading(false)}
                            uploadPreset={process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET || "prototype"}
                        >
                            {({ open }: any) => {
                                return (
                                    <button
                                        type="button"
                                        onClick={(e) => {
                                            e.preventDefault();
                                            open();
                                        }}
                                        className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/40 rounded-full cursor-pointer h-full w-full outline-none focus:outline-none"
                                    >
                                        <Camera className="h-6 w-6 text-white" />
                                    </button>
                                );
                            }}
                        </CldUploadWidget>
                    </div>

                    <div className="flex flex-col gap-1">
                        <h4 className="font-medium">Profile Picture</h4>
                        <p className="text-xs text-muted-foreground max-w-[200px]">
                            Click on the avatar to upload a new one. JPG, GIF or PNG. Max size of 800K.
                        </p>
                        {isUploading && (
                            <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
                                <Loader2 className="h-3 w-3 animate-spin" />
                                Uploading...
                            </div>
                        )}
                    </div>
                </div>

                <form onSubmit={handleUpdateProfile} className="space-y-4 max-w-md">
                    <div className="space-y-2">
                        <Label htmlFor="name">Display Name</Label>
                        <Input
                            id="name"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="Enter your name"
                        />
                        <p className="text-[0.8rem] text-muted-foreground">
                            This is your public display name. It can be your real name or a pseudonym.
                        </p>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="email">Email</Label>
                        <Input
                            id="email"
                            value={user?.email || ""}
                            disabled
                            className="bg-muted/50"
                        />
                        <p className="text-[0.8rem] text-muted-foreground">
                            Email addresses cannot be changed for security reasons.
                        </p>
                    </div>

                    <Button type="submit" disabled={isLoading || isUploading}>
                        {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Save Changes
                    </Button>
                </form>
            </div>
        </div>
    )
}
