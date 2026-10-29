import type { Reminder, Status, Task } from "./types";

export interface TaskDoc {
  _id: { toString(): string };
  day: string;
  text: string;
  status: Status;
  due?: string;
  note?: string;
  createdAt: Date;
}

export interface ReminderDoc {
  _id: { toString(): string };
  text: string;
  time?: string;
  done?: string[];
}

export function toTask(d: TaskDoc): Task {
  return {
    id: d._id.toString(),
    day: d.day,
    text: d.text,
    status: d.status,
    due: d.due ?? "",
    note: d.note ?? "",
    created: new Date(d.createdAt).getTime(),
  };
}

export function toReminder(d: ReminderDoc): Reminder {
  return { id: d._id.toString(), text: d.text, time: d.time ?? "", done: d.done ?? [] };
}
