require('dotenv').config();
const mongoose = require('mongoose');
const MONGODB_URI = process.env.MONGODB_URI;

mongoose.connect(MONGODB_URI)
  .then(async () => {
    const stylistSchema = new mongoose.Schema({}, { strict: false });
    const Stylist = mongoose.model('stylist', stylistSchema);
    const stylists = await Stylist.find({ name: /Trần Ngọc Anh/i });
    console.log(JSON.stringify(stylists, null, 2));
    process.exit(0);
  })
  .catch(err => {
    console.error(err);
    process.exit(1);
  });
