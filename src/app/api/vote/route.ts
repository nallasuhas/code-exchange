import { db, voteCollection, questionCollection, answerCollection } from "@/models/name";
import { databases, users } from "@/models/server/config";
import { UserPrefs } from "@/store/Auth";
import { NextRequest, NextResponse } from "next/server";
import { ID, Query } from "node-appwrite";


export async function POST(request: NextRequest){
    try{
        //collect data 
        const { votedById, voteStatus, type, typeId } = await request.json();
   
        const response = await databases.listDocuments(db, voteCollection, [
            Query.equal("type", type),
            Query.equal("typeId", typeId),
            Query.equal("votedById", votedById),
        ])
       // if there is already an upvote or downvote on that particular vote button and the user clicks on the same button, it should be removed
        if(response.documents.length > 0){
            await databases.deleteDocument(db, voteCollection, response.documents[0].$id);
             // Decrease the reputation of the question/answer author
             // get the question or answer to which the vote is associated with
             // here typeId indicates the id of the question document or id of the answer document according to the association of that vote  
             const questionOrAnswer = await databases.getDocument(
                db,
                type === "question" ? questionCollection : answerCollection,
                typeId
            );
            // get the user prefs using the authorid
            const authorPrefs =  await users.getPrefs<UserPrefs>(questionOrAnswer.authorId);
            // decrement the reputation if it is upvoted and increment it for downvote
           await users.updatePrefs<UserPrefs>(questionOrAnswer.authorId, {
             reputation:  response.documents[0].voteStatus === "upvoted" ? 
                           Number(authorPrefs.reputation) - 1 :
                           Number(authorPrefs.reputation) + 1,
           })
        }

        // that means prev vote does not exists or voteStatus changed
        if(response.documents[0]?.voteStatus !== voteStatus){
            const doc = await databases.createDocument(db, voteCollection, ID.unique(), {
                type,
                typeId,
                voteStatus,
                votedById,
            })
             // Increate/Decrease the reputation of the question/answer author accordingly
             const questionOrAnswer = await databases.getDocument(db,  
                type === "question" ? questionCollection : answerCollection, 
                typeId )
              // get user prefs
              const authorPrefs = await users.getPrefs<UserPrefs>(questionOrAnswer.authorId);

               // if vote was present
               if(response.documents[0]){
                   await users.updatePrefs<UserPrefs>(questionOrAnswer.authorId,  {
                    reputation: 
                     // that means prev vote was "upvoted" and new value is "downvoted" so we have to decrease the reputation 
                      response.documents[0].voteStatus === "upvoted" 
                      ? Number(authorPrefs.reputation) - 1 :
                        Number(authorPrefs.reputation) + 1,
                   })
               } else {
                await users.updatePrefs<UserPrefs>(questionOrAnswer.authorId, {
                    reputation:
                        // that means prev vote was "upvoted" and new value is "downvoted" so we have to decrease the reputation
                        voteStatus === "upvoted"
                            ? Number(authorPrefs.reputation) + 1
                            : Number(authorPrefs.reputation) - 1,
                });
               } 

               const [upvotes, downvotes] = await Promise.all([
                databases.listDocuments(db, voteCollection, [
                    Query.equal("type", type),
                    Query.equal("typeId", typeId),
                    Query.equal("voteStatus", "upvoted"),
                    Query.limit(1000), // get all upvotes
                ]), 
                databases.listDocuments(db, voteCollection, [
                    Query.equal("type", type),
                    Query.equal("typeId", typeId),
                    Query.equal("voteStatus", "downvoted"),
                    Query.limit(1000), // get all downvotes
                ]),
            ])

            return NextResponse.json(
                {
                    data: { document: doc, voteResult: upvotes.total - downvotes.total },
                    message: response.documents[0] ? "Vote Status Updated" : "Voted",
                },
                {
                    status: 201,
                }
            );
        }
      
        // executes for vote withdrawal 
        const [upvotes, downvotes] = await Promise.all([
            databases.listDocuments(db, voteCollection, [
                Query.equal("type", type),
                Query.equal("typeId", typeId),
                Query.equal("voteStatus", "upvoted"),
                Query.limit(1000), // get all upvotes
            ]),
            databases.listDocuments(db, voteCollection, [
                Query.equal("type", type),
                Query.equal("typeId", typeId),
                Query.equal("voteStatus", "downvoted"),
                Query.limit(1000), // get all downvotes
            ]),
        ]);

        return NextResponse.json(
            {
                data: { 
                    document: null, voteResult: upvotes.total - downvotes.total 
                },
                message: "Vote Withdrawn",
            },
            {
                status: 200,
            }
        );

        


    }catch(error: unknown){
        let message = "An error occurred";
        let status = 500;

        if (typeof error === "object" && error !== null) {
            const err = error as { message?: string; status?: number; code?: number };
            if (err.message) message = err.message;
            if (err.status) status = err.status;
            else if (err.code) status = err.code;
        }

        return NextResponse.json(
            { message },
            { status }
        );
    }

}