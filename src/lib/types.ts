export type Status = "todo" | "doing" | "done";

export interface Task {
  id: string;
  day: string; // YYYY-MM-DD
  text: string;
  status: Status;
  due: string; // YYYY-MM-DD atau ""
  note: string;
  created: number;
}

export interface Reminder {
  id: string;
  text: string;
  time: string; // HH:MM atau ""
  done: string[]; // daftar tanggal YYYY-MM-DD yang sudah dicentang
}
