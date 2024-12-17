export type Conversation = {
  message: string;
  history: {
    role: "user" | "assistant";
    message: string;
  }[];
};
