import { databases, users } from "@/models/server/config";
import { answerCollection, db, voteCollection, questionCollection } from "@/models/name";
import { Query } from "node-appwrite";
import React from "react";
import Link from "next/link";
import { UserPrefs } from "@/store/Auth";
import Search from "./Search";
import ShinyButton from "@/components/ui/shiny-button";
import QuestionCard from "@/components/QuestionCard";
import {
    Pagination,
    PaginationContent,
    PaginationEllipsis,
    PaginationItem,
    PaginationLink,
    PaginationNext,
    PaginationPrevious,
} from "@/components/ui/pagination";

const Page = async ({ searchParams }: { searchParams: Promise<{ page?: string; tag?: string; search?: string }> }) => {
    console.log("Questions page rendering with params:", await searchParams);
    try {
        const {page, tag, search} = await searchParams;
        // Safely handle the page parameter
        const currentPage = page || "1";
        
        const queries = [
            Query.orderDesc("$createdAt"),
            Query.offset((parseInt(currentPage) - 1) * 25),
            Query.limit(25),
        ];

        if (tag) {
            queries.push(Query.equal("tags", tag));
        }

        if (search) {
            queries.push(
                Query.or([
                    Query.search("title", search),
                    Query.search("content", search),
                ])
            );
        }

        const questions = await databases.listDocuments(db, questionCollection, queries);
        console.log("Questions", questions);

        try {
            questions.documents = await Promise.all(
                questions.documents.map(async (ques) => {
                    try {
                        const [author, answers, votes] = await Promise.all([
                            users.get<UserPrefs>(ques.authorId),
                            databases.listDocuments(db, answerCollection, [
                                Query.equal("questionId", ques.$id),
                                Query.limit(1), // for optimization
                            ]),
                            databases.listDocuments(db, voteCollection, [
                                Query.equal("type", "question"),
                                Query.equal("typeId", ques.$id),
                                Query.limit(1), // for optimization
                            ]),
                        ]);

                        return {
                            ...ques,
                            totalAnswers: answers.total,
                            totalVotes: votes.total,
                            author: {
                                $id: author.$id,
                                reputation: author.prefs.reputation,
                                name: author.name,
                            },
                        };
                    } catch (error) {
                        console.error(`Error processing question ${ques.$id}:`, error);
                        return {
                            ...ques,
                            totalAnswers: 0,
                            totalVotes: 0,
                            author: {
                                $id: ques.authorId,
                                reputation: 0,
                                name: "Unknown",
                            },
                        };
                    }
                })
            );
        } catch (error) {
            console.error("Error processing questions:", error);
            questions.documents = [];
        }

        // Calculate total pages
        const totalPages = Math.ceil(questions.total / 25);

        // Helper function to build pagination URLs
        const buildPaginationUrl = (pageNum: number) => {
            const params = new URLSearchParams();
            params.set('page', pageNum.toString());
            if (tag) params.set('tag', tag);
            if (search) params.set('search', search);
            return `?${params.toString()}`;
        };

        return (
            <div className="container mx-auto px-4 pb-20 pt-36">
                <div className="mb-10 flex items-center justify-between">
                    <h1 className="text-3xl font-bold">All Questions</h1>
                    <Link href="/questions/ask">
                        <ShinyButton className="shadow-2xl">
                            <span className="whitespace-pre-wrap text-center text-sm font-medium leading-none tracking-tight text-white dark:from-white dark:to-slate-900/10 lg:text-lg">
                                Ask a question
                            </span>
                        </ShinyButton>
                    </Link>
                </div>
                <div className="mb-4">
                    <Search />
                </div>
                <div className="mb-4">
                    <p>{questions.total} questions</p>
                </div>
                <div className="mb-4 max-w-3xl space-y-6">
                    {questions.documents.map((ques) => (
                        <QuestionCard key={ques.$id} ques={ques} />
                    ))}
                </div>
                
                {totalPages > 1 && (
                    <Pagination>
                        <PaginationContent>
                            {parseInt(currentPage) > 1 && (
                                <PaginationItem>
                                    <PaginationPrevious href={buildPaginationUrl(parseInt(currentPage) - 1)} />
                                </PaginationItem>
                            )}
                            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => (
                                <PaginationItem key={i}>
                                    <PaginationLink
                                        href={buildPaginationUrl(i + 1)}
                                        isActive={parseInt(currentPage) === i + 1}
                                    >
                                        {i + 1}
                                    </PaginationLink>
                                </PaginationItem>
                            ))}
                            {totalPages > 5 && (
                                <PaginationItem>
                                    <PaginationEllipsis />
                                </PaginationItem>
                            )}
                            {parseInt(currentPage) < totalPages && (
                                <PaginationItem>
                                    <PaginationNext href={buildPaginationUrl(parseInt(currentPage) + 1)} />
                                </PaginationItem>
                            )}
                        </PaginationContent>
                    </Pagination>
                )}
            </div>
        );
    } catch (error) {
        console.error("Error in questions page:", error);
        throw error;
    }
};

export default Page;