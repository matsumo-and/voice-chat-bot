import {
  BedrockRuntimeClient,
  ConverseCommand,
  ConverseCommandOutput,
  Message,
} from "@aws-sdk/client-bedrock-runtime";
import { NextRequest, NextResponse } from "next/server";

export type Conversation = {
  message: string;
  history: {
    role: "user" | "chatbot";
    message: string;
  }[];
};

/**
 * .
 * @param req Buffer Request.
 * @returns Transcription.
 */
export async function POST(req: NextRequest) {
  // req validate
  if (req.body == null) {
    return NextResponse.json({ error: "BAD REQUEST" }, { status: 400 });
  }

  const conversation: Conversation = await req.json();

  // init Client.
  const client = new BedrockRuntimeClient({
    region: process.env.AWS_REGION,
    credentials: {
      accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
    },
  });

  const notification: string = `
### Condition
You must always respond in English. Failure to comply will result in penalties.
### Recommendation
1. If there are suspected grammatical or factual errors in the user's input, point them out.
2. Use casual and friendly English to ensure smooth conversation.
### Command
Based on the above conditions, recommendations, and the conversation history, provide a new response.
  `;

  let messages: Message[] = [];

  // initial prompt.
  messages.push({
    role: "user",
    content: [
      {
        text: notification,
      },
    ],
  });

  messages.push({
    role: "assistant",
    content: [
      {
        text: "Understood. now lets start conversation.",
      },
    ],
  });

  if (conversation.history.length > 0) {
    // add history
    messages = messages.concat(
      conversation.history.map((history) => {
        const result: Message = {
          role: history.role == "chatbot" ? "assistant" : "user",
          content: [
            {
              text: history.message,
            },
          ],
        };

        return result;
      })
    );
  }

  messages.push({
    role: "user",
    content: [
      {
        text: JSON.stringify(conversation.message),
      },
    ],
  });

  console.log("input messages");
  console.log(JSON.stringify(messages));

  const command = new ConverseCommand({
    modelId: "amazon.titan-text-express-v1",
    messages: messages,
    inferenceConfig: { maxTokens: 512, temperature: 0.5, topP: 0.9 },
  });

  try {
    const response: ConverseCommandOutput = await client.send(command);

    const responseText: string | undefined = response.output?.message?.content
      ? response.output?.message?.content[0].text
      : undefined;

    console.log("output messages");
    console.log(response.output?.message);

    if (!responseText || response.$metadata.httpStatusCode !== 200) {
      return NextResponse.json(
        { error: "Failed to fetch content" },
        { status: 500 }
      );
    }

    return new Response(JSON.stringify(responseText), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error processing buffer:", error);
    return NextResponse.json(
      { error: "Failed to process the buffer" },
      { status: 500 }
    );
  }
}
