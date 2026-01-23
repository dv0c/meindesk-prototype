"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { completeProfile } from "@/lib/actions/user-actions";
import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

interface UserSetupFormProps {
    defaultName?: string | null;
    defaultImage?: string | null;
}

export function UserSetupForm({ defaultName, defaultImage }: UserSetupFormProps) {
    const router = useRouter();
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (formData: FormData) => {
        setLoading(true);
        const res = await completeProfile(formData);

        if (res.error) {
            toast.error(res.error);
            setLoading(false);
        } else {
            toast.success("Profile updated!");
            router.push("/dashboard");
            router.refresh();
        }
    };

    return (
        <Card className="w-full max-w-md mx-auto mt-20">
            <CardHeader>
                <CardTitle>Complete Your Profile</CardTitle>
                <CardDescription>
                    Choose a unique username and confirm your details to get started.
                </CardDescription>
            </CardHeader>
            <form action={handleSubmit}>
                <CardContent className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="name">Display Name</Label>
                        <Input
                            id="name"
                            name="name"
                            defaultValue={defaultName || ""}
                            placeholder="Your Name"
                            required
                            minLength={2}
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="username">Username</Label>
                        <Input
                            id="username"
                            name="username"
                            placeholder="username"
                            required
                            minLength={3}
                        />
                        <p className="text-xs text-muted-foreground">
                            Unique handle for your public profile.
                        </p>
                    </div>
                    {/* Hidden image field to potentially pass through or support upload later */}
                    <input type="hidden" name="image" value={defaultImage || ""} />
                </CardContent>
                <CardFooter>
                    <Button type="submit" className="w-full" disabled={loading}>
                        {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Continue to Dashboard
                    </Button>
                </CardFooter>
            </form>
        </Card>
    );
}
