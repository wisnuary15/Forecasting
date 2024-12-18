import { Request, Response } from 'express';
import { HoltWintersService } from '../services/holtwinters';
import { ExcelParser } from '../utils/excelParser';
import { VisitorData } from '../models/VisitorData';
import { DataPoint } from '../types/forecast';

export class ForecastController {
  // Existing forecast method
  static forecast = async (req: Request, res: Response): Promise<void> => {
    try {
      const { alpha, beta, gamma } = req.body;
      const rawData = await VisitorData.find().sort({ tahun: 1, bulan: 1 });
      
      // Transform MongoDB documents to DataPoint format
      const data: DataPoint[] = rawData.map(doc => ({
        bulan: doc.bulan || 0,
        tahun: doc.tahun || 0,
        jumlahPengunjung: doc.jumlahPengunjung || 0
      }));

      // Validate data
      if (data.length === 0) {
        res.status(400).json({ error: 'No data available for forecast' });
        return;
      }

      const hwService = new HoltWintersService(
        Number(alpha),
        Number(beta),
        Number(gamma)
      );

      const result = hwService.forecast(data);
      res.json(result);
    } catch (error) {
      res.status(500).json({ 
        error: error instanceof Error ? error.message : 'Error processing forecast'
      });
    }
  };

  // Add data from Excel file
  static uploadData = async (req: Request, res: Response): Promise<void> => {
    try {
      const file = req.file;
      if (!file) {
        res.status(400).json({ error: 'No file uploaded' });
        return;
      }

      const parsedData = ExcelParser.parseFullData(file.buffer);
      const savedData = await VisitorData.insertMany(parsedData);
      res.status(201).json(savedData);
    } catch (error) {
      res.status(500).json({
        error: error instanceof Error ? error.message : 'Error uploading data'
      });
    }
  };

  // Get all data
  static getAllData = async (req: Request, res: Response): Promise<void> => {
    try {
      const data = await VisitorData.find().sort({ tahun: 1, bulan: 1 });
      res.json(data);
    } catch (error) {
      res.status(500).json({
        error: error instanceof Error ? error.message : 'Error fetching data'
      });
    }
  };

  // Update data
  static updateData = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const updatedData = await VisitorData.findByIdAndUpdate(
        id,
        req.body,
        { new: true, runValidators: true }
      );

      if (!updatedData) {
        res.status(404).json({ error: 'Data not found' });
        return;
      }

      res.json(updatedData);
    } catch (error) {
      res.status(500).json({
        error: error instanceof Error ? error.message : 'Error updating data'
      });
    }
  };

  // Delete data
  static deleteData = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const deletedData = await VisitorData.findByIdAndDelete(id);

      if (!deletedData) {
        res.status(404).json({ error: 'Data not found' });
        return;
      }

      res.status(204).send();
    } catch (error) {
      res.status(500).json({
        error: error instanceof Error ? error.message : 'Error deleting data'
      });
    }
  };

  // Create new data
  static createData = async (req: Request, res: Response): Promise<void> => {
    try {
      const { bulan, tahun, jumlahPengunjung } = req.body;

      // Validate required fields
      if (!bulan || !tahun || !jumlahPengunjung) {
        res.status(400).json({ 
          error: 'Missing required fields: bulan, tahun, jumlahPengunjung' 
        });
        return;
      }

      // Create new data
      const newData = new VisitorData({
        bulan,
        tahun,
        jumlahPengunjung
      });

      // Save to database
      const savedData = await newData.save();
      res.status(201).json(savedData);

    } catch (error) {
      res.status(500).json({
        error: error instanceof Error ? error.message : 'Error creating data'
      });
    }
  };
}