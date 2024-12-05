import { Conversation } from "@/app/api/conversation/route";

export const conversation = async (message: Conversation) => {
  const response = await fetch("/api/conversation", {
    method: "POST",
    body: JSON.stringify(message),
  });

  const body = await response.json();

  console.log(body.toString());
  return body.toString();
};
