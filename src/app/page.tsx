import { BackgroundBeams } from "@/components/ui/background-beams";
import { TypewriterEffect } from "@/components/ui/typewriter-effect";
import SparklesText from "@/components/ui/sparkles-text";
import LatestQuestions from "./components/LatestQuestions";


export default function Home() {
  const words = [
     {text: "Code,"},
     {text: "Solve"},
     {text: "and"}, 
     {text: "Grow"}, 
     {text: "Together.",
      className: "text-blue-500 dark:text-blue-500",
     }]
  return (
   <div >
   <div className="flex flex-col items-center gap-3 justify-center h-[40rem]  ">
    <SparklesText text="CodeXchange"/>
   <TypewriterEffect words={words} />
   </div>

   <div className="flex flex-col items-center my-4 gap-3 ">
    <p className="text-xl">Latest questions</p>
   <LatestQuestions />
   </div>
   <div className="pointer-events-none">
   <BackgroundBeams />
   </div>
   
   </div>
  );
}
