import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface OHLCVData {
  date: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

interface IndicatorLabels {
  overallTrend: string;
  trendDuration: string;
  volumeBehavior: string;
  volatilityLevel: string;
  momentum: string;
  trendStrength: string;
  supportResistance: string;
  riskMode: string;
}

// Calculate Simple Moving Average
function calculateSMA(data: number[], period: number): number[] {
  const result: number[] = [];
  for (let i = 0; i < data.length; i++) {
    if (i < period - 1) {
      result.push(NaN);
    } else {
      const sum = data.slice(i - period + 1, i + 1).reduce((a, b) => a + b, 0);
      result.push(sum / period);
    }
  }
  return result;
}

// Calculate RSI
function calculateRSI(closes: number[], period: number = 14): number {
  if (closes.length < period + 1) return 50; // neutral if insufficient data
  
  const changes: number[] = [];
  for (let i = 1; i < closes.length; i++) {
    changes.push(closes[i] - closes[i - 1]);
  }
  
  const recentChanges = changes.slice(-period);
  let gains = 0;
  let losses = 0;
  
  for (const change of recentChanges) {
    if (change > 0) gains += change;
    else losses += Math.abs(change);
  }
  
  const avgGain = gains / period;
  const avgLoss = losses / period;
  
  if (avgLoss === 0) return 100;
  const rs = avgGain / avgLoss;
  return 100 - (100 / (1 + rs));
}

// Calculate ATR (Average True Range)
function calculateATR(data: OHLCVData[], period: number = 14): number[] {
  const trueRanges: number[] = [];
  
  for (let i = 1; i < data.length; i++) {
    const high = data[i].high;
    const low = data[i].low;
    const prevClose = data[i - 1].close;
    
    const tr = Math.max(
      high - low,
      Math.abs(high - prevClose),
      Math.abs(low - prevClose)
    );
    trueRanges.push(tr);
  }
  
  return calculateSMA(trueRanges, period);
}

// Determine trend based on moving average crossover
function determineTrend(closes: number[]): { trend: string; daysInTrend: number } {
  const sma50 = calculateSMA(closes, 50);
  const sma200 = calculateSMA(closes, 200);
  
  const currentSma50 = sma50[sma50.length - 1];
  const currentSma200 = sma200[sma200.length - 1];
  
  if (isNaN(currentSma50) || isNaN(currentSma200)) {
    return { trend: "Unknown", daysInTrend: 0 };
  }
  
  const isUptrend = currentSma50 > currentSma200;
  
  // Count days in current trend
  let daysInTrend = 0;
  for (let i = sma50.length - 1; i >= 0; i--) {
    if (isNaN(sma50[i]) || isNaN(sma200[i])) break;
    const wasUptrend = sma50[i] > sma200[i];
    if (wasUptrend === isUptrend) {
      daysInTrend++;
    } else {
      break;
    }
  }
  
  if (isUptrend) {
    return { trend: "Upward", daysInTrend };
  } else {
    return { trend: "Downward", daysInTrend };
  }
}

// Convert days to duration label
function getDurationLabel(days: number): string {
  if (days < 14) return "Early (< 2 weeks)";
  if (days < 28) return "Developing (2-4 weeks)";
  if (days < 60) return "Established (1-2 months)";
  if (days < 120) return "Mature (2-4 months)";
  return "Extended (4+ months)";
}

// Determine momentum from RSI
function determineMomentum(rsi: number): string {
  if (rsi > 70) return "Overbought";
  if (rsi > 60) return "Positive";
  if (rsi >= 40 && rsi <= 60) return "Slowing";
  if (rsi >= 30) return "Negative";
  return "Oversold";
}

// Determine volatility from ATR comparison
function determineVolatility(atr: number[], closes: number[]): string {
  if (atr.length < 30) return "Unknown";
  
  const currentATR = atr[atr.length - 1];
  const avgATR30 = atr.slice(-30).reduce((a, b) => a + b, 0) / 30;
  const currentPrice = closes[closes.length - 1];
  
  // Normalize ATR as percentage of price
  const atrPercent = (currentATR / currentPrice) * 100;
  const avgAtrPercent = (avgATR30 / currentPrice) * 100;
  
  if (currentATR > avgATR30 * 1.3) return "Increasing";
  if (currentATR < avgATR30 * 0.8) return "Decreasing";
  if (atrPercent > 2) return "Elevated";
  return "Stable";
}

// Determine volume behavior
function determineVolumeBehavior(data: OHLCVData[]): string {
  if (data.length < 20) return "Unknown";
  
  const recent = data.slice(-20);
  let upDayVolume = 0;
  let downDayVolume = 0;
  let upDays = 0;
  let downDays = 0;
  
  for (const day of recent) {
    if (day.close > day.open) {
      upDayVolume += day.volume;
      upDays++;
    } else {
      downDayVolume += day.volume;
      downDays++;
    }
  }
  
  const avgUpVolume = upDays > 0 ? upDayVolume / upDays : 0;
  const avgDownVolume = downDays > 0 ? downDayVolume / downDays : 0;
  
  if (avgUpVolume > avgDownVolume * 1.2) return "Confirming";
  if (avgDownVolume > avgUpVolume * 1.2) return "Distribution";
  return "Neutral";
}

// Determine trend strength
function determineTrendStrength(closes: number[]): string {
  const sma20 = calculateSMA(closes, 20);
  const sma50 = calculateSMA(closes, 50);
  const sma200 = calculateSMA(closes, 200);
  
  const current = closes[closes.length - 1];
  const ma20 = sma20[sma20.length - 1];
  const ma50 = sma50[sma50.length - 1];
  const ma200 = sma200[sma200.length - 1];
  
  if (isNaN(ma20) || isNaN(ma50) || isNaN(ma200)) return "Unknown";
  
  // Strong trend: price > all MAs and MAs properly stacked
  if (current > ma20 && ma20 > ma50 && ma50 > ma200) return "Strong";
  if (current < ma20 && ma20 < ma50 && ma50 < ma200) return "Strong (bearish)";
  
  // Moderate: price above/below some MAs
  if (current > ma50 && ma50 > ma200) return "Moderate";
  if (current < ma50 && ma50 < ma200) return "Moderate (bearish)";
  
  return "Weak";
}

// Determine support/resistance context
function determineSupportResistance(data: OHLCVData[]): string {
  if (data.length < 20) return "Unknown";
  
  const closes = data.map(d => d.close);
  const current = closes[closes.length - 1];
  const high20 = Math.max(...closes.slice(-20));
  const low20 = Math.min(...closes.slice(-20));
  const range = high20 - low20;
  
  const positionInRange = (current - low20) / range;
  
  if (positionInRange > 0.9) return "Near resistance";
  if (positionInRange < 0.1) return "Near support";
  if (positionInRange > 0.7) return "Upper range";
  if (positionInRange < 0.3) return "Lower range";
  return "Mid range";
}

// Determine risk mode
function determineRiskMode(
  volatility: string, 
  momentum: string, 
  volumeBehavior: string
): string {
  const riskFactors = [
    volatility === "Increasing" || volatility === "Elevated",
    momentum === "Overbought" || momentum === "Oversold",
    volumeBehavior === "Distribution"
  ].filter(Boolean).length;
  
  if (riskFactors >= 2) return "Risk-Off";
  if (riskFactors === 0 && volumeBehavior === "Confirming") return "Risk-On";
  return "Neutral";
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { data } = await req.json() as { data: OHLCVData[] };
    
    if (!data || !Array.isArray(data) || data.length < 50) {
      return new Response(
        JSON.stringify({ error: "Insufficient OHLCV data (need at least 50 data points)" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
    
    console.log(`Computing indicators for ${data.length} data points...`);
    
    const closes = data.map(d => d.close);
    
    // Compute all indicators
    const { trend, daysInTrend } = determineTrend(closes);
    const rsi = calculateRSI(closes);
    const atr = calculateATR(data);
    
    const volatility = determineVolatility(atr, closes);
    const momentum = determineMomentum(rsi);
    const volumeBehavior = determineVolumeBehavior(data);
    const trendStrength = determineTrendStrength(closes);
    const supportResistance = determineSupportResistance(data);
    const riskMode = determineRiskMode(volatility, momentum, volumeBehavior);
    
    const indicators: IndicatorLabels = {
      overallTrend: trend,
      trendDuration: getDurationLabel(daysInTrend),
      volumeBehavior,
      volatilityLevel: volatility,
      momentum,
      trendStrength,
      supportResistance,
      riskMode,
    };
    
    // Include raw values for debugging
    const rawValues = {
      rsi: Number(rsi.toFixed(2)),
      daysInTrend,
      currentPrice: closes[closes.length - 1],
      sma50: calculateSMA(closes, 50).slice(-1)[0]?.toFixed(2) || "N/A",
      sma200: calculateSMA(closes, 200).slice(-1)[0]?.toFixed(2) || "N/A",
      atr: atr[atr.length - 1]?.toFixed(2) || "N/A",
    };
    
    console.log("Computed indicators:", indicators);
    console.log("Raw values:", rawValues);
    
    return new Response(JSON.stringify({ indicators, rawValues }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (error) {
    console.error("compute-indicators error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Failed to compute indicators" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
