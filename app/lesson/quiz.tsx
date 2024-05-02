"use client";

import { toast } from "sonner";
import { useState, useTransition } from "react";
import { reduceHearts } from "@/actions/user-progress";
import { challengeOptions, challenges } from "@/db/schema";
import { Header } from "./header";
import { QuestionBubble } from "./question-bubble";
import { Challenge } from "./challenge";
import { Footer } from "./footer";
import { upsertChallengeProgress } from "@/actions/challenge-progress";
import { useAudio,useWindowSize,useMount} from "react-use";
import Image from "next/image";
import Confetti from "react-confetti" ;
import { ResultCard } from "./result-card";
import { useRouter } from "next/navigation";
import { useHeartsModal } from "@/store/use-hearts-modal";
import { usePracticeModal } from "@/store/use-practice-modal ";

type Props = {
  initialPercentage: number;
  initialHearts: number;
  initialLessonId: number;
  initialLessonChallenges: (typeof challenges.$inferSelect & {
    completed: boolean;
    challengeOptions: (typeof challengeOptions.$inferSelect)[];
  })[];
  userSubscription: any;
};

export const Quiz = ({
  initialPercentage,
  initialHearts,
  initialLessonId,
  initialLessonChallenges,
  userSubscription,
}: Props) => {
    const {open:openHeartsModal}=useHeartsModal(); 
    const {open:openPracticeModal}=usePracticeModal(); 
    useMount(()=>{
        if(initialPercentage === 100 ){
            openPracticeModal(); 

        }
    })

    const{width,height}= useWindowSize(); 
    const router = useRouter()
    const [finishAudio] = useAudio({src:"/finish.mp3", autoPlay:true}); 
    const [
        correctAudio,
        _c,
        correctControls,

    ] = useAudio({src:"/correct.mp3"}) // make sure that the names math those in Public folder 
    const [
        incorrectAudio,
        _i,
        incorrectControls,
        
    ] = useAudio({src:"/incorrect.mp3"}) // make sure that the names math those in Public folder 

  const [pending, startTransition] = useTransition();
  const [lessonId] = useState(initialLessonId);
  const [hearts, setHearts] = useState(initialHearts);
  const [percentage, setPercentage] = useState(()=>{
    return initialPercentage === 100 ? 0 :initialPercentage;
  });
  const [challenges] = useState(initialLessonChallenges); 
  //creating a state

  const [activeIndex, setActiveIndex] = useState(() => {
    const uncompletedIndex = challenges.findIndex(
      (challenge) => !challenge.completed
    );

    return uncompletedIndex === -1 ? 0 : uncompletedIndex;
    // if uncompleted index is -1 , then make it 0, otherwise load first uncomplete index
  });

  const [selectedOption,setSelectedOption] = useState<number>(); //type is number

  const [status,setStatus] = useState<"correct" | "wrong" |"none">("none");
  // by default it is "none"
  //   const [status,setStatus] = useState<"correct" | "wrong" |"none">("correct");


  const challenge = challenges[activeIndex]; //control which challenge is currently active,either put it at 0 or go to the previous one
  // current challenge

  const options = challenge?.challengeOptions ?? [];

  const onNext = () => {
    setActiveIndex((current) => current + 1);
  };

  const onSelect = (id:number) => {
    if (status !== "none") return ; // the use didnt submit his choice

    setSelectedOption(id);
  }

  const onContinue = () => {
    if (!selectedOption) return;

    if (status === "wrong") {
      setStatus("none");
      setSelectedOption(undefined);
      return ;
    }

    if (status === "correct") {
      onNext();
      setStatus("none");
      setSelectedOption(undefined);
      return;
    }

    const correctOption = options.find((option) => option.correct);

    if (!correctOption) {
      return ;
    }

    if (correctOption && correctOption.id === selectedOption) { 
      startTransition(() => {
        upsertChallengeProgress(challenge.id)
        .then((response) => {
          if (response?.error === "hearts") {
            openHeartsModal();
            return;
          }
          correctControls.play(); 
          setStatus("correct");
          setPercentage((prev) => prev = 100 / challenges.length);

          if (initialPercentage === 100) {
            setHearts((prev) => Math.min(prev + 1, 5));
          }
        })
        .catch(() => toast.error("Something went wrong"))
      });
    }
    else {
      startTransition(() => {
        reduceHearts(challenge.id)
        .then((response) => {
          if (response?.error === "hearts") {
            openHeartsModal();
            return;
          }
          incorrectControls.play(); 

          setStatus("wrong");

          if (!response?.error) setHearts((prev) => Math.max(prev - 1, 0));

        })
        .catch(() => toast.error("Something went wrong. Please try again."));
      });
        }
  };
  // will be changed to redirect the user to the next challenge or to the learn page 
  //     to do : remove : true 
  if(!challenge){
    return (
        <>
        {finishAudio}
        <Confetti
            width={width}
            height={height}
            recycle={false}
            numberOfPieces={500}
            tweenDuration={10000}

        />
            <div className="flex flex-col gap-y-4 lg:gap-y-8 
            max-w-lg mx-auto text-center items-center justify-center h-full">
                <Image
                    src="/finished.png"
                    alt=" Finished "
                    className="hidden lg:block"
                    height={100}
                    width={100}
                 />
                
                <Image
                    src="/finished.png"
                    alt=" Finished "
                    className="block lg:hidden"
                    height={50}
                    width={50}
                 />
                 <h1 className="text-xl lg:text-3xl font-bold text-neutral-700">
                    Great  job ! <br/> You've finished the lesson .
                 </h1>
                 <div className="flex items-center gap-x-4 w-full">
                    <ResultCard
                        variant="points"
                        value={challenges.length * 10} // * 10 : 10 points in each challenge
                    />

                    <ResultCard
                        variant="hearts"
                        value={hearts} // * 10 : 10 points in each challenge
                    />

                 </div>
            </div>
            <Footer
                lessonId={lessonId}
                status="completed"
                onCheck={()=>router.push("/learn")}
            />
        </>
    )

  }

  const title =
    challenge.type === "ASSIST"
      ? "Select the correct meaning"
      : challenge.question;
      //if ASSIST , render the ".." else if SELECT then...

  return (
    <>
        {incorrectAudio}
        {correctAudio}
      <Header
        hearts={hearts}
        percentage={percentage}
        hasActiveSubscription={!!userSubscription?.isActive}      
        />

<div className="flex-1">
        <div className="flex h-full items-center justify-center">
          <div className="flex w-full flex-col gap-y-12 px-6 lg:min-h-[350px] lg:w-[600px] lg:px-0">
            <h1 className="text-center text-lg font-bold text-neutral-700 lg:text-start lg:text-3xl">
              {/* Which of these is an apple? */}
              {title}
            </h1>

            <div>
              {challenge.type === "ASSIST" && (
                <QuestionBubble question={challenge.question} />
              )}

              <Challenge
                options={options}
                onSelect={onSelect}
                status={status}
                // status="correct"
                selectedOption={selectedOption}
                disabled={pending}
                type={challenge.type}
              />
            </div>
          </div>
        </div>
      </div>
      <Footer 
          disabled={pending || !selectedOption} // disabled if we dont have a selected option
          status={status}
          onCheck={onContinue}
        />
    </>
  );
};