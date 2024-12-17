import "reflect-metadata";
import { Container } from "inversify";
import {
  ConversationController,
  IConversationController,
} from "@/app/api/_controller/ConversationController";

import {
  ConversationService,
  IConversationService,
} from "../_service/ConversationService";
import {
  IConversationRepository,
  ConversationRepository,
} from "../_repository/ConversationRepository";

const container = new Container();

// Controller.
container
  .bind<IConversationController>("IConversationController")
  .to(ConversationController);

// Service.
container
  .bind<IConversationService>("IConversationService")
  .to(ConversationService);

// Repository.
container
  .bind<IConversationRepository>("IConversationRepository")
  .to(ConversationRepository);

export { container };
