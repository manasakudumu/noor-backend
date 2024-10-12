import { ObjectId } from "mongodb";
import DocCollection, { BaseDoc } from "../framework/doc";
import { NotAllowedError, NotFoundError } from "./errors";

export interface AlertDoc extends BaseDoc {
  userId: ObjectId;
  status: boolean; 
  street: string;
  city: string;
  state: string;
  zipcode: string;
  latitude: number;
  longitude: number;
  trustedContacts: ObjectId[]; // Array of contact IDs to notify
}

/**
 * concept: Alerting [User]
 */
export default class AlertingConcept {
  public readonly alerts: DocCollection<AlertDoc>;

  constructor(collectionName: string) {
    this.alerts = new DocCollection<AlertDoc>(collectionName + "_alerts");
  }

  // Create a new location for a user
  async create(
    userId: ObjectId,
    street: string, 
    city: string, 
    state: string, 
    zipcode: string, 
    latitude: number, 
    longitude: number, 
    trustedContacts: ObjectId[] // Pass in trusted contacts
  ) {
    const _id = await this.alerts.createOne({
      userId, 
      street, 
      city, 
      state, 
      zipcode, 
      latitude, 
      longitude, 
      status: false, // Initially false until emergency is activated
      trustedContacts
    });
    return { msg: `New location for user created and geo-tagged at (${latitude}, ${longitude})`, location: await this.alerts.readOne({ _id }) };
  }

  // Get all locations 
  async getLocations() {
    return await this.alerts.readMany({}, { sort: { _id: -1 } });
  }

  // Activate emergency alert and notify trusted contacts
  async activateEmergencyAlert(userId: ObjectId) {
    const existingAlert = await this.alerts.readOne({ userId });
    if (!existingAlert) {
      throw new NotFoundError("No location data found for this user. Cannot activate emergency alert.");
    }
    if (existingAlert.status) {
      throw new NotAllowedError("Emergency alert already active for this user.");
    }
    await this.alerts.partialUpdateOne({ userId }, { status: true });
    await this.notifyTrustedContacts(existingAlert.trustedContacts, userId, existingAlert);
    return { msg: "Emergency alert activated!" };
  }

  // Deactivate emergency alert
  async deactivateEmergencyAlert(userId: ObjectId) {
    const alert = await this.alerts.readOne({ userId });
    if (!alert || !alert.status) {
      throw new NotFoundError("No active emergency alert found for this user.");
    }
    await this.alerts.partialUpdateOne({ userId }, { status: false });
    return { msg: "Emergency alert deactivated!" };
  }

  // Notify trusted contacts about the emergency
  async notifyTrustedContacts(contactIds: ObjectId[], userId: ObjectId, alertData: AlertDoc) {
    for (const contactId of contactIds) {
      console.log(
        `Notifying contact ${contactId} about emergency for user ${userId}. Location: ${alertData.street}, ${alertData.city}, ${alertData.state}`
      );
    }
  }

  async assertLocationExists(_id: ObjectId) {
    const location = await this.alerts.readOne({ _id });
    if (!location) {
      throw new NotFoundError(`Location with id ${_id} does not exist!`);
    }
  }
}