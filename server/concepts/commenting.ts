import { ObjectId } from "mongodb";
import DocCollection, { BaseDoc } from "../framework/doc";
import { NotFoundError } from "./errors";

export interface CommentDoc extends BaseDoc {
  author: ObjectId;
  content: string;
  itemId: ObjectId;
  repliedTo?: ObjectId;
}

/**
 * concept: Commenting
 */
export default class CommentingConcept {
  public readonly comments: DocCollection<CommentDoc>;

  /**
   * Make an instance of Commenting.
   */
  constructor(collectionName: string) {
    this.comments = new DocCollection<CommentDoc>(collectionName);
  }

  async createComment(author: ObjectId, content: string, itemId: ObjectId, repliedTo?: ObjectId) {
    const _id = await this.comments.createOne({ author, content, itemId, repliedTo });
    return { msg: "Comment created successfully!", comment: await this.comments.readOne({ _id }) };
  }

  async getCommentsForItem(itemId: ObjectId) {
    return await this.comments.readMany({ itemId });
  }

  async getReplies(commentId: ObjectId) {
    return await this.comments.readMany({ repliedTo: commentId });
  }

  async deleteComment(commentId: ObjectId) {
    await this.comments.deleteOne({ _id: commentId });
    return { msg: "Comment deleted successfully!" };
  }

  async assertCommentExists(commentId: ObjectId) {
    const comment = await this.comments.readOne({ _id: commentId });
    if (!comment) {
      throw new NotFoundError("Comment not found!");
    }
  }
}