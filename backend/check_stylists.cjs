const mongoose = require('mongoose');
const MONGODB_URI = 'mongodb+srv://hiepnguyen:Tuanhiep123.@cluster0.xwpmk3k.mongodb.net/hdncare';

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
