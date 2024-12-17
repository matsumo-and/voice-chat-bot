import { inject, injectable } from "inversify";
import { Conversation } from "../_model/Conversation";
import {
  BedrockRuntimeClient,
  ConverseCommand,
  ConverseCommandOutput,
  Message,
} from "@aws-sdk/client-bedrock-runtime";

/**
 * ConversationRepository.
 */
export interface IConversationRepository {
  /**
   * create conversation.
   *
   * @param text input text.
   * @return return text.
   */
  generateResponse: (conversation: Conversation) => Promise<string | undefined>;
}

/**
 * ConversationService.
 */
@injectable()
export class ConversationRepository implements IConversationRepository {
  /** system prompt. */
  private notification: string = `
あなたは英語の教師です。以下の条件や推奨事項、過去の履歴を元に新たな会話文を返却してください。
### 条件
下記の条件は必ず守ってください。
・必ず英語で回答すること。守らない場合はペナルティ対象です。
・長文での解答はNGです。守らない場合はペナルティを与えます。
・会話を終わらせるような返答をしてはいけません。守らない場合はペナルティ対象です。

### 推奨
下記は推奨される振る舞いです。良い振る舞いの場合は報酬を与えます。
・文法やミスが疑われる場合は指摘をしてください。
・円滑な会話となるようにカジュアルな英語を使ってください。
  `;

  /**
   * contructor.
   */
  public constructor() {}

  public generateResponse = async (conversation: Conversation) => {
    // init Client.
    const client = new BedrockRuntimeClient({});

    let messages: Message[] = [];

    if (conversation.history.length > 0) {
      // add history
      messages = messages.concat(
        conversation.history.map((history) => {
          const result: Message = {
            role: history.role,
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

    const command = new ConverseCommand({
      modelId: "anthropic.claude-3-haiku-20240307-v1:0",
      messages: messages,
      system: [
        {
          text: this.notification,
        },
      ],
      inferenceConfig: {
        maxTokens: 64,
        temperature: 0.5,
        topP: 0.9,
      },
    });

    const response: ConverseCommandOutput = await client.send(command);

    const responseText: string | undefined =
      response.output?.message?.content?.at(0)?.text;

    return responseText;
  };
}
