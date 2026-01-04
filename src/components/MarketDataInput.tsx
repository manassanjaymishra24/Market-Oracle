import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { TrendingUp, Loader2, Sparkles } from "lucide-react";

interface MarketDataInputProps {
  onAnalyze: (data: string) => void;
  isLoading: boolean;
}

const MarketDataInput = ({ onAnalyze, isLoading }: MarketDataInputProps) => {
  const [marketData, setMarketData] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (marketData.trim()) {
      onAnalyze(marketData);
    }
  };

  const exampleData = `Market: S&P 500
Current Price: 4,782
200-day MA: 4,650 (price above)
RSI (14): 62
VIX: 14.5
Put/Call Ratio: 0.85
Sector Leadership: Technology, Consumer Discretionary
Recent News: Fed signals potential rate cuts in 2024
Trend: Higher highs, higher lows over 3 months`;

  return (
    <div className="card-gradient rounded-xl border border-border p-6 shadow-lg animate-fade-in">
      <div className="flex items-center gap-3 mb-4">
        <div className="p-2 rounded-lg bg-primary/10">
          <TrendingUp className="w-5 h-5 text-primary" />
        </div>
        <div>
          <h2 className="text-lg font-semibold text-foreground">Market Data Input</h2>
          <p className="text-sm text-muted-foreground">
            Paste your structured market information for analysis
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <Textarea
          value={marketData}
          onChange={(e) => setMarketData(e.target.value)}
          placeholder="Enter market data here... Include indicators like price, moving averages, RSI, VIX, sentiment data, sector performance, etc."
          className="min-h-[200px] bg-input/50 border-border focus:border-primary focus:ring-primary/20 text-foreground placeholder:text-muted-foreground font-mono text-sm resize-none"
        />

        <div className="flex items-center justify-between gap-4">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => setMarketData(exampleData)}
            className="text-muted-foreground hover:text-foreground"
          >
            <Sparkles className="w-4 h-4 mr-1" />
            Load Example
          </Button>

          <Button
            type="submit"
            variant="glow"
            size="lg"
            disabled={!marketData.trim() || isLoading}
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Analyzing...
              </>
            ) : (
              <>
                <TrendingUp className="w-4 h-4" />
                Analyze Market
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default MarketDataInput;
