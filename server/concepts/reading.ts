import { ObjectId } from "mongodb";
import DocCollection, { BaseDoc } from "../framework/doc";
import { NotFoundError } from "./errors";

// Interface representing a document for reading elements with labels
export interface ReadingDoc extends BaseDoc {
  elementId: string;
  label: string;
  postId: ObjectId;
}

/**
 * concept: Reading
 * Purpose: To ensure that all content, including messaging, alt-text, and posts,
 * is optimized for screen readers and accessible to visually impaired users.
 */
export default class ReadingConcept {
  public readonly content: DocCollection<ReadingDoc>;

  /**
   * Make an instance of Reading.
   * @param collectionName - The name of the collection in the database
   */
  constructor(collectionName: string) {
    this.content = new DocCollection<ReadingDoc>(collectionName);

    // Ensure indexes are created for performance
    void this.content.collection.createIndex({ elementId: 1 });
    void this.content.collection.createIndex({ postId: 1 });
  }

  // Labeling an element with accessible descriptions for screen readers
  async labelElement(elementId: string, label: string) {
    const existingElement = await this.content.readOne({ elementId });
    if (existingElement) {
      await this.content.partialUpdateOne({ elementId }, { label });
      return { msg: "Element label updated successfully!" };
    } else {
      await this.content.createOne({ elementId, label, postId: new ObjectId() });
      return { msg: "Element labeled successfully!" };
    }
  }

  // Get the label of an element
  async getLabel(user: ObjectId, elementId: string) {
    const element = await this.content.readOne({ elementId });
    if (!element) {
      throw new NotFoundError("Element not found!");
    }
    return { user, label: element.label };
  }

  // Remove a label from an element
  async removeLabel(user: ObjectId, elementId: string) {
    const element = await this.content.readOne({ elementId });
    if (!element) {
      throw new NotFoundError("Element not found!");
    }
    await this.content.partialUpdateOne({ elementId }, { label: "" });
    return { msg: "Label removed successfully!" };
  }
}