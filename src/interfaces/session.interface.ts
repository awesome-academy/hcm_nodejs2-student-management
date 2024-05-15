import { SessionData } from "express-session";

export interface CustomSessionData extends SessionData {
  user?: { id: number; name: string; role: string, roleKey: string };
}
