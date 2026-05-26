import Settings from '../models/Settings.js';

// @desc    Get setting by key
// @route   GET /api/settings/:key
// @access  Public
export const getSetting = async (req, res) => {
  const { key } = req.params;

  try {
    const setting = await Settings.findOne({ key });
    if (setting) {
      res.json(setting);
    } else {
      res.status(404).json({ message: `Setting not found for key: ${key}` });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update setting key-value
// @route   PUT /api/settings/:key
// @access  Private/Admin
export const updateSetting = async (req, res) => {
  const { key } = req.params;
  const { value } = req.body;

  if (value === undefined) {
    return res.status(400).json({ message: 'Please provide setting value' });
  }

  try {
    let setting = await Settings.findOne({ key });

    if (setting) {
      setting.value = value;
      setting = await setting.save();
    } else {
      setting = await Settings.create({ key, value });
    }

    res.json(setting);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};
