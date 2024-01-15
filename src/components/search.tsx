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
import { SearchResults } from "@/lib/types";

const formSchema = z.object({
  searchText: z.string().min(2).max(150),
});

export type SearchProps = {
  label?: string;
  description?: string;
  className?: string;
  onSearchLoading?: () => void;
  onSearchFail?: () => void;
  onSearchSuccess?: (data: SearchResults) => void;
};

const Search = ({
  label,
  description,
  className,
  onSearchLoading,
  onSearchFail,
  onSearchSuccess,
}: SearchProps) => {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      searchText: "",
    },
  });

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    if (!values.searchText) {
      onSearchFail?.();
      return;
    }

    onSearchLoading?.();

    const searchResponse = await fetch(
      `/api/search?searchText=${values.searchText}`
    ).catch((e) => {
      onSearchFail?.();
      return e;
    });

    if (!searchResponse?.ok) {
      onSearchFail?.();
      return;
    }

    const data: SearchResults = await searchResponse.json();

    if (!data?.results?.records) {
      onSearchFail?.();
      return;
    }

    onSearchSuccess?.(data);
  };

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className={`flex flex-col items-center ${className}`}
      >
        <FormField
          control={form.control}
          name="searchText"
          render={({ field }) => (
            <FormItem>
              {label && <FormLabel>{label}</FormLabel>}
              <FormControl>
                <Input placeholder="Enter Search Text" {...field} />
              </FormControl>
              {description && <FormDescription>{description}</FormDescription>}
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" size="sm" className="mt-2 flex-none w-20">
          Submit
        </Button>
      </form>
    </Form>
  );
};

export default Search;
