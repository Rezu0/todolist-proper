export interface ListItem {
  id: string;
  text: string;
}
export interface Checklist {
  id: string;
  title: string;
  items: ListItem[];
}
export interface Show {
  id: string;
  list: string; // id checklist
  day: string; // YYYY-MM-DD
  checked: string[]; // id item yang dicentang
}

export interface ListDoc {
  _id: { toString(): string };
  title: string;
  items?: { _id: { toString(): string }; text: string }[];
}
export interface ShowDoc {
  _id: { toString(): string };
  listId: { toString(): string };
  day: string;
  checked?: string[];
}

export const toList = (d: ListDoc): Checklist => ({
  id: d._id.toString(),
  title: d.title,
  items: (d.items ?? []).map((i) => ({ id: i._id.toString(), text: i.text })),
});

export const toShow = (d: ShowDoc): Show => ({
  id: d._id.toString(),
  list: d.listId.toString(),
  day: d.day,
  checked: d.checked ?? [],
});