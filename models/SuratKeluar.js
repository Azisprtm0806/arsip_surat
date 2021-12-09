const mongoose = require("mongoose");

const suratKeluar = new mongoose.Schema({
  tanggal: {
    type: Date,
    required: true,
  },
  nomerSurat: {
    type: String,
    required: true,
  },
  tujuan: {
    type: String,
    required: true,
  },
  perihal: {
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
});

module.exports = mongoose.model("SuratKeluar", suratKeluar);
