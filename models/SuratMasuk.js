const mongoose = require("mongoose");
const { ObjectId } = mongoose.Schema;

const suratMasuk = new mongoose.Schema({
  noSurat: {
    type: String,
    required: true,
  },
  tglSurat: {
    type: Date,
    required: true,
  },
  tglTerima: {
    type: Date,
    required: true,
  },
  perihal: {
    type: String,
    required: true,
  },
  asalSurat: {
    type: String,
    required: true,
  },
  tujuan: {
    type: String,
    required: true,
  },
  keterangan: {
    type: String,
    required: true,
  },
  file: {
    type: String,
  },
  disposisiId: [
    {
      type: ObjectId,
      ref: "Disposisi",
    },
  ],
});

module.exports = mongoose.model("SuratMasuk", suratMasuk);
