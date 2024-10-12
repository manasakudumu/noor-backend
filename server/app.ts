import AlertingConcept from "./concepts/alerting";
import AuthenticatingConcept from "./concepts/authenticating";
import FriendingConcept from "./concepts/friending";
import MessagingConcept from "./concepts/messaging";
import MonitoringConcept from "./concepts/monitoring";
import PostingConcept from "./concepts/posting";
import ReadingConcept from "./concepts/reading";
import SessioningConcept from "./concepts/sessioning";

// The app is a composition of concepts instantiated here
// and synchronized together in `routes.ts`.
export const Sessioning = new SessioningConcept();
export const Authing = new AuthenticatingConcept("users");
export const Posting = new PostingConcept("posts");
export const Friending = new FriendingConcept("friends");
export const Alerting = new AlertingConcept("alerts");
export const Monitoring = new MonitoringConcept("monitors");
export const Messaging = new MessagingConcept("messaging");
export const Reading = new ReadingConcept("reading");