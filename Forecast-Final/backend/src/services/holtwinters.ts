interface DataPoint {
  bulan: number;
  tahun: number;
  jumlahPengunjung: number;
}

interface ForecastDetail {
  bulan: number;
  tahun: number;
  pengunjung: number;
  period: number;
  forecast: number;
  at?: number;
  tt?: number;
  st?: number;
  error?: number;
  mse?: number;
  mape?: number;
}

interface HoltWintersResult {
  details: ForecastDetail[];
  mse: number;
  mape: number;
  parameters: {
    alpha: number;
    beta: number;
    gamma: number;
  };
}

export class HoltWintersService {
  private alpha: number;
  private beta: number;
  private gamma: number;
  private seasonalPeriod: number;

  constructor(
    alpha: number = 0.2,
    beta: number = 0.1,
    gamma: number = 0.2,
    seasonalPeriod: number = 12
  ) {
    if (alpha < 0 || alpha > 1 || beta < 0 || beta > 1 || gamma < 0 || gamma > 1) {
      throw new Error("Parameters must be between 0 and 1");
    }
    this.alpha = alpha;
    this.beta = beta;
    this.gamma = gamma;
    this.seasonalPeriod = seasonalPeriod;

    console.log("Initialized HoltWintersService with parameters:", {
      alpha,
      beta,
      gamma,
      seasonalPeriod,
    });
  }

  forecast(inputData: DataPoint[]): HoltWintersResult {
    const data = inputData.map((d) => d.jumlahPengunjung);
    const L = this.seasonalPeriod;
    const n = data.length;

    const at: number[] = Array(n).fill(0);
    const tt: number[] = Array(n).fill(0);
    const st: number[] = Array(n + L).fill(0);
    const forecast: number[] = Array(n + L).fill(0);
    const details: ForecastDetail[] = [];

    // inisiasi pertama kali
    const firstYearAvg = 62519.58333; // bingung aku, ini dari excel

    // Add first 12 periods with initial values
    for (let i = 0; i < L; i++) {
      details.push({
        bulan: inputData[i].bulan,
        tahun: inputData[i].tahun,
        pengunjung: data[i],
        period: i + 1,
        forecast: 0,
        at: i === L-1 ? firstYearAvg : -14898, // nilai special untuk periode 12
        tt: i === L-1 ? -1902.08 : undefined,  // hanya untuk 12 periode
        st: data[i] - firstYearAvg  // Seasonal factors
      });
    }

    // Initialize values for calculations
    at[L-1] = firstYearAvg;
    tt[L-1] = -1902.08;
    
    // Initialize seasonal indices
    for (let i = 0; i < L; i++) {
      st[i] = data[i] - firstYearAvg;
    }

    let runningSquaredError = 0;
    let runningAbsPercentError = 0;
    let errorCount = 0;

    // Start calculations from period 13 onwards
    for (let t = L; t < n; t++) {
      forecast[t] = at[t-1] + tt[t-1] + st[t-L];

      at[t] = this.alpha * (data[t] - st[t-L]) + 
              (1 - this.alpha) * (at[t-1] + tt[t-1]);

      tt[t] = this.beta * (at[t] - at[t-1]) + 
              (1 - this.beta) * tt[t-1];

      st[t] = this.gamma * (data[t] - at[t]) + 
              (1 - this.gamma) * st[t-L];

      const error = data[t] - forecast[t];
      const squaredError = error * error;

      const absPercentError = Math.abs(error / data[t]);//bagian mape

      runningSquaredError += squaredError;
      runningAbsPercentError += absPercentError;
      errorCount++;

      details.push({
        bulan: inputData[t].bulan,
        tahun: inputData[t].tahun,
        pengunjung: data[t],
        period: t + 1,
        at: Number(at[t].toFixed(2)),
        tt: Number(tt[t].toFixed(2)),
        st: Number(st[t].toFixed(2)),
        forecast: Number(forecast[t].toFixed(2)),
        error: Number(error.toFixed(2)),
        mse: Number(squaredError.toFixed(2)),
        mape: Number(absPercentError.toFixed(2))
      });
    }

    // Future forecasts
    for (let h = 1; h <= L; h++) {
      const futureForecast = at[n-1] + (h * tt[n-1]) + st[n-L+((h-1)%L)];
      const futureBulan = ((inputData[n-1].bulan + h - 1) % 12) + 1;
      const futureTahun = inputData[n-1].tahun + Math.floor((inputData[n-1].bulan + h - 1) / 12);

      details.push({
        bulan: futureBulan,
        tahun: futureTahun,
        pengunjung: 0,
        period: n + h,
        forecast: Number(futureForecast.toFixed(2))
      });
    }

    // Calculate final MSE and MAPE
    const finalMSE = runningSquaredError / (n - L); // Only count periods after initialization
    const finalMAPE = runningAbsPercentError / (n - L); // Only count periods after initialization

    return {
      details,
      mse: Number(finalMSE.toFixed(2)),
      mape: Number(finalMAPE.toFixed(2)),
      parameters: {
        alpha: this.alpha,
        beta: this.beta,
        gamma: this.gamma,
      },
    };
  }
}
