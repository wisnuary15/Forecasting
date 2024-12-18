import mongoose from 'mongoose';

const visitorDataSchema = new mongoose.Schema({
  bulan: Number,
  tahun: Number,
  jumlahPengunjung: Number,
  jumlahPendapatan: Number,
  createdAt: {
    type: Date,
    default: Date.now
  }
});

export const VisitorData = mongoose.model('VisitorData', visitorDataSchema);