import { ObjectId } from "mongodb";
import DocCollection, { BaseDoc } from "../framework/doc";
import { NotFoundError } from "./errors";

export interface MessageDoc extends BaseDoc {
  from: ObjectId; // Sender's User ID
  to: ObjectId;   // Receiver's User ID
  content: string;
  time: Date;
}

/**
 * concept: Messaging [User]
 */
export default class MessagingConcept {
  public readonly messages: DocCollection<MessageDoc>;

  /**
   * Make an instance of Messaging.
   */
  constructor(collectionName: string) {
    this.messages = new DocCollection<MessageDoc>(collectionName);
  }

  // Action: Send a message from one user to another
  async sendMessage(sender: ObjectId, receiver: ObjectId, content: string) {
    const message = {
      from: sender,
      to: receiver,
      content,
      time: new Date(),
    };
    const _id = await this.messages.createOne(message);
    return { msg: "Message sent successfully!", message: await this.messages.readOne({ _id }) };
  }

  // Action: Retrieve all messages for a user (both sent and received)
  async getMessages(userId: ObjectId) {
    const messages = await this.messages.readMany({
      $or: [{ from: userId }, { to: userId }],
    });

    if (messages.length === 0) {
      throw new NotFoundError(`No messages found for user.`);
    }

    return messages;
  }

  // Optional: Get messages between two users (specific conversation)
  async getConversation(user1: ObjectId, user2: ObjectId) {
    const messages = await this.messages.readMany({
      $or: [
        { from: user1, to: user2 },
        { from: user2, to: user1 },
      ],
    });

    if (messages.length === 0) {
      throw new NotFoundError(`No messages found between these users.`);
    }

    return messages;
  }

  // Action: Delete a message by its ID
  async deleteMessage(messageId: ObjectId) {
    await this.messages.deleteOne({ _id: messageId });
    return { msg: "Message deleted successfully!" };
  }
}