import { Conversation } from "@/app/api/conversation/route";

/**
 * get messages from AI assistant.
 *
 * @param message user message.
 * @returns assistant message.
 */
export const getConversation = async (message: Conversation) => {
  const response = await fetch("/api/conversation", {
    method: "POST",
    body: JSON.stringify(message),
  });

  const body = await response.json();

  return body.toString();
};
