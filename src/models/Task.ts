import { Schema, models, model } from "mongoose";

const TaskSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    day: { type: String, required: true, match: /^\d{4}-\d{2}-\d{2}$/ },
    text: { type: String, required: true, trim: true, maxlength: 200 },
    status: { type: String, enum: ["todo", "doing", "done"], default: "todo" },
    due: { type: String, default: "", match: /^(\d{4}-\d{2}-\d{2})?$/ },
    note: { type: String, default: "", maxlength: 2000 },
    // id foto di koleksi Image; hanya diubah lewat /api/images
    images: [{ type: Schema.Types.ObjectId, ref: "Image" }],
    // warna case note per task (opsional, untuk panel Style nanti)
    color: { type: String, default: "", match: /^(#[0-9a-fA-F]{6})?$/ },
  },
  { timestamps: true }
);

// Query utama: task milik user per hari
TaskSchema.index({ userId: 1, day: 1 });

export default models.Task || model("Task", TaskSchema);