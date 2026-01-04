import { useState } from "react";
import Header from "@/components/Header";
import AutomatedAnalysis from "@/components/AutomatedAnalysis";
import AnalysisResult, { MarketAnalysis } from "@/components/AnalysisResult";
import PipelineMetadata from "@/components/PipelineMetadata";
import EmptyState from "@/components/EmptyState";
import { runAutomatedAnalysis, PipelineStatus, AutomatedAnalysisResult } from "@/lib/automatedAnalysis";
import { useToast } from "@/hooks/use-toast";

const Index = () => {
  const [analysisResult, setAnalysisResult] = useState<AutomatedAnalysisResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [pipelineStatus, setPipelineStatus] = useState<PipelineStatus | null>(null);
  const { toast } = useToast();

  const handleAnalyze = async (symbol: string) => {
    setIsLoading(true);
    setPipelineStatus(null);
    
    try {
      const result = await runAutomatedAnalysis(symbol, (status) => {
        setPipelineStatus(status);
      });
      
      setAnalysisResult(result);
      toast({
        title: "Analysis Complete",
        description: `${symbol}: ${result.analysis.directionalBias} with ${result.analysis.confidenceLevel} confidence`,
      });
    } catch (error) {
      console.error("Analysis failed:", error);
      setPipelineStatus({
        stage: "error",
        message: error instanceof Error ? error.message : "Pipeline failed",
        progress: 0,
      });
      toast({
        title: "Analysis Failed",
        description: error instanceof Error ? error.message : "Unable to complete automated analysis",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Background gradient effect */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-primary/3 rounded-full blur-3xl" />
      </div>

      <Header />

      <main className="container mx-auto px-4 py-8 relative z-10">
        <div className="grid lg:grid-cols-2 gap-6 max-w-7xl mx-auto">
          {/* Input Section */}
          <div className="lg:sticky lg:top-24 lg:self-start space-y-4">
            <AutomatedAnalysis 
              onAnalyze={handleAnalyze} 
              isLoading={isLoading} 
              pipelineStatus={pipelineStatus}
            />
            
            {/* Show metadata after successful analysis */}
            {analysisResult && (
              <PipelineMetadata metadata={analysisResult.pipelineMetadata} />
            )}
          </div>

          {/* Results Section */}
          <div>
            {analysisResult ? (
              <AnalysisResult analysis={analysisResult.analysis} />
            ) : (
              <EmptyState />
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default Index;
