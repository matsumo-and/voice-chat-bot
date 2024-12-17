import { inject, injectable } from "inversify";
import { NextRequest, NextResponse } from "next/server";
import type { IConversationService } from "../_service/ConversationService";
import { z } from "zod";

/**
 * interface for ConversationController.
 */
export interface IConversationController {
  /**
   * create conversation.
   *
   * @param request request.
   * @return http response.
   */
  create: (request: NextRequest) => Promise<NextResponse>;
}

/**
 * ConversationController.
 */
@injectable()
export class ConversationController implements IConversationController {
  /**
   * ConversationRequestSchema
   */
  private ConversationRequestSchema = z.object({
    message: z.string(),
    history: z.array(
      z.object({
        role: z.enum(["user", "assistant"]),
        message: z.string(),
      })
    ),
  });

  /**
   * constructor.
   *
   * @param service ConversationService.
   */
  public constructor(
    @inject("IConversationService")
    private service: IConversationService
  ) {}

  /** @inheritdoc */
  public create = async (request: NextRequest) => {
    if (request.body == null) {
      return NextResponse.json({ error: "BAD REQUEST" }, { status: 400 });
    }

    try {
      const json = await request.json();
      const conversations = this.ConversationRequestSchema.parse(json);

      // fetch response message.
      const message: string = await this.service.generateResponse({
        history: conversations.history.map((conversation) => {
          return {
            role: conversation.role,
            message: conversation.message,
          };
        }),
        message: conversations.message,
      });

      return new NextResponse(JSON.stringify(message), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    } catch (error) {
      // parse error.
      if (error instanceof z.ZodError) {
        return NextResponse.json({ error: "BAD REQUEST" }, { status: 400 });
      }

      console.log(error);

      // unexpected error.
      return NextResponse.json(
        { error: "INTERNAL SERVER ERROR. cause: " + error },
        { status: 500 }
      );
    }
  };
}
