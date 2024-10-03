import { ObjectId } from "mongodb";
import DocCollection, { BaseDoc } from "../framework/doc";
import { NotAllowedError, NotFoundError } from "./errors";

export interface CheckInScheduleDoc extends BaseDoc {
  userId: ObjectId;
  schedule: Date;
}

export interface UserCheckInStatusDoc extends BaseDoc {
  userId: ObjectId;
  status: boolean;
}

/**
 * concept: Monitoring [User]
 */
export default class MonitoringConcept {
  public readonly checkInSchedules: DocCollection<CheckInScheduleDoc>;
  public readonly checkInStatus: DocCollection<UserCheckInStatusDoc>;

  constructor(collectionName: string) {
    this.checkInSchedules = new DocCollection<CheckInScheduleDoc>(collectionName + "_schedules");
    this.checkInStatus = new DocCollection<UserCheckInStatusDoc>(collectionName + "_status");
  }

  // Schedule a check-in for a user
  async scheduleCheckIn(userId: ObjectId, schedule: Date) {
    const existing = await this.checkInSchedules.readOne({ userId });
    if (existing !== null) {
      throw new NotAllowedError("User already has a scheduled check-in.");
    }
    await this.checkInSchedules.createOne({ userId, schedule });
    return { msg: "Check-in scheduled successfully!" };
  }

  // Record a check-in for a user
  async recordCheckIn(userId: ObjectId) {
    const checkIn = await this.checkInSchedules.readOne({ userId });
    if (!checkIn) {
      throw new NotFoundError("No check-in schedule found for user.");
    }
    await this.checkInStatus.createOne({ userId, status: true });
    return { msg: "User check-in recorded successfully!" };
  }

  // Get check-in status
  async getCheckInStatus(userId: ObjectId) {
    const status = await this.checkInStatus.readOne({ userId });
    if (!status) {
      throw new NotFoundError("No check-in status found for user.");
    }
    return status;
  }

  // Alert trusted contacts if no check-in was recorded
  async alertContacts(userId: ObjectId) {
    const status = await this.checkInStatus.readOne({ userId });
    if (!status || !status.status) {
      return { msg: "Alerting trusted contacts!" };
    }
    return { msg: "No alerts needed. User checked in successfully." };
  }
}
