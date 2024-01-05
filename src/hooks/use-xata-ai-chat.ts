import { useCallback, useState } from "react";
import { fetchEventSource } from "@microsoft/fetch-event-source";

const useXataAiChat = () => {
  const [answer, setAnswer] = useState<string>();
  const [records, setRecords] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const askQuestion = useCallback((question: string) => {
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
            setIsLoading(false);
            setRecords(records);
          }
        } catch (e) {}
      },
    });
  }, []);

  // Clear answer function
  const clearAnswer = useCallback(() => {
    setAnswer(undefined);
    setIsLoading(false);
  }, []);

  return { isLoading, answer, records, askQuestion, clearAnswer };
};

export default useXataAiChat;
