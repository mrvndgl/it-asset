require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');

mongoose.connect(process.env.MONGO_URI, { dbName: 'asset-buddy' })
  .then(async () => {
    const user = await User.findOne({ employeeId: 'IT001' });
    user.password = 'Admin@123';
    await user.save();
    console.log('Password reset successfully!');
    process.exit();
  })