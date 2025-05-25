import { users } from "@/models/server/config";
import { UserPrefs } from "@/store/Auth";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import React from "react";

const Page = async ({ params }: { params: Promise<{ userId: string; userSlug: string }> }) => {
    const { userId } = await params;
    // Fetch user data from Appwrite
    const user = await users.get<UserPrefs>(userId);

    return (
        <div className="container mx-auto max-w-xl space-y-8 px-4 pb-20 pt-32">
            <h1 className="text-3xl font-bold mb-4">Edit Profile</h1>
            <form
                className="space-y-6"
                action={async (formData: FormData) => {
                    'use server';
                    const name = formData.get("name") as string;
                    const email = formData.get("email") as string;
                    // Only update if changed
                    if (name !== user.name) {
                        await users.updateName(userId, name);
                    }
                    if (email !== user.email) {
                        await users.updateEmail(userId, email);
                    }
                }}
            >
                <div>
                    <label htmlFor="name" className="block mb-1 font-medium">Name</label>
                    <Input
                        id="name"
                        name="name"
                        defaultValue={user?.name || ""}
                        required
                        className="w-full"
                    />
                </div>
                <div>
                    <label htmlFor="email" className="block mb-1 font-medium">Email</label>
                    <Input
                        id="email"
                        name="email"
                        type="email"
                        defaultValue={user?.email || ""}
                        required
                        className="w-full"
                    />
                </div>
                <Button type="submit" className="w-full">Save Changes</Button>
            </form>
        </div>
    );
};

export default Page;