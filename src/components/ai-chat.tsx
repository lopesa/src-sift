"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import useXataAiChat from "@/hooks/use-xata-ai-chat";
import { useContext } from "react";
import { SavedUserItemsContext } from "@/context/savedUserItemsProvider";
import DataItemDialog from "./DataItemDialog";
import { ResourceItemRecord } from "@/xata";
import { DataItemsAccordionItem } from "@/lib/types";
import SiftLoader from "./sift-loader";

const formSchema = z.object({
  chatText: z.string().min(2).max(150),
});

export type AiChatProps = {
  label?: string;
  description?: string;
  className?: string;
};

const AiChat = ({ label, description, className }: AiChatProps) => {
  const { savedUserItems, getUserData } = useContext(SavedUserItemsContext);
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      chatText: "",
    },
  });

  const { answer, records, isLoading, askQuestion } = useXataAiChat();
  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    askQuestion({
      question: values.chatText,
    });
  };

  return (
    <>
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className={`${className} w-72`}
        >
          <FormField
            control={form.control}
            name="chatText"
            render={({ field }) => (
              <FormItem>
                {label && <FormLabel>{label}</FormLabel>}
                <FormControl>
                  <Textarea
                    placeholder="Enter Chat Text (or Question)"
                    {...field}
                  />
                </FormControl>
                {description && (
                  <FormDescription>{description}</FormDescription>
                )}
                <FormMessage />
              </FormItem>
            )}
          />
          <Button type="submit" size="sm" className="mt-2">
            Submit
          </Button>
        </form>
      </Form>
      <div className="w-1/2">
        {answer && <div className="w-1/2 h-96 mx-auto mt-4">{answer}</div>}
        {isLoading && <SiftLoader className="mt-10 mb-4 mx-auto" />}
        {/* {records && (
          <div>
            scope:{" "}
            {scope?.map((s) => (
              <div>{s}</div>
            ))}
            records:{" "}
            {records?.map((r) => (
              <DataItemDialog key={r} resourceId={r} triggerCopy={r} />
              // <div>{r}</div>
            ))}
          </div>
        )} */}
      </div>
    </>
  );
};

export default AiChat;
