import { MarkdownPreview } from "@/components/RTE";
import { answerCollection, db, questionCollection } from "@/models/name";
import { databases } from "@/models/server/config";
import slugify from "@/utils/slugify";
import Link from "next/link";
import { Query } from "node-appwrite";
import React from "react";
import {
    Pagination,
    PaginationContent,
    PaginationItem,
    PaginationLink,
    PaginationNext,
    PaginationPrevious,
  } from "@/components/ui/pagination"

const Page = async ({
    params,
    searchParams,
}: {
    params: Promise<{ userId: string }>;
    searchParams: Promise<{ page?: string }>;
}) => {
  const { userId } = await params;
  let { page } = await searchParams;
  page ||= "1";

    const queries = [
        Query.equal("authorId", userId),
        Query.orderDesc("$createdAt"),
        Query.offset((+page - 1) * 25),
        Query.limit(25),
    ];

    const answers = await databases.listDocuments(db, answerCollection, queries);

    answers.documents = await Promise.all(
        answers.documents.map(async ans => {
            const question = await databases.getDocument(db, questionCollection, ans.questionId, [
                Query.select(["title"]),
            ]);
            return { ...ans, question };
        })
    );

    // Pagination logic
    const pageSize = 25;
    const totalPages = Math.ceil(answers.total / pageSize);
    const currentPage = +page;

    return (
        <div className="px-4">
            <div className="mb-4">
                <p>{answers.total} answers</p>
            </div>
            <div className="mb-4 max-w-3xl space-y-6">
                {answers.documents.length === 0 ? (
                  <div className="text-gray-500">No answers found.</div>
                ) : (
                  answers.documents.map(ans => (
                    <div key={ans.$id}>
                        <div className="max-h-40 overflow-auto">
                            <MarkdownPreview source={ans.content} className="rounded-lg p-4" />
                        </div>
                        <Link
                            href={`/questions/${ans.questionId}/${slugify(ans.question.title)}`}
                            className="mt-3 inline-block shrink-0 rounded bg-orange-500 px-4 py-2 font-bold text-white hover:bg-orange-600"
                        >
                            Question
                        </Link>
                    </div>
                  ))
                )}
            </div>
            <Pagination>
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious
                    href={`?page=${Math.max(1, currentPage - 1)}`}
                    aria-disabled={currentPage === 1}
                  />
                </PaginationItem>
                {Array.from({ length: totalPages }, (_, i) => (
                  <PaginationItem key={i + 1}>
                    <PaginationLink
                      href={`?page=${i + 1}`}
                      isActive={currentPage === i + 1}
                    >
                      {i + 1}
                    </PaginationLink>
                  </PaginationItem>
                ))}
                <PaginationItem>
                  <PaginationNext
                    href={`?page=${Math.min(totalPages, currentPage + 1)}`}
                    aria-disabled={currentPage === totalPages}
                  />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
        </div>
    );
};

export default Page;