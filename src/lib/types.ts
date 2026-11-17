export type Status = "todo" | "doing" | "done";

export interface Task {
  id: string;
  text: string;
  status: Status;
  due: string;
  note: string;
  day: string;
  created: number;
  color: string;
  images: string[];
}

export interface Reminder {
  id: string;
  text: string;
  time: string; // HH:MM atau ""
  done: string[]; // daftar tanggal YYYY-MM-DD yang sudah dicentang
}
