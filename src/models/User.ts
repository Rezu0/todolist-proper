import { Schema, models, model } from "mongoose";

const UserSchema = new Schema(
  {
    name: { type: String, trim: true, default: "" },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    passwordHash: { type: String, required: true },
    // Pengaturan Style; divalidasi di API lewat normalizeSettings (lib/settings.ts)
    settings: { type: Schema.Types.Mixed, default: null },
  },
  { timestamps: true }
);

export default models.User || model("User", UserSchema);