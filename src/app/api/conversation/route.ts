import { NextRequest } from "next/server";
import { container } from "../_config/inversify.config";
import { IConversationController } from "../_controller/ConversationController";

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
  const controller: IConversationController =
    container.get<IConversationController>("IConversationController");

  return await controller.create(req);
}
