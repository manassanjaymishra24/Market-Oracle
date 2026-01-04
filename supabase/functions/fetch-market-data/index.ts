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

interface MarketDataResponse {
  symbol: string;
  data: OHLCVData[];
  fetchedAt: string;
  dataPoints: number;
  missingDates: string[];
}

// Fetch data from Yahoo Finance (no API key required)
async function fetchYahooFinanceData(symbol: string, period: string = "6mo"): Promise<OHLCVData[]> {
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
    
    // Skip if any OHLCV value is null/undefined
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
  
  return data;
}

// Validate data completeness
function validateData(data: OHLCVData[]): { isValid: boolean; missingDates: string[] } {
  const missingDates: string[] = [];
  
  if (data.length < 50) {
    return { isValid: false, missingDates: ["Insufficient data points (need at least 50 days)"] };
  }
  
  // Check for gaps in trading days (excluding weekends)
  for (let i = 1; i < data.length; i++) {
    const prevDate = new Date(data[i - 1].date);
    const currDate = new Date(data[i].date);
    const daysDiff = Math.floor((currDate.getTime() - prevDate.getTime()) / (1000 * 60 * 60 * 24));
    
    // If gap is more than 4 days (accounting for weekends + holidays), flag it
    if (daysDiff > 4) {
      missingDates.push(`Gap from ${data[i - 1].date} to ${data[i].date}`);
    }
  }
  
  return { isValid: true, missingDates };
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { symbol = "SPY" } = await req.json().catch(() => ({}));
    
    // Validate symbol (only allow specific indices for now)
    const allowedSymbols = ["SPY", "^GSPC", "^IXIC", "^DJI", "QQQ"];
    const normalizedSymbol = symbol.toUpperCase();
    
    if (!allowedSymbols.includes(normalizedSymbol)) {
      return new Response(
        JSON.stringify({ 
          error: `Symbol not supported. Allowed: ${allowedSymbols.join(", ")}` 
        }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
    
    console.log(`Fetching market data for symbol: ${normalizedSymbol}`);
    
    const data = await fetchYahooFinanceData(normalizedSymbol);
    const validation = validateData(data);
    
    if (!validation.isValid) {
      return new Response(
        JSON.stringify({ 
          error: "Insufficient market data",
          details: validation.missingDates 
        }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
    
    const response: MarketDataResponse = {
      symbol: normalizedSymbol,
      data,
      fetchedAt: new Date().toISOString(),
      dataPoints: data.length,
      missingDates: validation.missingDates,
    };
    
    console.log(`Successfully fetched ${data.length} data points for ${normalizedSymbol}`);
    
    return new Response(JSON.stringify(response), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (error) {
    console.error("fetch-market-data error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Failed to fetch market data" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
