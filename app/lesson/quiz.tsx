"use client";

import { useState } from "react";
import { challengeOptions, challenges } from "@/db/schema";
import { Header } from "./header";

 
type Props = {
    initialLessonId:number,
    initialPercentage: number ; 
    initialHearts:number,
    initialLessonChallenges: (typeof challenges.$inferSelect & {
        completed : boolean; 
        challengeOptions: typeof challengeOptions.$inferSelect[];
    })[] ;
    userSubscription : any ; // replace with subscription DB type 

}
export const Quiz = ({
    initialPercentage,
    initialHearts,
    initialLessonId,
    initialLessonChallenges,
    userSubscription
    
} : Props) => {

    const [hearts,setHearts]= useState(initialHearts)
    const [percentage,setPercentage]= useState(initialPercentage)

    return (
        <>
           <Header

            hearts={hearts}
            percentage={percentage}
            hasActiveSubscription= {!! userSubscription?.isActive}
           />
        </>
    )
}
