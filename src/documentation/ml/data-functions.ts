import { FilterType } from "./training-data";

export const Filters = {
  MAX: "max",
  MEAN: "mean",
  MIN: "min",
  STD: "std",
  PEAKS: "peaks",
  ACC: "acc",
  ZCR: "zcr",
  RMS: "rms",
} as const;

export function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

interface FilterStrategy {
  computeOutput(data: number[]): number;
}

class MeanFilter implements FilterStrategy {
  computeOutput(data: number[]): number {
    return data.reduce((a, b) => a + b) / data.length;
  }
}

class SDFilter implements FilterStrategy {
  computeOutput(data: number[]): number {
    const mean = data.reduce((a, b) => a + b) / data.length;
    return Math.sqrt(
      data.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / data.length
    );
  }
}

class RootMeanSquareFilter implements FilterStrategy {
  computeOutput(data: number[]): number {
    const res = Math.sqrt(
      data.reduce((a, b) => a + Math.pow(b, 2), 0) / data.length
    );
    return res;
  }
}

class ZeroCrossingRateFilter implements FilterStrategy {
  computeOutput(data: number[]): number {
    let count = 0;
    for (let i = 1; i < data.length; i++) {
      if (
        (data[i] >= 0 && data[i - 1] < 0) ||
        (data[i] < 0 && data[i - 1] >= 0)
      ) {
        count++;
      }
    }
    return count / (data.length - 1);
  }
}

class TotalAccFilter implements FilterStrategy {
  computeOutput(data: number[]): number {
    return data.reduce((a, b) => a + Math.abs(b));
  }
}

class MaxFilter implements FilterStrategy {
  computeOutput(data: number[]): number {
    return Math.max(...data);
  }
}

class MinFilter implements FilterStrategy {
  computeOutput(data: number[]): number {
    return Math.min(...data);
  }
}

class PeaksFilter implements FilterStrategy {
  computeOutput(data: number[]): number {
    const lag = 5;
    const threshold = 3.5;
    const influence = 0.5;

    let peaksCounter = 0;

    if (data.length < lag + 2) {
      throw new Error("data sample is too short");
    }

    // init variables
    const signals = Array(data.length).fill(0) as number[];
    const filteredY = data.slice(0);
    const lead_in = data.slice(0, lag);

    const avgFilter: number[] = [];
    avgFilter[lag - 1] = mean(lead_in);
    const stdFilter: number[] = [];
    stdFilter[lag - 1] = stddev(lead_in);

    for (let i = lag; i < data.length; i++) {
      if (
        Math.abs(data[i] - avgFilter[i - 1]) > 0.1 &&
        Math.abs(data[i] - avgFilter[i - 1]) > threshold * stdFilter[i - 1]
      ) {
        if (data[i] > avgFilter[i - 1]) {
          signals[i] = +1; // positive signal
          if (i - 1 > 0 && signals[i - 1] == 0) {
            peaksCounter++;
          }
        } else {
          signals[i] = -1; // negative signal
        }
        // make influence lower
        filteredY[i] = influence * data[i] + (1 - influence) * filteredY[i - 1];
      } else {
        signals[i] = 0; // no signal
        filteredY[i] = data[i];
      }

      // adjust the filters
      const y_lag = filteredY.slice(i - lag, i);
      avgFilter[i] = mean(y_lag);
      stdFilter[i] = stddev(y_lag);
    }
    return peaksCounter;
  }
}

function mean(a: number[]): number {
  return a.reduce((acc, val) => acc + val) / a.length;
}

function stddev(arr: number[]): number {
  const arr_mean = mean(arr);
  const r = function (acc: number, val: number) {
    return acc + (val - arr_mean) * (val - arr_mean);
  };
  return Math.sqrt(arr.reduce(r, 0.0) / arr.length);
}

export function determineFilter(filter: FilterType): FilterStrategy {
  switch (filter) {
    case Filters.MAX:
      return new MaxFilter();
    case Filters.MIN:
      return new MinFilter();
    case Filters.STD:
      return new SDFilter();
    case Filters.PEAKS:
      return new PeaksFilter();
    case Filters.ACC:
      return new TotalAccFilter();
    case Filters.MEAN:
      return new MeanFilter();
    case Filters.ZCR:
      return new ZeroCrossingRateFilter();
    case Filters.RMS:
      return new RootMeanSquareFilter();
    default:
      throw new Error("Filter not found");
  }
}
