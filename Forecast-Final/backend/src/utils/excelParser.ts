import * as XLSX from 'xlsx';
import { DataPoint } from '../types/forecast';

// Interface for raw Excel data
interface RawExcelData {
  'Bulan': number;
  'Tahun': number;
  'Jumlah Pengunjung (Domestik)': number;
  'Jumlah Pendapatan (Rp)': number;
}

// Interface for processed data
interface VisitorData {
  bulan: number;
  tahun: number;
  jumlahPengunjung: number;
  jumlahPendapatan: number;
}

export class ExcelParser {
  static parseVisitorData(buffer: Buffer): DataPoint[] {
    const workbook = XLSX.read(buffer);
    const worksheet = workbook.Sheets[workbook.SheetNames[0]];
    const rawData = XLSX.utils.sheet_to_json(worksheet);

    return rawData.map((row: any) => ({
      bulan: Number(row['Bulan']),
      tahun: Number(row['Tahun']),
      jumlahPengunjung: Number(row['Jumlah Pengunjung (Domestik)'])
    }));
  }

  static parseFullData(buffer: Buffer): VisitorData[] {
    const workbook = XLSX.read(buffer);
    const worksheet = workbook.Sheets[workbook.SheetNames[0]];
    const rawData = XLSX.utils.sheet_to_json(worksheet) as RawExcelData[];
    
    return rawData.map(row => ({
      bulan: Number(row['Bulan']),
      tahun: Number(row['Tahun']),
      jumlahPengunjung: Number(row['Jumlah Pengunjung (Domestik)']),
      jumlahPendapatan: Number(row['Jumlah Pendapatan (Rp)'])
    }));
  }
}