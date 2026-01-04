import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { TrendingUp, Loader2, Activity, Zap, BarChart3 } from "lucide-react";
import { PipelineStatus } from "@/lib/automatedAnalysis";

interface AutomatedAnalysisProps {
  onAnalyze: (symbol: string) => void;
  isLoading: boolean;
  pipelineStatus: PipelineStatus | null;
}

const SUPPORTED_SYMBOLS = [
  { value: "SPY", label: "S&P 500 (SPY)" },
  { value: "QQQ", label: "NASDAQ 100 (QQQ)" },
  { value: "^DJI", label: "Dow Jones (^DJI)" },
];

const STAGE_ICONS = {
  fetching: Activity,
  computing: BarChart3,
  summarizing: Zap,
  analyzing: TrendingUp,
  complete: TrendingUp,
  error: TrendingUp,
};

const AutomatedAnalysis = ({ onAnalyze, isLoading, pipelineStatus }: AutomatedAnalysisProps) => {
  const [selectedSymbol, setSelectedSymbol] = useState("SPY");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onAnalyze(selectedSymbol);
  };

  const StageIcon = pipelineStatus ? STAGE_ICONS[pipelineStatus.stage] : TrendingUp;

  return (
    <div className="card-gradient rounded-xl border border-border p-6 shadow-lg animate-fade-in">
      <div className="flex items-center gap-3 mb-4">
        <div className="p-2 rounded-lg bg-primary/10">
          <TrendingUp className="w-5 h-5 text-primary" />
        </div>
        <div>
          <h2 className="text-lg font-semibold text-foreground">Automated Market Analysis</h2>
          <p className="text-sm text-muted-foreground">
            Backend-driven interpretation — no manual input required
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground">Select Market Index</label>
          <Select value={selectedSymbol} onValueChange={setSelectedSymbol} disabled={isLoading}>
            <SelectTrigger className="w-full bg-input/50 border-border">
              <SelectValue placeholder="Select a market" />
            </SelectTrigger>
            <SelectContent>
              {SUPPORTED_SYMBOLS.map((symbol) => (
                <SelectItem key={symbol.value} value={symbol.value}>
                  {symbol.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Pipeline Status Display */}
        {isLoading && pipelineStatus && (
          <div className="space-y-3 p-4 rounded-lg bg-muted/30 border border-border">
            <div className="flex items-center gap-2 text-sm">
              <StageIcon className="w-4 h-4 text-primary animate-pulse" />
              <span className="text-foreground">{pipelineStatus.message}</span>
            </div>
            <Progress value={pipelineStatus.progress} className="h-2" />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>Pipeline Progress</span>
              <span>{pipelineStatus.progress}%</span>
            </div>
          </div>
        )}

        <div className="bg-muted/20 rounded-lg p-4 border border-border/50">
          <h3 className="text-sm font-medium text-foreground mb-2">Pipeline Stages</h3>
          <ol className="text-xs text-muted-foreground space-y-1">
            <li className={pipelineStatus?.stage === "fetching" ? "text-primary font-medium" : ""}>
              1. Fetch 6 months of OHLCV data
            </li>
            <li className={pipelineStatus?.stage === "computing" ? "text-primary font-medium" : ""}>
              2. Compute technical indicators (SMA, RSI, ATR)
            </li>
            <li className={pipelineStatus?.stage === "summarizing" ? "text-primary font-medium" : ""}>
              3. Generate structured market summary
            </li>
            <li className={pipelineStatus?.stage === "analyzing" ? "text-primary font-medium" : ""}>
              4. AI interpretation of signals
            </li>
          </ol>
        </div>

        <Button
          type="submit"
          variant="glow"
          size="lg"
          className="w-full"
          disabled={isLoading}
        >
          {isLoading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Processing Pipeline...
            </>
          ) : (
            <>
              <TrendingUp className="w-4 h-4" />
              Run Automated Analysis
            </>
          )}
        </Button>
      </form>
    </div>
  );
};

export default AutomatedAnalysis;
