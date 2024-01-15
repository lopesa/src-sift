"use client";

import useXataAiChat from "@/hooks/use-xata-ai-chat";
import { Button } from "./ui/button";
import SkewLoader from "react-spinners/SkewLoader";
import { useState } from "react";
import DataItemDialog from "./DataItemDialog";

type FindSimilarProps = {
  description: string;
  className?: string;
};

const FindSimilar = ({ description, className }: FindSimilarProps) => {
  const { answer, records, isLoading, askQuestion } = useXataAiChat();
  const [questionAsked, setQuestionAsked] = useState(false);
  const handleClick = async (description: string) => {
    if (questionAsked) return;
    setQuestionAsked(true);
    askQuestion({
      question: `find the other records in the table that have the most relevance to the following record description: ${description}`,
      // rules: [
      //   // "talk like a pirate",
      //   "do not return the record itself",
      //   "return the top 5 most relevant entries",
      //   "return the entries in order of relevance",
      //   "return a bullet pointed list of the entries",
      //   "add a note about why the record is relevant",
      //   "return the id of the record",
      // ],
      searchType: "vector",
    });
  };

  return (
    <div className={className}>
      <Button
        size="xs"
        className="bg-stone-600 hover:bg-stone-800"
        onClick={() => {
          handleClick(description);
        }}
      >
        Find Similar
      </Button>
      {isLoading && (
        <SkewLoader
          loading={true}
          className="mt-1 mb-4"
          color="#38bdf8"
          size={14}
        />
      )}
      {answer && <div>{answer}</div>}
      {records &&
        records?.map((r) => (
          <DataItemDialog key={r} resourceId={r} triggerCopy={r} />
          // <div>{r}</div>
        ))}
    </div>
  );
};

export default FindSimilar;
