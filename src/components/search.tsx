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
  onSearchSuccess?: (data: SearchResults) => void;
};

const Search = ({
  label,
  description,
  className,
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
      return;
    }

    const searchResponse = await fetch(
      `/api/search?searchText=${values.searchText}`
    ).catch((e) => {
      return e;
    });

    if (!searchResponse?.ok) {
      return;
    }

    const data: SearchResults = await searchResponse.json();

    if (!data?.results?.records) {
      return;
    }

    onSearchSuccess?.(data);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className={`${className}`}>
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
        <Button type="submit" size="sm" className="mt-2">
          Submit
        </Button>
      </form>
    </Form>
  );
};

export default Search;
