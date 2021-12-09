const mongoose = require("mongoose");
const { ObjectId } = mongoose.Schema;

const disposisi = new mongoose.Schema({
  tujuan: {
    type: String,
    required: true,
  },
  sifat: {
    type: String,
    required: true,
  },
  batasWaktu: {
    type: Date,
    required: true,
  },
  masukId: [
    {
      type: ObjectId,
      ref: "SuratMasuk",
    },
  ],
});

module.exports = mongoose.model("Disposisi", disposisi);
