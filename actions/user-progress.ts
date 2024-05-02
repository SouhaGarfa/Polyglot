"use server"; // it's a server action 

import { and, eq } from "drizzle-orm";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { auth, currentUser } from "@clerk/nextjs";

import db from "@/db/drizzle";
//import { POINTS_TO_REFILL } from "@/constants";
import { getCourseById, getUserProgress } from "@/db/queries";
import {  userProgress, challengeProgress, challenges } from "@/db/schema";

// upsert () : if we already  have the course in our database then update . 
//If we started the course Spanish then I passed to French and I want to go back to it We'll use upsert() method 

export const upsertUserProgress = async (courseId: number) => {
  const { userId } = await auth();
  const user = await currentUser(); // get current user

  if (!userId || !user) {   // if no user id or user
    throw new Error("Unauthorized");
  }
 // else 
  const course = await getCourseById(courseId);

  if (!course) {
    throw new Error("Course not found");
  }
  

/*  // Enable when units and lessons are available : 
  if (!course.units.length || !course.units[0].lessons.length) {    // if we dont have any lessons or units 
    throw new Error("Course is empty");
  }
*/

  const existingUserProgress = await getUserProgress(); // getting userprogress from db query

  if (existingUserProgress) {   // if user has made a progress
    await db.update(userProgress).set({
      activeCourseId: courseId,
      userName: user.firstName || "User",   // refreshing name and image in case they were changed
      userImageSrc: user.imageUrl || "/mascot.svg",
    });
    
    // the revalidatePath: will purge the Client-side Router Cache and revalidate the Data Cache on the next page visit.
    // it will break the method and will not let the program go further 
    // if it's the first time that the user will make a progress : insert ()

    revalidatePath("/courses");
    revalidatePath("/learn");
    redirect("/learn");
  }

  await db.insert(userProgress).values({
    userId,
    activeCourseId: courseId,
    userName: user.firstName || "User",
    userImageSrc: user.imageUrl || "/mascot.svg",
  });

  revalidatePath("/courses");
  revalidatePath("/learn");
  redirect("/learn");
};




export const reduceHearts = async (challengeId: number) => {
  const { userId } = await auth();

  if (!userId) {
    throw new Error("Unauthorized");
  }

  const currentUserProgress = await getUserProgress();

  const challenge = await db.query.challenges.findFirst({
    where: eq(challenges.id, challengeId),
  });

  if (!challenge) throw new Error("Challenge not found.");

  const lessonId = challenge.lessonId;


  const existingChallengeProgress = await db.query.challengeProgress.findFirst({
    where: and(
      eq(challengeProgress.userId, userId),
      eq(challengeProgress.challengeId, challengeId),
    ),
  });

  const isPractice = !!existingChallengeProgress;

  if (isPractice) {
    return { error: "practice" };  //normal API response
  }

  if (!currentUserProgress) {
    throw new Error("User progress not found"); //critical = stopping app
  }

  if (currentUserProgress.hearts === 0) {
    return { error: "hearts" };
  }

  await db.update(userProgress).set({
    hearts: Math.max(currentUserProgress.hearts - 1, 0),
  }).where(eq(userProgress.userId, userId));

  revalidatePath("/shop");
  revalidatePath("/learn");
  revalidatePath("/quests");
  revalidatePath("/leaderboard");
  revalidatePath(`/lesson/${lessonId}`);

};
  /*




  if (userSubscription?.isActive) {
    return { error: "subscription" };
  }



};

export const refillHearts = async () => {
  const currentUserProgress = await getUserProgress();

  if (!currentUserProgress) {
    throw new Error("User progress not found");
  }

  if (currentUserProgress.hearts === 5) {
    throw new Error("Hearts are already full");
  }

  if (currentUserProgress.points < POINTS_TO_REFILL) {
    throw new Error("Not enough points");
  }

  await db.update(userProgress).set({
    hearts: 5,
    points: currentUserProgress.points - POINTS_TO_REFILL,
  }).where(eq(userProgress.userId, currentUserProgress.userId));

  revalidatePath("/shop");
  revalidatePath("/learn");
  revalidatePath("/quests");
  revalidatePath("/leaderboard");
};

*/