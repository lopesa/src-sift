import { OpenAI } from "@langchain/openai";
import { ChatOpenAI } from "@langchain/openai";
import { ChatPromptTemplate, PromptTemplate } from "@langchain/core/prompts";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getFurtherReadingSchema } from "@/lib/types";

// @TODO: look at streaming these replies from chatgpt
export const maxDuration = 300;

export async function POST(req: NextRequest): Promise<Response> {
  const body = getFurtherReadingSchema.safeParse(await req.json());

  if (!body.success) {
    return new Response(JSON.stringify({ message: "Invalid body" }), {
      status: 400,
    });
  }

  const result = await getFurtherReading(body.data).catch((e) => {
    debugger;
  });

  if (!result || !result.content) {
    return NextResponse.json({ data: "No result" });
  }

  return NextResponse.json({ data: result.content });
}

const getFurtherReading = async (
  current: z.infer<typeof getFurtherReadingSchema>
) => {
  const model = new ChatOpenAI({});
  const promptTemplate = PromptTemplate.fromTemplate(
    "given that I have the following data: {text}, what are the top five most helpful items to further understand the topic. Please give specific links to the items and prepend each of the five items with '<li>' and append each of the five items with '</li>'. Give each of the <a> tags a target of '_blank' and a rel of 'noopener noreferrer'. Show the link text in addition to the title of the link. Provide a description of the link in addition to the title of the link."
  );
  const chain = promptTemplate.pipe(model);

  const result = await chain.invoke({
    text: JSON.stringify(current),
  });

  return result;
};

const getSummaryFromArrayOfDescriptions = async (descriptions: string[]) => {
  const bodyParsedForLangchain = descriptions.join("||");

  const promptTemplate = PromptTemplate.fromTemplate(
    "What do all of the data points have in common. The given text blob uses a separator of || between each different input text data point: {text}"
  );
  // const promptTemplate = PromptTemplate.fromTemplate(
  //   "summarize the following text into one search query designed to be used to retrieve the top three most helpful items from a group of data. The given text blob uses a separator of || between each different input text data point: {text}"
  // );

  const llm = new OpenAI({
    openAIApiKey: process.env.OPENAI_API_KEY,
    temperature: 0.9,
  });

  const model = new ChatOpenAI({});
  // const loader = new CSVLoader(data);

  // const docs = await loader.load();

  // debugger;

  // const chatPrompt = ChatPromptTemplate.fromMessages([
  //   ["system", systemTemplate],
  //   // ["human", formatDocumentsAsString(docs)],
  //   ["human", humanTemplate],
  // ]);

  const chain = promptTemplate.pipe(model);

  const result = await chain.invoke({
    // text: formatDocumentsAsString(docs),
    text: bodyParsedForLangchain,
  });
  return result;
};

// import { formatDocumentsAsString } from "langchain/util/document";

// const systemTemplate = `You are a data analyst who considers csv data and suggests types of data visualization. A user will pass in csv data, and you should suggest the three most appropriate types of data visualizations for the dataset. ONLY return a comma separated list of data visualization types, and nothing more.`;

// const humanTemplate = "{text}";

// export const getVisualizationSuggestions = async (data: Blob) => {
//   debugger;
//   const llm = new OpenAI({
//     openAIApiKey: process.env.OPENAI_API_KEY,
//     temperature: 0.9,
//   });

//   const model = new ChatOpenAI();
//   // const loader = new CSVLoader(data);

//   // const docs = await loader.load();

//   debugger;

//   const chatPrompt = ChatPromptTemplate.fromMessages([
//     ["system", systemTemplate],
//     // ["human", formatDocumentsAsString(docs)],
//     ["human", humanTemplate],
//   ]);

//   const chain = chatPrompt.pipe(model);

//   const result = await chain.invoke({
//     text: formatDocumentsAsString(docs),
//   });
//   return result;
// };
