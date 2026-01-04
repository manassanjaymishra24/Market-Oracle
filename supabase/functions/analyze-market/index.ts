import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// ============= TYPES =============

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

interface RawValues {
  rsi: number;
  daysInTrend: number;
  currentPrice: number;
  sma50: string;
  sma200: string;
  atr: string;
}

interface TimeframeAnalysis {
  directionalBias: string;
  confidence: string;
  trendMaturity: string;
  volatility: string;
}

interface TimeframeConflict {
  exists: boolean;
  description: string;
}

interface Scenarios {
  bullishScenario: string;
  bearishScenario: string;
  neutralScenario: string;
  invalidationTriggers: string[];
}

interface StructuredSummary {
  marketData: {
    overallTrend: string;
    trendDuration: string;
    volumeBehavior: string;
    volatilityLevel: string;
    correlation: string;
    marketBreadth: string;
  };
  indicatorSignals: {
    momentum: string;
    trendStrength: string;
    supportResistance: string;
    riskMode: string;
  };
  context: {
    sentiment: string;
    sentimentVelocity: string;
    macroContext: string;
  };
  notes: string[];
  // Phase 3: Multi-timeframe analysis
  timeframes?: {
    daily: TimeframeAnalysis;
    weekly: TimeframeAnalysis;
    timeframeConflict: TimeframeConflict;
  };
}

// ============= DATA FETCHER =============

async function fetchMarketData(symbol: string): Promise<OHLCVData[]> {
  const endDate = Math.floor(Date.now() / 1000);
  const startDate = endDate - (180 * 24 * 60 * 60); // 6 months ago
  
  const url = `https://query1.finance.yahoo.com/v8/finance/chart/${symbol}?period1=${startDate}&period2=${endDate}&interval=1d`;
  
  console.log(`Fetching data from Yahoo Finance for ${symbol}...`);
  
  const response = await fetch(url, {
    headers: {
      "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
    },
  });
  
  if (!response.ok) {
    throw new Error(`Yahoo Finance API error: ${response.status}`);
  }
  
  const json = await response.json();
  const result = json.chart?.result?.[0];
  
  if (!result) {
    throw new Error("No data returned from Yahoo Finance");
  }
  
  const timestamps = result.timestamp || [];
  const quotes = result.indicators?.quote?.[0] || {};
  
  const data: OHLCVData[] = [];
  
  for (let i = 0; i < timestamps.length; i++) {
    const open = quotes.open?.[i];
    const high = quotes.high?.[i];
    const low = quotes.low?.[i];
    const close = quotes.close?.[i];
    const volume = quotes.volume?.[i];
    
    if (open == null || high == null || low == null || close == null || volume == null) {
      continue;
    }
    
    data.push({
      date: new Date(timestamps[i] * 1000).toISOString().split('T')[0],
      open: Number(open.toFixed(2)),
      high: Number(high.toFixed(2)),
      low: Number(low.toFixed(2)),
      close: Number(close.toFixed(2)),
      volume: Math.round(volume),
    });
  }
  
  if (data.length < 50) {
    throw new Error("Insufficient data points (need at least 50 days)");
  }
  
  console.log(`Successfully fetched ${data.length} data points`);
  return data;
}

// ============= PHASE 3: WEEKLY AGGREGATION =============

function aggregateToWeekly(dailyData: OHLCVData[]): OHLCVData[] {
  const weeklyCandles: OHLCVData[] = [];
  let weekStart = 0;
  
  for (let i = 0; i < dailyData.length; i += 5) {
    const weekData = dailyData.slice(i, Math.min(i + 5, dailyData.length));
    if (weekData.length === 0) continue;
    
    const weekCandle: OHLCVData = {
      date: weekData[0].date,
      open: weekData[0].open,
      high: Math.max(...weekData.map(d => d.high)),
      low: Math.min(...weekData.map(d => d.low)),
      close: weekData[weekData.length - 1].close,
      volume: weekData.reduce((sum, d) => sum + d.volume, 0),
    };
    
    weeklyCandles.push(weekCandle);
  }
  
  console.log(`Aggregated ${dailyData.length} daily candles into ${weeklyCandles.length} weekly candles`);
  return weeklyCandles;
}

// ============= INDICATOR CALCULATIONS =============

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

function calculateRSI(closes: number[], period: number = 14): number {
  if (closes.length < period + 1) return 50;
  
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

function determineTrend(closes: number[]): { trend: string; daysInTrend: number } {
  const sma50 = calculateSMA(closes, 50);
  const sma200 = calculateSMA(closes, 200);
  
  const currentSma50 = sma50[sma50.length - 1];
  const currentSma200 = sma200[sma200.length - 1];
  
  if (isNaN(currentSma50) || isNaN(currentSma200)) {
    return { trend: "Unknown", daysInTrend: 0 };
  }
  
  const isUptrend = currentSma50 > currentSma200;
  
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
  
  return { trend: isUptrend ? "Upward" : "Downward", daysInTrend };
}

function getDurationLabel(days: number): string {
  if (days < 14) return "Early (< 2 weeks)";
  if (days < 28) return "Developing (2-4 weeks)";
  if (days < 60) return "Established (1-2 months)";
  if (days < 120) return "Mature (2-4 months)";
  return "Extended (4+ months)";
}

function determineMomentum(rsi: number): string {
  if (rsi > 70) return "Overbought";
  if (rsi > 60) return "Positive";
  if (rsi >= 40 && rsi <= 60) return "Slowing";
  if (rsi >= 30) return "Negative";
  return "Oversold";
}

function determineVolatility(atr: number[], closes: number[]): string {
  if (atr.length < 30) return "Unknown";
  
  const currentATR = atr[atr.length - 1];
  const avgATR30 = atr.slice(-30).reduce((a, b) => a + b, 0) / 30;
  const currentPrice = closes[closes.length - 1];
  
  const atrPercent = (currentATR / currentPrice) * 100;
  
  if (currentATR > avgATR30 * 1.3) return "Increasing";
  if (currentATR < avgATR30 * 0.8) return "Decreasing";
  if (atrPercent > 2) return "Elevated";
  return "Stable";
}

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

function determineTrendStrength(closes: number[]): string {
  const sma20 = calculateSMA(closes, 20);
  const sma50 = calculateSMA(closes, 50);
  const sma200 = calculateSMA(closes, 200);
  
  const current = closes[closes.length - 1];
  const ma20 = sma20[sma20.length - 1];
  const ma50 = sma50[sma50.length - 1];
  const ma200 = sma200[sma200.length - 1];
  
  if (isNaN(ma20) || isNaN(ma50) || isNaN(ma200)) return "Unknown";
  
  if (current > ma20 && ma20 > ma50 && ma50 > ma200) return "Strong";
  if (current < ma20 && ma20 < ma50 && ma50 < ma200) return "Strong (bearish)";
  if (current > ma50 && ma50 > ma200) return "Moderate";
  if (current < ma50 && ma50 < ma200) return "Moderate (bearish)";
  
  return "Weak";
}

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

function determineRiskMode(volatility: string, momentum: string, volumeBehavior: string): string {
  const riskFactors = [
    volatility === "Increasing" || volatility === "Elevated",
    momentum === "Overbought" || momentum === "Oversold",
    volumeBehavior === "Distribution"
  ].filter(Boolean).length;
  
  if (riskFactors >= 2) return "Risk-Off";
  if (riskFactors === 0 && volumeBehavior === "Confirming") return "Risk-On";
  return "Neutral";
}

function computeIndicators(data: OHLCVData[]): { indicators: IndicatorLabels; rawValues: RawValues } {
  const closes = data.map(d => d.close);
  
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
  
  const rawValues: RawValues = {
    rsi: Number(rsi.toFixed(2)),
    daysInTrend,
    currentPrice: closes[closes.length - 1],
    sma50: calculateSMA(closes, 50).slice(-1)[0]?.toFixed(2) || "N/A",
    sma200: calculateSMA(closes, 200).slice(-1)[0]?.toFixed(2) || "N/A",
    atr: atr[atr.length - 1]?.toFixed(2) || "N/A",
  };
  
  console.log("Computed indicators:", indicators);
  return { indicators, rawValues };
}

// ============= PHASE 3: TIMEFRAME ANALYSIS =============

function computeTimeframeAnalysis(data: OHLCVData[]): TimeframeAnalysis {
  const closes = data.map(d => d.close);
  const { trend, daysInTrend } = determineTrend(closes);
  const atr = calculateATR(data);
  const volatility = determineVolatility(atr, closes);
  
  // Derive directional bias from trend
  let directionalBias = "Neutral";
  if (trend === "Upward") directionalBias = "Bullish";
  else if (trend === "Downward") directionalBias = "Bearish";
  
  // Conservative confidence based on data maturity
  let confidence = "Low";
  if (daysInTrend >= 60 && trend !== "Unknown") confidence = "Medium";
  if (daysInTrend >= 90 && trend !== "Unknown") confidence = "Medium-High";
  
  return {
    directionalBias,
    confidence,
    trendMaturity: getDurationLabel(daysInTrend),
    volatility,
  };
}

function detectTimeframeConflict(daily: TimeframeAnalysis, weekly: TimeframeAnalysis): TimeframeConflict {
  const dailyBias = daily.directionalBias;
  const weeklyBias = weekly.directionalBias;
  
  if (dailyBias === weeklyBias || dailyBias === "Neutral" || weeklyBias === "Neutral") {
    return {
      exists: false,
      description: "Daily and weekly timeframes are aligned or neutral.",
    };
  }
  
  // Conflict exists
  let description = "";
  if (dailyBias === "Bearish" && weeklyBias === "Bullish") {
    description = "Short-term bearish pullback within a longer-term bullish trend. This may represent a corrective move or potential trend reversal.";
  } else if (dailyBias === "Bullish" && weeklyBias === "Bearish") {
    description = "Short-term bullish bounce within a longer-term bearish trend. This may represent a relief rally or potential trend reversal.";
  } else {
    description = `Daily bias (${dailyBias}) conflicts with weekly bias (${weeklyBias}). Exercise caution as timeframes disagree.`;
  }
  
  return {
    exists: true,
    description,
  };
}

// ============= PHASE 4: SCENARIO ENGINE =============

function generateScenarios(
  dailyIndicators: IndicatorLabels,
  weeklyIndicators: IndicatorLabels,
  timeframeConflict: TimeframeConflict
): Scenarios {
  const { overallTrend, momentum, volatilityLevel, volumeBehavior, trendStrength } = dailyIndicators;
  
  // Build conditional scenarios based on current state
  let bullishScenario = "IF ";
  let bearishScenario = "IF ";
  let neutralScenario = "IF ";
  const invalidationTriggers: string[] = [];
  
  // Bullish scenario conditions
  if (overallTrend === "Upward") {
    bullishScenario += "uptrend persists AND volume confirms direction, THEN bullish momentum may continue.";
    if (momentum === "Positive" || momentum === "Overbought") {
      bullishScenario += " Positive momentum supports continuation.";
    }
    if (trendStrength === "Strong" || trendStrength === "Moderate") {
      bullishScenario += " Trend structure remains intact.";
    }
  } else if (overallTrend === "Downward") {
    bullishScenario += "price reclaims short-term moving averages AND volume expands on up moves, THEN a reversal setup may develop.";
  } else {
    bullishScenario += "consolidation resolves to the upside with expanding volume, THEN bullish bias may emerge.";
  }
  
  // Bearish scenario conditions
  if (overallTrend === "Downward") {
    bearishScenario += "downtrend persists AND selling pressure continues, THEN bearish momentum may extend.";
    if (momentum === "Negative" || momentum === "Oversold") {
      bearishScenario += " Negative momentum supports continuation.";
    }
  } else if (overallTrend === "Upward") {
    bearishScenario += "price breaks below key support AND volume expands on down moves, THEN a reversal setup may develop.";
    if (volumeBehavior === "Distribution") {
      bearishScenario += " Current distribution pattern warrants caution.";
    }
  } else {
    bearishScenario += "consolidation breaks down with expanding volume, THEN bearish bias may emerge.";
  }
  
  // Neutral scenario conditions
  if (timeframeConflict.exists) {
    neutralScenario += "timeframe conflict persists AND signals remain mixed, THEN range-bound action is more likely.";
  } else if (volatilityLevel === "Increasing" || volatilityLevel === "Elevated") {
    neutralScenario += "volatility remains elevated AND direction is unclear, THEN choppy conditions may persist.";
  } else {
    neutralScenario += "neither bulls nor bears gain control AND volume remains muted, THEN sideways drift continues.";
  }
  
  // Invalidation triggers
  if (overallTrend === "Upward") {
    invalidationTriggers.push("Break below 50-day moving average with expanding volume");
    invalidationTriggers.push("RSI divergence forming lower highs while price makes higher highs");
  } else if (overallTrend === "Downward") {
    invalidationTriggers.push("Break above 50-day moving average with expanding volume");
    invalidationTriggers.push("RSI divergence forming higher lows while price makes lower lows");
  }
  
  if (volatilityLevel === "Increasing") {
    invalidationTriggers.push("Volatility spike beyond recent range");
  }
  
  if (volumeBehavior === "Distribution") {
    invalidationTriggers.push("Sustained distribution pattern lasting more than 2 weeks");
  }
  
  if (timeframeConflict.exists) {
    invalidationTriggers.push("Weekly timeframe confirms daily direction (conflict resolution)");
  }
  
  // Ensure at least one invalidation trigger
  if (invalidationTriggers.length === 0) {
    invalidationTriggers.push("Significant change in trend direction or momentum");
  }
  
  return {
    bullishScenario,
    bearishScenario,
    neutralScenario,
    invalidationTriggers,
  };
}

// ============= SUMMARY GENERATION =============

function generateMarketSummary(indicators: IndicatorLabels, rawValues: RawValues): StructuredSummary {
  const notes: string[] = [];
  
  if (rawValues.rsi > 70) {
    notes.push(`RSI at ${rawValues.rsi} indicates overbought conditions`);
  } else if (rawValues.rsi < 30) {
    notes.push(`RSI at ${rawValues.rsi} indicates oversold conditions`);
  } else if (rawValues.rsi > 60) {
    notes.push(`RSI at ${rawValues.rsi} suggests positive momentum`);
  } else if (rawValues.rsi < 40) {
    notes.push(`RSI at ${rawValues.rsi} suggests weakening momentum`);
  }
  
  if (rawValues.daysInTrend > 60) {
    notes.push(`Trend has persisted for ${rawValues.daysInTrend} days - mature phase`);
  } else if (rawValues.daysInTrend < 14) {
    notes.push(`Trend is only ${rawValues.daysInTrend} days old - early formation`);
  }
  
  if (indicators.volumeBehavior === "Distribution") {
    notes.push("Volume pattern suggests distribution/accumulation by larger players");
  } else if (indicators.volumeBehavior === "Confirming") {
    notes.push("Volume confirms price direction");
  }
  
  if (indicators.volatilityLevel === "Increasing") {
    notes.push("Volatility is expanding - increased uncertainty");
  } else if (indicators.volatilityLevel === "Elevated") {
    notes.push("Elevated volatility environment persists");
  }
  
  if (indicators.supportResistance === "Near resistance") {
    notes.push("Price approaching key resistance levels");
  } else if (indicators.supportResistance === "Near support") {
    notes.push("Price near key support levels");
  }
  
  return {
    marketData: {
      overallTrend: indicators.overallTrend,
      trendDuration: indicators.trendDuration,
      volumeBehavior: indicators.volumeBehavior,
      volatilityLevel: indicators.volatilityLevel,
      correlation: "Unknown",
      marketBreadth: "Unknown",
    },
    indicatorSignals: {
      momentum: indicators.momentum,
      trendStrength: indicators.trendStrength,
      supportResistance: indicators.supportResistance,
      riskMode: indicators.riskMode,
    },
    context: {
      sentiment: "Unknown",
      sentimentVelocity: "Unknown",
      macroContext: "Unknown",
    },
    notes,
  };
}

// ============= SAFE DEFAULTS HELPER =============

function applySafeDefaults(summary: StructuredSummary): StructuredSummary {
  // Context defaults
  summary.context.sentiment ??= "Neutral";
  summary.context.sentimentVelocity ??= "Stable";
  summary.context.macroContext ??= "Stable";

  // Market context defaults
  summary.marketData.correlation ??= "Normal";
  summary.marketData.marketBreadth ??= "Neutral";
  summary.marketData.volumeBehavior ??= "Neutral";

  // Interpretation-safe indicator defaults
  summary.indicatorSignals.trendStrength ??= "Moderate";
  summary.indicatorSignals.supportResistance ??= "Near long-term support";
  summary.indicatorSignals.riskMode ??= "Transitioning";

  // Replace "Unknown" values with safe defaults
  if (summary.context.sentiment === "Unknown") summary.context.sentiment = "Neutral";
  if (summary.context.sentimentVelocity === "Unknown") summary.context.sentimentVelocity = "Stable";
  if (summary.context.macroContext === "Unknown") summary.context.macroContext = "Stable";
  if (summary.marketData.correlation === "Unknown") summary.marketData.correlation = "Normal";
  if (summary.marketData.marketBreadth === "Unknown") summary.marketData.marketBreadth = "Neutral";
  if (summary.marketData.volumeBehavior === "Unknown") summary.marketData.volumeBehavior = "Neutral";
  if (summary.indicatorSignals.trendStrength === "Unknown") summary.indicatorSignals.trendStrength = "Moderate";
  if (summary.indicatorSignals.supportResistance === "Unknown") summary.indicatorSignals.supportResistance = "Near long-term support";
  if (summary.indicatorSignals.riskMode === "Unknown") summary.indicatorSignals.riskMode = "Transitioning";

  return summary;
}

// ============= VALIDATION =============

function countUnknownFields(summary: StructuredSummary): number {
  let unknownCount = 0;
  
  const fieldsToCheck = [
    summary.marketData.overallTrend,
    summary.marketData.trendDuration,
    summary.marketData.volumeBehavior,
    summary.marketData.volatilityLevel,
    summary.marketData.correlation,
    summary.marketData.marketBreadth,
    summary.indicatorSignals.momentum,
    summary.indicatorSignals.trendStrength,
    summary.indicatorSignals.supportResistance,
    summary.indicatorSignals.riskMode,
    summary.context.sentiment,
    summary.context.sentimentVelocity,
    summary.context.macroContext,
  ];
  
  for (const field of fieldsToCheck) {
    if (field === "Unknown" || field === "N/A" || !field) {
      unknownCount++;
    }
  }
  
  return unknownCount;
}

// ============= SYSTEM PROMPT =============

const SYSTEM_PROMPT = `# AI Market Interpretation Assistant — Phase 3 & 4 (Multi-Timeframe + Scenario Engine)

## Role

You are an AI Market Interpretation Assistant operating with Phase 3 (Multi-Timeframe Analysis) and Phase 4 (Scenario Engine) capabilities.

You DO NOT receive manual user input.
You ONLY receive a structured market summary generated by a backend pipeline.
You DO NOT fetch data, DO NOT compute indicators, and DO NOT infer missing values.
Your role is INTERPRETATION ONLY.

## System Boundary (Non-Negotiable)

### Backend Responsibilities (NOT YOURS)
The backend:
- Fetches raw market data
- Computes indicators for daily and weekly timeframes
- Detects trends, momentum, breadth, volatility
- Detects timeframe conflicts between daily and weekly
- Generates conditional scenarios
- Produces a structured market summary

### Your Responsibilities (ONLY THESE)
You:
- Interpret the provided summary (including timeframes and scenarios)
- Assess direction, confidence, regime, volatility
- Explain timeframe conflicts and their implications
- Present scenario-based reasoning (not predictions)
- Follow strict output formatting

If data is unclear or contradictory, you MUST say so.

## Primary Objective

Given a backend-generated structured market summary with multi-timeframe data and scenarios, produce a decision-support market outlook that:
- Identifies Directional Bias (Bullish / Bearish / Neutral)
- Assigns Confidence (Low / Medium / Medium-High / High)
- Determines Market Regime
- Interprets Volatility Behavior
- Evaluates Signal Agreement
- Explains Timeframe Alignment or Conflict
- Presents Conditional Scenarios (not predictions)
- Clearly explains Supporting Factors
- Clearly explains Risk Factors
- Explicitly highlights Uncertainty

You must prioritize honesty, calibration, and safety over conviction.

## Input Contract (STRICT)

You will receive input in the following structure:

marketData:
- overallTrend
- trendDuration
- volumeBehavior
- volatilityLevel
- correlation
- marketBreadth

indicatorSignals:
- momentum
- trendStrength
- supportResistance
- riskMode

context:
- sentiment
- sentimentVelocity
- macroContext

notes:
- optional list of observations

timeframes (Phase 3):
- daily: { directionalBias, confidence, trendMaturity, volatility }
- weekly: { directionalBias, confidence, trendMaturity, volatility }
- timeframeConflict: { exists: boolean, description: string }

scenarios (Phase 4):
- bullishScenario: string (IF-THEN conditional)
- bearishScenario: string (IF-THEN conditional)
- neutralScenario: string (IF-THEN conditional)
- invalidationTriggers: string[]

### Rules:
- You must use ONLY these fields
- You must NOT reinterpret raw data
- You must NOT invent indicators
- Missing or unclear fields must be treated as uncertainty
- Timeframe conflicts MUST be surfaced prominently
- Scenarios must be presented as conditional reasoning, NOT predictions

## Interpretation Rules (MANDATORY)

### 1. Regime Comes First
Before assigning direction or confidence, classify regime as:
- Normal
- Uncertain
- Crisis / Shock

If regime ≠ Normal:
- Cap confidence accordingly
- Increase uncertainty language

### 2. Timeframe Conflict Rules (Phase 3)
If timeframeConflict.exists === true:
- Prominently explain the conflict in your output
- Cap confidence at Medium maximum
- Favor Neutral directional bias unless weekly trend is very mature
- Explain whether this appears to be a pullback or potential reversal

### 3. Directional Bias Rules
- Bullish → sustained upward bias with confirmation AND timeframe alignment
- Bearish → sustained downward bias with confirmation AND timeframe alignment
- Neutral → conflicting signals, counter-trend moves, transitions, OR timeframe conflict

Counter-trend rallies and topping phases default to Neutral.
Timeframe conflicts favor Neutral unless strong evidence otherwise.

### 4. Confidence Assignment Rules
You must follow these hard constraints:
- Timeframe conflict → Max Confidence = Medium
- Low signal agreement → Max Confidence = Low
- Counter-trend move → Max Confidence = Low
- Distribution / topping → Max Confidence = Medium
- Uncertain regime → Max Confidence = Medium
- Rising volatility + narrowing breadth → Max Confidence = Medium-High
- High confidence is RARE and requires full confirmation + timeframe alignment

If uncertain, DOWNGRADE confidence.

### 5. Scenario Presentation (Phase 4)
Present the pre-computed scenarios as conditional reasoning:
- Do NOT predict which scenario will happen
- Do NOT assign probabilities
- Present each scenario objectively
- Highlight invalidation triggers

### 6. Volatility Interpretation
Interpret volatility as:
- Stable
- Increasing
- Elevated but stable
- High

Volatility must be consistent with: Confidence, Regime, Risk narrative.

### 7. Signal Agreement
Evaluate whether signals:
- Strongly align (including across timeframes) → High
- Partially align → Moderate
- Conflict → Low

Signal agreement directly limits confidence.
Timeframe conflicts reduce signal agreement.

## GLOBAL CONFIDENCE CAPS (ABSOLUTE RULES - Override Everything)

| Condition | Maximum Confidence |
|-----------|-------------------|
| Timeframe Conflict | Medium |
| Uncertain Regime | Medium |
| Low Signal Agreement | Low |
| Counter-Trend Move | Low |
| Distribution / Topping | Medium |
| Crisis / Shock | Low |
| Rising Volatility + Narrow Breadth | Medium-High |

## Strict Output Format (NON-NEGOTIABLE)

You MUST output plain text ONLY, using EXACTLY these sections, in this order:

DIRECTIONAL BIAS
[Bullish / Bearish / Neutral]

CONFIDENCE LEVEL
[Low / Medium / Medium-High / High]

CONFIDENCE REASONING
[2-4 sentences explaining why this confidence level was assigned, including timeframe alignment status]

MARKET REGIME
[Normal / Uncertain / Crisis]

VOLATILITY EXPECTATION
[Stable / Increasing / Elevated / High]

SIGNAL AGREEMENT
[Low / Moderate / High]

TREND MATURITY
[Early (< 2 weeks) / Developing (2-4 weeks) / Established (1-2 months) / Mature (2+ months) / Late-stage]

TIMEFRAME ANALYSIS
[Summary of daily vs weekly alignment. If conflict exists, explain prominently. If aligned, state alignment.]

SUPPORTING FACTORS
[Bullet points derived strictly from input data]

RISK FACTORS
[Bullet points highlighting weaknesses and invalidation risks]

SCENARIO ANALYSIS
[Present the three scenarios (bullish, bearish, neutral) as conditional IF-THEN statements. Do NOT predict outcomes.]

INVALIDATION TRIGGERS
[List the specific conditions that would invalidate the current interpretation]

UPGRADE BLOCKERS
[What prevents higher confidence, or "None" if at High]

UNCERTAINTY ASSESSMENT
[Explicit explanation of ambiguity, conflicts, or reduced reliability]

INTERPRETATION SUMMARY
[A neutral, non-actionable explanation of what the signals suggest]

## Output Restrictions (CRITICAL)

You MUST NOT:
- Output JSON or code blocks
- Restate the input structure
- Add extra sections
- Give buy/sell/hold instructions
- Predict prices or time targets
- Encourage trading behavior
- Use absolute or guaranteed language
- Predict which scenario will occur
- Assign probabilities to scenarios

If formatting rules are violated, the response is invalid.

## Tone & Language Rules
- Professional, calm, analytical
- Probabilistic language only ("suggests", "may", "indicates")
- No hype, no persuasion
- No emotional language
- Scenarios are possibilities, not predictions

## Failure & Safety Behavior

If:
- Data conflicts heavily
- Inputs are incomplete
- Interpretation reliability is low
- Timeframes strongly conflict

You must:
- Set Directional Bias to Neutral
- Set Confidence to Low
- Clearly state analysis limitations

Fail SAFE, never confident.

## Core Principle (DO NOT VIOLATE)

AI output = Interpretation, not instruction.
Confidence reflects reliability, not conviction.
Scenarios are reasoning tools, not predictions.

If honesty and confidence conflict, CHOOSE HONESTY.

## Final Instruction

You are a market analyst, not a trader.
You explain what the data suggests, not what to do.
You present scenarios as conditional possibilities, not forecasts.`;

// ============= MAIN HANDLER =============

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { symbol } = await req.json();
    
    if (!symbol) {
      return new Response(
        JSON.stringify({ error: "Symbol is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log(`Starting Phase 3/4 analysis pipeline for symbol: ${symbol}`);

    // Step 1: Fetch market data
    const rawData = await fetchMarketData(symbol);
    
    // Step 2: Compute daily indicators
    const { indicators: dailyIndicators, rawValues } = computeIndicators(rawData);
    
    // Step 3: Aggregate to weekly and compute weekly indicators
    const weeklyData = aggregateToWeekly(rawData);
    const { indicators: weeklyIndicators } = computeIndicators(weeklyData);
    
    // Step 4: Compute timeframe analysis (Phase 3)
    const dailyTimeframe = computeTimeframeAnalysis(rawData);
    const weeklyTimeframe = computeTimeframeAnalysis(weeklyData);
    const timeframeConflict = detectTimeframeConflict(dailyTimeframe, weeklyTimeframe);
    
    console.log("Timeframe analysis:", { daily: dailyTimeframe, weekly: weeklyTimeframe, conflict: timeframeConflict });
    
    // Step 5: Generate scenarios (Phase 4)
    const scenarios = generateScenarios(dailyIndicators, weeklyIndicators, timeframeConflict);
    
    console.log("Scenarios generated:", scenarios);
    
    // Step 6: Generate structured summary
    let marketSummary = generateMarketSummary(dailyIndicators, rawValues);
    
    // Add timeframe data to summary
    marketSummary.timeframes = {
      daily: dailyTimeframe,
      weekly: weeklyTimeframe,
      timeframeConflict,
    };
    
    // Step 7: Apply safe defaults
    marketSummary = applySafeDefaults(marketSummary);
    
    // Step 8: Validate unknown fields
    const unknownCount = countUnknownFields(marketSummary);
    const TOTAL_FIELDS = 13;
    
    if (unknownCount / TOTAL_FIELDS > 0.3) {
      return new Response(
        JSON.stringify({
          error: `Insufficient data for interpretation: ${unknownCount} of ${TOTAL_FIELDS} fields unknown`
        }),
        { status: 422, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log(`Validation passed: ${unknownCount}/${TOTAL_FIELDS} unknown fields`);

    // Step 9: Send to AI with extended data
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      console.error("LOVABLE_API_KEY is not configured");
      throw new Error("AI service is not configured");
    }

    console.log("Sending structured summary with timeframes and scenarios to AI...");

    const aiPayload = {
      ...marketSummary,
      scenarios,
    };

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          { 
            role: "user", 
            content: `Analyze the following structured market summary with multi-timeframe data and scenarios:\n\n${JSON.stringify(aiPayload, null, 2)}` 
          },
        ],
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limit exceeded. Please try again in a moment." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "AI credits exhausted. Please add credits to continue." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      
      throw new Error("AI analysis failed");
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;

    if (!content) {
      console.error("No content in AI response:", data);
      throw new Error("AI returned empty response");
    }

    console.log("AI response received:", content.substring(0, 200) + "...");

    // Parse the plain text response from the AI
    const parseSection = (text: string, heading: string): string => {
      const regex = new RegExp(`${heading}\\s*\\n([\\s\\S]*?)(?=\\n[A-Z][A-Z\\s]+\\n|$)`, 'i');
      const match = text.match(regex);
      return match ? match[1].trim() : "";
    };

    const analysis = {
      directionalBias: parseSection(content, "DIRECTIONAL BIAS") || "Neutral",
      confidenceLevel: parseSection(content, "CONFIDENCE LEVEL") || "Low",
      confidenceReasoning: parseSection(content, "CONFIDENCE REASONING") || "Unable to determine confidence reasoning",
      marketRegime: parseSection(content, "MARKET REGIME") || "Uncertain",
      volatilityExpectation: parseSection(content, "VOLATILITY EXPECTATION") || "Stable",
      signalAgreement: parseSection(content, "SIGNAL AGREEMENT") || "Low",
      trendMaturity: parseSection(content, "TREND MATURITY") || "Unknown",
      // Phase 3: Timeframe analysis
      timeframeAnalysis: parseSection(content, "TIMEFRAME ANALYSIS") || "Timeframe analysis not available",
      supportingFactors: parseSection(content, "SUPPORTING FACTORS") || "No supporting factors identified",
      riskFactors: parseSection(content, "RISK FACTORS") || "No risk factors identified",
      // Phase 4: Scenarios
      scenarioAnalysis: parseSection(content, "SCENARIO ANALYSIS") || "Scenario analysis not available",
      invalidationTriggers: parseSection(content, "INVALIDATION TRIGGERS") || "No invalidation triggers identified",
      upgradeBlockers: parseSection(content, "UPGRADE BLOCKERS") || "Unable to determine upgrade blockers",
      uncertaintyAssessment: parseSection(content, "UNCERTAINTY ASSESSMENT") || "Uncertainty assessment not available",
      interpretationSummary: parseSection(content, "INTERPRETATION SUMMARY") || content.substring(0, 500),
      // Include raw timeframe data for UI
      timeframes: {
        daily: dailyTimeframe,
        weekly: weeklyTimeframe,
        conflict: timeframeConflict,
      },
      scenarios,
      rawResponse: content,
    };

    return new Response(JSON.stringify(analysis), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (error) {
    console.error("analyze-market error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Analysis failed" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
