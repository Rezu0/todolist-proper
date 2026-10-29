import { Schema, models, model } from "mongoose";

const TaskSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    day: { type: String, required: true, match: /^\d{4}-\d{2}-\d{2}$/ },
    text: { type: String, required: true, trim: true, maxlength: 200 },
    status: { type: String, enum: ["todo", "doing", "done"], default: "todo" },
    due: { type: String, default: "", match: /^(\d{4}-\d{2}-\d{2})?$/ },
    note: { type: String, default: "", maxlength: 2000 },
  },
  { timestamps: true }
);

export default models.Task || model("Task", TaskSchema);
