const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config();
const User = require('./models/User');

(async () => {
   await mongoose.connect(process.env.MONGO_URI);
   const user = await User.findOne({ email: 'rahul@test.com' }).select('+password');
   console.log("User:", user);
   const isMatch = await user.matchPassword('faculty123');
   console.log("Password match:", isMatch);
   process.exit(0);
})();
