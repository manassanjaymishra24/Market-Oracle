import { supabase } from "@/integrations/supabase/client";
import { MarketAnalysis } from "@/components/AnalysisResult";

export interface PipelineStatus {
  stage: "fetching" | "computing" | "summarizing" | "analyzing" | "complete" | "error";
  message: string;
  progress: number;
}

export interface AutomatedAnalysisResult {
  analysis: MarketAnalysis;
  pipelineMetadata: {
    symbol: string;
    dataPoints: number;
    fetchedAt: string;
    rawValues: {
      rsi: number;
      daysInTrend: number;
      currentPrice: number;
      sma50: string;
      sma200: string;
      atr: string;
    };
    validationStatus: {
      isValid: boolean;
      unknownCount: number;
      unknownPercentage: number;
    };
  };
}

export const runAutomatedAnalysis = async (
  symbol: string = "SPY",
  onStatusChange?: (status: PipelineStatus) => void
): Promise<AutomatedAnalysisResult> => {
  
  // Stage 1: Fetch market data
  onStatusChange?.({
    stage: "fetching",
    message: `Fetching ${symbol} market data...`,
    progress: 10,
  });

  const { data: marketDataResponse, error: fetchError } = await supabase.functions.invoke(
    "fetch-market-data",
    { body: { symbol } }
  );

  if (fetchError || marketDataResponse?.error) {
    throw new Error(fetchError?.message || marketDataResponse?.error || "Failed to fetch market data");
  }

  // Stage 2: Compute indicators
  onStatusChange?.({
    stage: "computing",
    message: "Computing technical indicators...",
    progress: 35,
  });

  const { data: indicatorsResponse, error: indicatorsError } = await supabase.functions.invoke(
    "compute-indicators",
    { body: { data: marketDataResponse.data } }
  );

  if (indicatorsError || indicatorsResponse?.error) {
    throw new Error(indicatorsError?.message || indicatorsResponse?.error || "Failed to compute indicators");
  }

  // Stage 3: Generate structured summary
  onStatusChange?.({
    stage: "summarizing",
    message: "Generating structured summary...",
    progress: 55,
  });

  const { data: summaryResponse, error: summaryError } = await supabase.functions.invoke(
    "generate-market-summary",
    { 
      body: { 
        indicators: indicatorsResponse.indicators, 
        rawValues: indicatorsResponse.rawValues,
        symbol 
      } 
    }
  );

  if (summaryError || summaryResponse?.error) {
    throw new Error(summaryError?.message || summaryResponse?.error || "Failed to generate summary");
  }

  // Validation gate check
  if (!summaryResponse.validation.isValid) {
    throw new Error(
      `Insufficient data for interpretation: ${summaryResponse.validation.unknownCount} of 13 fields unknown (${summaryResponse.validation.unknownPercentage}%)`
    );
  }

  // Stage 4: Send to AI for interpretation
  onStatusChange?.({
    stage: "analyzing",
    message: "AI interpreting market signals...",
    progress: 75,
  });

  const { data: analysisResponse, error: analysisError } = await supabase.functions.invoke(
    "analyze-market",
    { body: { symbol } }
  );

  if (analysisError || analysisResponse?.error) {
    throw new Error(analysisError?.message || analysisResponse?.error || "Failed to analyze market");
  }

  onStatusChange?.({
    stage: "complete",
    message: "Analysis complete",
    progress: 100,
  });

  // Build the final result
  const analysis: MarketAnalysis = {
    directionalBias: analysisResponse.directionalBias || "Neutral",
    confidenceLevel: analysisResponse.confidenceLevel || "Low",
    confidenceReasoning: analysisResponse.confidenceReasoning || "Analysis incomplete",
    marketRegime: analysisResponse.marketRegime || "Uncertain",
    volatilityExpectation: analysisResponse.volatilityExpectation || "Stable",
    signalAgreement: analysisResponse.signalAgreement || "Low",
    trendMaturity: analysisResponse.trendMaturity || "Unknown",
    supportingFactors: analysisResponse.supportingFactors || "No factors identified",
    riskFactors: analysisResponse.riskFactors || "Analysis may be incomplete",
    upgradeBlockers: analysisResponse.upgradeBlockers || "None",
    uncertaintyAssessment: analysisResponse.uncertaintyAssessment || "Unable to assess uncertainty",
    interpretationSummary: analysisResponse.interpretationSummary || "No summary available",
  };

  return {
    analysis,
    pipelineMetadata: {
      symbol,
      dataPoints: marketDataResponse.dataPoints,
      fetchedAt: marketDataResponse.fetchedAt,
      rawValues: indicatorsResponse.rawValues,
      validationStatus: summaryResponse.validation,
    },
  };
};
