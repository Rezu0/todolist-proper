import { Schema, models, model } from "mongoose";

const ReminderSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    text: { type: String, required: true, trim: true, maxlength: 120 },
    time: { type: String, default: "", match: /^(\d{2}:\d{2})?$/ },
    done: [{ type: String, match: /^\d{4}-\d{2}-\d{2}$/ }],
  },
  { timestamps: true }
);

export default models.Reminder || model("Reminder", ReminderSchema);
