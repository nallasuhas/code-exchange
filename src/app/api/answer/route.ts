import { databases, users } from "@/models/server/config";
import { NextRequest, NextResponse } from "next/server";
import { ID } from "node-appwrite";
import { db, answerCollection } from "@/models/name";
import {UserPrefs} from "@/store/Auth"

export async function POST(request: NextRequest){
    try{
        const {questionId, answer, authorId} = await request.json();

        const response = await databases.createDocument(db, answerCollection, ID.unique(), {
            content: answer,
            authorId: authorId,
            questionId: questionId
        })
        // Increase author reputation 
        const prefs = await users.getPrefs<UserPrefs>(authorId)
        await users.updatePrefs(authorId, {
            reputation: Number(prefs.reputation) + 1
          })

    return NextResponse.json(response, {
            status: 201
          })

    }catch(error: unknown){
        let message = "Error creating answer";
        let status = 500;
        if (typeof error === "object" && error !== null) {
          if ("message" in error && typeof (error as any).message === "string") {
            message = (error as any).message;
          }
          if ("status" in error && typeof (error as any).status === "number") {
            status = (error as any).status;
          } else if ("code" in error && typeof (error as any).code === "number") {
            status = (error as any).code;
          }
        }
        return NextResponse.json({ error: message }, { status });
    }
}

export async function DELETE(request: NextRequest){
    try {
      const {answerId} = await request.json()
  
      const answer = await databases.getDocument(db, answerCollection, answerId)
  
      const response = await databases.deleteDocument(db, answerCollection, answerId)
  
      //decrese the reputation
      const prefs = await users.getPrefs<UserPrefs>(answer.authorId)
      await users.updatePrefs(answer.authorId, {
        reputation: Number(prefs.reputation) - 1
      })
  
      return NextResponse.json(
        {data: response},
        {status: 200}
    )
  
  
  
    } catch (error: unknown) {
      let message = "Error deleting the answer";
      let status = 500;
      if (typeof error === "object" && error !== null) {
        if ("message" in error && typeof (error as any).message === "string") {
          message = (error as any).message;
        }
        if ("status" in error && typeof (error as any).status === "number") {
          status = (error as any).status;
        } else if ("code" in error && typeof (error as any).code === "number") {
          status = (error as any).code;
        }
      }
      return NextResponse.json(
        {
          message
        },
        {
          status
        }
      )
    }
  }