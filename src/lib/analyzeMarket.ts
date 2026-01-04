import { supabase } from "@/integrations/supabase/client";
import { MarketAnalysis } from "@/components/AnalysisResult";

export const analyzeMarketData = async (data: string): Promise<MarketAnalysis> => {
  const { data: response, error } = await supabase.functions.invoke("analyze-market", {
    body: { marketData: data },
  });

  if (error) {
    console.error("Analysis error:", error);
    throw new Error(error.message || "Failed to analyze market data");
  }

  if (response.error) {
    throw new Error(response.error);
  }

  // Validate and ensure all required fields exist
  const analysis: MarketAnalysis = {
    directionalBias: response.directionalBias || "Neutral",
    confidenceLevel: response.confidenceLevel || "Low",
    confidenceReasoning: response.confidenceReasoning || "Analysis incomplete",
    marketRegime: response.marketRegime || "Uncertain",
    volatilityExpectation: response.volatilityExpectation || "Stable",
    signalAgreement: response.signalAgreement || "Low",
    trendMaturity: response.trendMaturity || "Unknown",
    supportingFactors: response.supportingFactors || "No factors identified",
    riskFactors: response.riskFactors || "Analysis may be incomplete",
    upgradeBlockers: response.upgradeBlockers || "None",
    uncertaintyAssessment: response.uncertaintyAssessment || "Unable to assess uncertainty",
    interpretationSummary: response.interpretationSummary || "No summary available",
  };

  return analysis;
};
