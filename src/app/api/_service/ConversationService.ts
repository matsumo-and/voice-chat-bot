import { inject, injectable } from "inversify";
import type { IConversationRepository } from "../_repository/ConversationRepository";
import { Conversation } from "../_model/Conversation";

/**
 * ConversationService.
 */
export interface IConversationService {
  /**
   * create conversation.
   *
   * @param conversation
   * @return text.
   */
  generateResponse: (conversation: Conversation) => Promise<string>;
}

/**
 * ConversationService.
 */
@injectable()
export class ConversationService implements IConversationService {
  /**
   *
   * @param repository
   */
  public constructor(
    @inject("IConversationRepository")
    private repository: IConversationRepository
  ) {}

  public generateResponse = async (conversation: Conversation) => {
    const text = await this.repository.generateResponse(conversation);

    if (!text) {
      throw Error("Could not generate response.");
    }

    return text;
  };
}
