import { useCallback, useState } from "react";
import { fetchEventSource } from "@microsoft/fetch-event-source";
import { z } from "zod";
import { aiQuestionFormat } from "@/lib/types";

const useXataAiChat = () => {
  const [answer, setAnswer] = useState<string>();
  const [records, setRecords] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const askQuestion = useCallback(
    ({ question }: z.infer<typeof aiQuestionFormat>) => {
      // @TODO or not to do: choosing scope
      // for now just use all
      if (!question) return;

      setAnswer(undefined);
      setIsLoading(true);

      void fetchEventSource(`/api/ask`, {
        method: "POST",
        body: JSON.stringify({ question }),
        headers: { "Content-Type": "application/json" },
        onmessage(ev) {
          try {
            const { answer = "", records } = JSON.parse(ev.data);
            setAnswer((prev = "") => `${prev}${answer}`);
            if (records) {
              setRecords(records);
            }
            setIsLoading(false);
          } catch (e) {}
        },
      });
    },
    []
  );

  // Clear answer function
  const clearAnswer = useCallback(() => {
    setAnswer(undefined);
    setIsLoading(false);
  }, []);

  return { isLoading, answer, records, askQuestion, clearAnswer };
};

export default useXataAiChat;
