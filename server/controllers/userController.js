const User = require('../models/userModel');



exports.getUsers = async (req, res) => {
  try {
    const [rows] = await User.getAll();
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}; 

exports.createUser = async (req, res) => {
  const { name, email } = req.body;
  try {
    const [result] = await User.create(name, email);
    res.json({ id: result.insertId, name, email });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
