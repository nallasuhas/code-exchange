import { db } from "../name";
import createAnswerCollection from "./answer.collection";
import createCommentCollection from "./comment.collection";
import createQuestionCollection from "./question.collection";
import createVoteCollection from "./vote.collection";

import { databases } from "./config";

export default async function getOrCreateDB(){
  try {
    await databases.get(db)
    console.log("Database connection")
  } catch {
    try {
      await databases.create(db, db)
      console.log("database created")
      //create collections
      await Promise.all([
        createQuestionCollection(),
        createAnswerCollection(),
        createCommentCollection(),
        createVoteCollection(),
      ])
    } catch (err) {
      console.log("Error creating databases or collection", err)
    }
  }
  return databases
}