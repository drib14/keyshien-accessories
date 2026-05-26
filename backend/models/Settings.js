import mongoose from 'mongoose';

const SettingsSchema = new mongoose.Schema(
  {
    key: {
      type: String,
      required: [true, 'Please enter setting key'],
      unique: true,
      trim: true,
    },
    value: {
      type: mongoose.Schema.Types.Mixed,
      required: [true, 'Please enter setting value'],
    },
  },
  { timestamps: true }
);

const Settings = mongoose.model('Settings', SettingsSchema);
export default Settings;
