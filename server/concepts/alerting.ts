import { ObjectId } from "mongodb";
import DocCollection, { BaseDoc } from "../framework/doc";
import { NotAllowedError, NotFoundError } from "./errors";

export interface AlertDoc extends BaseDoc {
  userId: ObjectId;
  location: string;
  status: boolean; // true means alert is active, false means it's not
}

/**
 * concept: Alerting [User]
 */
export default class AlertingConcept {
  public readonly alerts: DocCollection<AlertDoc>;

  constructor(collectionName: string) {
    this.alerts = new DocCollection<AlertDoc>(collectionName + "_alerts");
  }

  // Activate emergency alert
  async activateEmergencyAlert(userId: ObjectId, location: string) {
    const existingAlert = await this.alerts.readOne({ userId });
    if (existingAlert && existingAlert.status) {
      throw new NotAllowedError("Emergency alert already active for this user.");
    }
    await this.alerts.createOne({ userId, location, status: true });
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

  // Update location during active alert
  async updateLocation(userId: ObjectId, newLocation: string) {
    const alert = await this.alerts.readOne({ userId });
    if (!alert || !alert.status) {
      throw new NotAllowedError("No active alert to update location.");
    }
    await this.alerts.partialUpdateOne({ userId }, { location: newLocation });
    return { msg: "Location updated successfully!" };
  }
}