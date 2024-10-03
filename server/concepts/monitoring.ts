import { ObjectId } from "mongodb";
import DocCollection, { BaseDoc } from "../framework/doc";
import { NotFoundError } from "./errors";

export interface MonitoringDoc extends BaseDoc {
  userId: ObjectId;
  checkInStatus: boolean;
  lastCheckIn: Date;
  trustedContacts: ObjectId[];
}

/**
 * concept: Monitoring
 */
export default class MonitoringConcept {
    public readonly monitoring: DocCollection<MonitoringDoc>;
  
    /**
     * Make an instance of Monitoring.
     */
    constructor(collectionName: string) {
      this.monitoring = new DocCollection<MonitoringDoc>(collectionName);
    }
  
    async createMonitoring(userId: ObjectId, trustedContacts: ObjectId[]) {
      const _id = await this.monitoring.createOne({ userId, checkInStatus: false, lastCheckIn: new Date(), trustedContacts });
      return { msg: "Monitoring setup created successfully!", monitoring: await this.monitoring.readOne({ _id }) };
    }
  
    async checkIn(userId: ObjectId) {
      const monitoring = await this.monitoring.readOne({ userId });
      if (!monitoring) {
        throw new NotFoundError("Monitoring setup not found!");
      }
  
      await this.monitoring.partialUpdateOne({ userId }, { checkInStatus: true, lastCheckIn: new Date() });
      return { msg: "User checked in successfully!" };
    }
  
    async getTrustedContacts(userId: ObjectId) {
      const monitoring = await this.monitoring.readOne({ userId });
      if (!monitoring) {
        throw new NotFoundError("Monitoring setup not found!");
      }
      return monitoring.trustedContacts;
    }
  
    async updateTrustedContacts(userId: ObjectId, contacts: ObjectId[]) {
      await this.monitoring.partialUpdateOne({ userId }, { trustedContacts: contacts });
      return { msg: "Trusted contacts updated successfully!" };
    }
  
    async deleteMonitoring(userId: ObjectId) {
      await this.monitoring.deleteOne({ userId });
      return { msg: "Monitoring setup deleted!" };
    }
  }