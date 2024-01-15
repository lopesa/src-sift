import { AskResult } from "@xata.io/client";
import { NextRequest } from "next/server";
import { getXataClient } from "@/xata";
import { aiQuestionFormat } from "@/lib/types";

const xata = getXataClient();

export const runtime = "edge";

export async function POST(req: NextRequest): Promise<Response> {
  const body = aiQuestionFormat.safeParse(await req.json());
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
