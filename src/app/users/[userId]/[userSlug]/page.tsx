import { databases, users } from "@/models/server/config";
import { UserPrefs } from "@/store/Auth";
import React from "react";
import { MagicCard } from "@/components/ui/magic-card";
import { answerCollection, db, questionCollection } from "@/models/name";
import { Query } from "node-appwrite";
import NumberTicker from "@/components/ui/number-ticker";


const Page = async({params } : { params: { userId: string; userSlug: string }}) => {
    const {userId} = await params
 
    const [user, questions, answers] = await Promise.all([
        users.get<UserPrefs>( userId),
        databases.listDocuments(db, questionCollection, [
            Query.equal("authorId", userId),
            Query.limit(1), // for optimization
        ]),
        databases.listDocuments(db, answerCollection, [
            Query.equal("authorId", userId),
            Query.limit(1), // for optimization
        ]),
    ])

    return (
        <div className={"flex h-[500px] w-full flex-col gap-4 lg:h-[250px] lg:flex-row"}> 
           <MagicCard className="flex w-full cursor-pointer flex-col items-center justify-center overflow-hidden p-20 shadow-2xl">
                <div className="absolute inset-x-4 top-4">
                    <h2 className="text-xl font-medium">Reputation</h2>
                </div>
                <p className="z-10 whitespace-nowrap text-4xl font-medium text-gray-800 dark:text-gray-200">
                    <NumberTicker value={user.prefs.reputation} />
                </p>
                <div className="pointer-events-none absolute inset-0 h-full bg-[radial-gradient(circle_at_50%_120%,rgba(120,119,198,0.3),rgba(255,255,255,0))]" />
            </MagicCard>
            <MagicCard className="flex w-full cursor-pointer flex-col items-center justify-center overflow-hidden p-20 shadow-2xl">
                <div className="absolute inset-x-4 top-4">
                    <h2 className="text-xl font-medium">Questions asked</h2>
                </div>
                <p className="z-10 whitespace-nowrap text-4xl font-medium text-gray-800 dark:text-gray-200">
                    <NumberTicker value={questions.total} />
                </p>
                <div className="pointer-events-none absolute inset-0 h-full bg-[radial-gradient(circle_at_50%_120%,rgba(120,119,198,0.3),rgba(255,255,255,0))]" />
            </MagicCard>
            <MagicCard className="flex w-full cursor-pointer flex-col items-center justify-center overflow-hidden p-20 shadow-2xl">
                <div className="absolute inset-x-4 top-4">
                    <h2 className="text-xl font-medium">Answers given</h2>
                </div>
                <p className="z-10 whitespace-nowrap text-4xl font-medium text-gray-800 dark:text-gray-200">
                    <NumberTicker value={answers.total} />
                </p>
                <div className="pointer-events-none absolute inset-0 h-full bg-[radial-gradient(circle_at_50%_120%,rgba(120,119,198,0.3),rgba(255,255,255,0))]" />
            </MagicCard>        
      </div>
    )
}

export default Page;