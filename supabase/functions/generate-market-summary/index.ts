import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

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
}

// Apply safe defaults to avoid too many "Unknown" fields
function applySafeDefaults(summary: StructuredSummary): StructuredSummary {
  // Context defaults
  if (summary.context.sentiment === "Unknown") summary.context.sentiment = "Neutral";
  if (summary.context.sentimentVelocity === "Unknown") summary.context.sentimentVelocity = "Stable";
  if (summary.context.macroContext === "Unknown") summary.context.macroContext = "Stable";

  // Market context defaults
  if (summary.marketData.correlation === "Unknown") summary.marketData.correlation = "Normal";
  if (summary.marketData.marketBreadth === "Unknown") summary.marketData.marketBreadth = "Neutral";
  if (summary.marketData.volumeBehavior === "Unknown") summary.marketData.volumeBehavior = "Neutral";

  // Interpretation-safe indicator defaults
  if (summary.indicatorSignals.trendStrength === "Unknown") summary.indicatorSignals.trendStrength = "Moderate";
  if (summary.indicatorSignals.supportResistance === "Unknown") summary.indicatorSignals.supportResistance = "Near long-term support";
  if (summary.indicatorSignals.riskMode === "Unknown") summary.indicatorSignals.riskMode = "Transitioning";

  return summary;
}

// Count unknown fields
function countUnknownFields(summary: StructuredSummary): number {
  let unknownCount = 0;
  const totalFields = 13; // Total fields we track
  
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

// Build the structured summary from indicators
function buildStructuredSummary(
  indicators: IndicatorLabels,
  rawValues: RawValues,
  symbol: string
): StructuredSummary {
  // Generate notes based on raw values and indicators
  const notes: string[] = [];
  
  // RSI observations
  if (rawValues.rsi > 70) {
    notes.push(`RSI at ${rawValues.rsi} indicates overbought conditions`);
  } else if (rawValues.rsi < 30) {
    notes.push(`RSI at ${rawValues.rsi} indicates oversold conditions`);
  } else if (rawValues.rsi > 60) {
    notes.push(`RSI at ${rawValues.rsi} suggests positive momentum`);
  } else if (rawValues.rsi < 40) {
    notes.push(`RSI at ${rawValues.rsi} suggests weakening momentum`);
  }
  
  // Trend observations
  if (rawValues.daysInTrend > 60) {
    notes.push(`Trend has persisted for ${rawValues.daysInTrend} days - mature phase`);
  } else if (rawValues.daysInTrend < 14) {
    notes.push(`Trend is only ${rawValues.daysInTrend} days old - early formation`);
  }
  
  // Volume observations
  if (indicators.volumeBehavior === "Distribution") {
    notes.push("Volume pattern suggests distribution/accumulation by larger players");
  } else if (indicators.volumeBehavior === "Confirming") {
    notes.push("Volume confirms price direction");
  }
  
  // Volatility observations
  if (indicators.volatilityLevel === "Increasing") {
    notes.push("Volatility is expanding - increased uncertainty");
  } else if (indicators.volatilityLevel === "Elevated") {
    notes.push("Elevated volatility environment persists");
  }
  
  // Support/Resistance context
  if (indicators.supportResistance === "Near resistance") {
    notes.push("Price approaching key resistance levels");
  } else if (indicators.supportResistance === "Near support") {
    notes.push("Price near key support levels");
  }
  
  const summary: StructuredSummary = {
    marketData: {
      overallTrend: indicators.overallTrend,
      trendDuration: indicators.trendDuration,
      volumeBehavior: indicators.volumeBehavior,
      volatilityLevel: indicators.volatilityLevel,
      // These require additional data sources not available in Phase 2B
      correlation: "Unknown", // Would need cross-asset data
      marketBreadth: "Unknown", // Would need breadth data (advance-decline, etc.)
    },
    indicatorSignals: {
      momentum: indicators.momentum,
      trendStrength: indicators.trendStrength,
      supportResistance: indicators.supportResistance,
      riskMode: indicators.riskMode,
    },
    context: {
      // These require external data sources not available in Phase 2B
      sentiment: "Unknown", // Would need sentiment API
      sentimentVelocity: "Unknown", // Would need sentiment change tracking
      macroContext: "Unknown", // Would need macro data feeds
    },
    notes,
  };
  
  return summary;
}

// Format summary as plain text for AI consumption
function formatSummaryAsText(summary: StructuredSummary, symbol: string): string {
  return `marketData:
- overallTrend: ${summary.marketData.overallTrend}
- trendDuration: ${summary.marketData.trendDuration}
- volumeBehavior: ${summary.marketData.volumeBehavior}
- volatilityLevel: ${summary.marketData.volatilityLevel}
- correlation: ${summary.marketData.correlation}
- marketBreadth: ${summary.marketData.marketBreadth}

indicatorSignals:
- momentum: ${summary.indicatorSignals.momentum}
- trendStrength: ${summary.indicatorSignals.trendStrength}
- supportResistance: ${summary.indicatorSignals.supportResistance}
- riskMode: ${summary.indicatorSignals.riskMode}

context:
- sentiment: ${summary.context.sentiment}
- sentimentVelocity: ${summary.context.sentimentVelocity}
- macroContext: ${summary.context.macroContext}

notes:
${summary.notes.map(note => `- ${note}`).join('\n')}

Symbol: ${symbol}
Generated: ${new Date().toISOString()}`;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { indicators, rawValues, symbol } = await req.json() as {
      indicators: IndicatorLabels;
      rawValues: RawValues;
      symbol: string;
    };
    
    if (!indicators) {
      return new Response(
        JSON.stringify({ error: "Indicators data is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
    
    console.log(`Building structured summary for ${symbol}...`);
    
    let summary = buildStructuredSummary(indicators, rawValues, symbol);
    
    // Apply safe defaults BEFORE validation
    summary = applySafeDefaults(summary);
    
    const unknownCount = countUnknownFields(summary);
    const unknownPercentage = (unknownCount / 13) * 100;
    
    console.log(`Unknown fields: ${unknownCount}/13 (${unknownPercentage.toFixed(1)}%)`);
    
    // Validation gate: if more than 30% unknown, flag it
    const isValid = unknownPercentage <= 30;
    
    if (!isValid) {
      console.warn("Validation failed: too many unknown fields");
    }
    
    const formattedSummary = formatSummaryAsText(summary, symbol);
    
    return new Response(JSON.stringify({
      summary,
      formattedSummary,
      validation: {
        isValid,
        unknownCount,
        unknownPercentage: Number(unknownPercentage.toFixed(1)),
        message: isValid 
          ? "Summary passed validation" 
          : "Insufficient data for reliable interpretation",
      },
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (error) {
    console.error("generate-market-summary error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Failed to generate summary" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
