import { AskResult } from "@xata.io/client";
import { NextRequest } from "next/server";
import { z } from "zod";
import { getXataClient } from "@/xata";

const xata = getXataClient();

export const config = {
  runtime: "edge",
};

const bodySchema = z.object({
  question: z.string(),
});

export async function POST(req: NextRequest): Promise<Response> {
  const body = bodySchema.safeParse(await req.json());
  if (!body.success) {
    return new Response(JSON.stringify({ message: "Invalid body" }), {
      status: 400,
    });
  }

  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    async start(controller) {
      xata.db.resource_item.ask(body.data.question, {
        onMessage: (message: AskResult) => {
          // debugger;
          controller.enqueue(encoder.encode(`event: message\n`));
          controller.enqueue(
            encoder.encode(`data: ${JSON.stringify(message)}\n\n`)
          );
        },
      });
    },
  });

  return new Response(stream, {
    headers: {
      Connection: "keep-alive",
      "Cache-Control": "no-cache, no-transform",
      "Content-Type": "text/event-stream;charset=utf-8",
    },
  });
}
