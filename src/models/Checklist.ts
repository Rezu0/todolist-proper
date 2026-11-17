import { Schema, models, model } from "mongoose";

const ChecklistSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    title: { type: String, required: true, trim: true, maxlength: 80 },
    items: [{ text: { type: String, required: true, trim: true, maxlength: 200 } }], // tiap item otomatis punya _id
  },
  { timestamps: true }
);

export default models.Checklist || model("Checklist", ChecklistSchema);

// Checklist yang "ditampilkan" di satu hari; centangnya disimpan per hari
const ShowSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    listId: { type: Schema.Types.ObjectId, ref: "Checklist", required: true },
    day: { type: String, required: true, match: /^\d{4}-\d{2}-\d{2}$/ },
    checked: [{ type: String }], // id item yang sudah dicentang
  },
  { timestamps: true }
);
ShowSchema.index({ userId: 1, listId: 1, day: 1 }, { unique: true });

export const ChecklistShow = models.ChecklistShow || model("ChecklistShow", ShowSchema);