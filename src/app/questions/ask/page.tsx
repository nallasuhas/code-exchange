"use client";

import QuestionForm from "@/components/QuestionForm";
import { useAuthStore } from "@/store/Auth";
import { useRouter } from "next/navigation";
import React from "react";

const AskQuestion = () => {
    const { user } = useAuthStore();
    const router = useRouter();

    React.useEffect(() => {
        // Redirect if user is not logged in
        if (!user) {
            router.push('/login');
        }
    }, [user, router]);

    if (!user) return null;

    return (
        <div className="block pb-20 pt-32">
            <div className="container mx-auto px-4">
                <h1 className="mb-10 mt-4 text-2xl">Ask a public question</h1>

               
                     
                    <div className="w-full md:w-2/3">
                        <QuestionForm />
                    </div>
                
            </div>
        </div>
    );
};

export default AskQuestion;