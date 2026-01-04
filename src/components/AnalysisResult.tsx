import { Badge } from "@/components/ui/badge";
import { 
  TrendingUp, 
  TrendingDown, 
  Minus, 
  Activity, 
  AlertTriangle,
  CheckCircle2,
  BarChart3,
  Gauge,
  Shield,
  FileWarning,
  Clock,
  Ban,
  Layers,
  GitBranch,
  Target
} from "lucide-react";

interface TimeframeData {
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

export interface MarketAnalysis {
  directionalBias: string;
  confidenceLevel: string;
  confidenceReasoning: string;
  marketRegime: string;
  volatilityExpectation: string;
  signalAgreement: string;
  trendMaturity?: string;
  // Phase 3: Timeframe analysis
  timeframeAnalysis?: string;
  timeframes?: {
    daily: TimeframeData;
    weekly: TimeframeData;
    conflict: TimeframeConflict;
  };
  supportingFactors: string;
  riskFactors: string;
  // Phase 4: Scenarios
  scenarioAnalysis?: string;
  invalidationTriggers?: string;
  scenarios?: Scenarios;
  upgradeBlockers?: string;
  uncertaintyAssessment: string;
  interpretationSummary: string;
  rawResponse?: string;
}

interface AnalysisResultProps {
  analysis: MarketAnalysis;
}

const AnalysisResult = ({ analysis }: AnalysisResultProps) => {
  const getBiasIcon = () => {
    switch (analysis.directionalBias) {
      case "Bullish":
        return <TrendingUp className="w-6 h-6" />;
      case "Bearish":
        return <TrendingDown className="w-6 h-6" />;
      default:
        return <Minus className="w-6 h-6" />;
    }
  };

  const getBiasColor = () => {
    switch (analysis.directionalBias) {
      case "Bullish":
        return "bg-bullish/10 border-bullish/30 text-bullish";
      case "Bearish":
        return "bg-bearish/10 border-bearish/30 text-bearish";
      default:
        return "bg-neutral/10 border-neutral/30 text-neutral";
    }
  };

  const getConfidenceBadge = () => {
    const variants: Record<string, "high" | "medium" | "low"> = {
      High: "high",
      "Medium-High": "medium",
      Medium: "medium",
      Low: "low",
    };
    return variants[analysis.confidenceLevel] || "low";
  };

  const getRegimeColor = () => {
    switch (analysis.marketRegime) {
      case "Normal":
        return "text-bullish";
      case "High Volatility":
        return "text-neutral";
      case "Crisis":
        return "text-bearish";
      default:
        return "text-muted-foreground";
    }
  };

  const getTimeframeBiasColor = (bias: string) => {
    switch (bias) {
      case "Bullish":
        return "text-bullish";
      case "Bearish":
        return "text-bearish";
      default:
        return "text-neutral";
    }
  };

  return (
    <div className="space-y-6 animate-slide-up">
      {/* Main Outlook Card */}
      <div className="card-gradient rounded-xl border border-border p-6 shadow-lg">
        <div className="flex items-center gap-2 mb-6">
          <BarChart3 className="w-5 h-5 text-primary" />
          <h2 className="text-lg font-semibold text-foreground">Market Outlook</h2>
          <span className="text-sm text-muted-foreground ml-auto">Multi-Timeframe Analysis</span>
        </div>

        {/* Primary Metrics Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
          {/* Directional Bias */}
          <div className={`p-4 rounded-lg border ${getBiasColor()}`}>
            <div className="flex items-center gap-2 mb-2">
              {getBiasIcon()}
              <span className="text-sm font-medium opacity-80">Directional Bias</span>
            </div>
            <p className="text-2xl font-bold">{analysis.directionalBias}</p>
          </div>

          {/* Confidence Level */}
          <div className="p-4 rounded-lg border border-border bg-card/50">
            <div className="flex items-center gap-2 mb-2">
              <Gauge className="w-5 h-5 text-muted-foreground" />
              <span className="text-sm font-medium text-muted-foreground">Confidence</span>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant={getConfidenceBadge()}>{analysis.confidenceLevel}</Badge>
            </div>
            <p className="text-xs text-muted-foreground mt-2">{analysis.confidenceReasoning}</p>
          </div>

          {/* Market Regime */}
          <div className="p-4 rounded-lg border border-border bg-card/50">
            <div className="flex items-center gap-2 mb-2">
              <Activity className="w-5 h-5 text-muted-foreground" />
              <span className="text-sm font-medium text-muted-foreground">Market Regime</span>
            </div>
            <p className={`text-xl font-semibold ${getRegimeColor()}`}>{analysis.marketRegime}</p>
          </div>

          {/* Volatility Expectation */}
          <div className="p-4 rounded-lg border border-border bg-card/50">
            <div className="flex items-center gap-2 mb-2">
              <Activity className="w-5 h-5 text-muted-foreground" />
              <span className="text-sm font-medium text-muted-foreground">Volatility</span>
            </div>
            <p className="text-lg font-semibold text-foreground">{analysis.volatilityExpectation}</p>
          </div>

          {/* Signal Agreement */}
          <div className="p-4 rounded-lg border border-border bg-card/50">
            <div className="flex items-center gap-2 mb-2">
              <Shield className="w-5 h-5 text-muted-foreground" />
              <span className="text-sm font-medium text-muted-foreground">Signal Agreement</span>
            </div>
            <Badge 
              variant={analysis.signalAgreement === "High" ? "high" : analysis.signalAgreement === "Moderate" ? "medium" : "low"}
            >
              {analysis.signalAgreement}
            </Badge>
          </div>

          {/* Trend Maturity */}
          {analysis.trendMaturity && (
            <div className="p-4 rounded-lg border border-border bg-card/50">
              <div className="flex items-center gap-2 mb-2">
                <Clock className="w-5 h-5 text-muted-foreground" />
                <span className="text-sm font-medium text-muted-foreground">Trend Maturity</span>
              </div>
              <p className="text-sm font-semibold text-foreground">{analysis.trendMaturity}</p>
            </div>
          )}
        </div>
      </div>

      {/* Phase 3: Timeframe Analysis */}
      {analysis.timeframes && (
        <div className="card-gradient rounded-xl border border-border p-5 shadow-lg">
          <div className="flex items-center gap-2 mb-4">
            <Layers className="w-5 h-5 text-primary" />
            <h3 className="font-semibold text-foreground">Timeframe Analysis</h3>
            {analysis.timeframes.conflict.exists && (
              <Badge variant="low" className="ml-2">Conflict Detected</Badge>
            )}
          </div>
          
          <div className="grid md:grid-cols-2 gap-4 mb-4">
            {/* Daily Timeframe */}
            <div className="p-4 rounded-lg border border-border bg-card/50">
              <h4 className="text-sm font-medium text-muted-foreground mb-3">Daily Timeframe</h4>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Bias:</span>
                  <span className={`text-sm font-medium ${getTimeframeBiasColor(analysis.timeframes.daily.directionalBias)}`}>
                    {analysis.timeframes.daily.directionalBias}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Confidence:</span>
                  <span className="text-sm font-medium text-foreground">{analysis.timeframes.daily.confidence}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Maturity:</span>
                  <span className="text-sm font-medium text-foreground">{analysis.timeframes.daily.trendMaturity}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Volatility:</span>
                  <span className="text-sm font-medium text-foreground">{analysis.timeframes.daily.volatility}</span>
                </div>
              </div>
            </div>

            {/* Weekly Timeframe */}
            <div className="p-4 rounded-lg border border-border bg-card/50">
              <h4 className="text-sm font-medium text-muted-foreground mb-3">Weekly Timeframe</h4>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Bias:</span>
                  <span className={`text-sm font-medium ${getTimeframeBiasColor(analysis.timeframes.weekly.directionalBias)}`}>
                    {analysis.timeframes.weekly.directionalBias}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Confidence:</span>
                  <span className="text-sm font-medium text-foreground">{analysis.timeframes.weekly.confidence}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Maturity:</span>
                  <span className="text-sm font-medium text-foreground">{analysis.timeframes.weekly.trendMaturity}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Volatility:</span>
                  <span className="text-sm font-medium text-foreground">{analysis.timeframes.weekly.volatility}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Conflict Description */}
          {analysis.timeframes.conflict.exists && (
            <div className="p-3 rounded-lg bg-neutral/10 border border-neutral/20">
              <div className="flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 text-neutral mt-0.5 flex-shrink-0" />
                <p className="text-sm text-muted-foreground">{analysis.timeframes.conflict.description}</p>
              </div>
            </div>
          )}

          {/* AI Timeframe Analysis */}
          {analysis.timeframeAnalysis && (
            <div className="mt-4 pt-4 border-t border-border">
              <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-line">
                {analysis.timeframeAnalysis}
              </p>
            </div>
          )}
        </div>
      )}

      {/* Supporting & Risk Factors */}
      <div className="grid md:grid-cols-2 gap-4">
        {/* Supporting Factors */}
        <div className="card-gradient rounded-xl border border-border p-5 shadow-lg">
          <div className="flex items-center gap-2 mb-4">
            <CheckCircle2 className="w-5 h-5 text-bullish" />
            <h3 className="font-semibold text-foreground">Supporting Factors</h3>
          </div>
          <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-line">
            {analysis.supportingFactors}
          </p>
        </div>

        {/* Risk Factors */}
        <div className="card-gradient rounded-xl border border-border p-5 shadow-lg">
          <div className="flex items-center gap-2 mb-4">
            <AlertTriangle className="w-5 h-5 text-bearish" />
            <h3 className="font-semibold text-foreground">Risk Factors</h3>
          </div>
          <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-line">
            {analysis.riskFactors}
          </p>
        </div>

        {/* Upgrade Blockers */}
        {analysis.upgradeBlockers && analysis.upgradeBlockers !== "None" && (
          <div className="card-gradient rounded-xl border border-neutral/30 p-5 shadow-lg">
            <div className="flex items-center gap-2 mb-4">
              <Ban className="w-5 h-5 text-neutral" />
              <h3 className="font-semibold text-foreground">Confidence Upgrade Blockers</h3>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-line">
              {analysis.upgradeBlockers}
            </p>
          </div>
        )}
      </div>

      {/* Phase 4: Scenario Analysis */}
      {(analysis.scenarioAnalysis || analysis.scenarios) && (
        <div className="card-gradient rounded-xl border border-primary/20 p-5 shadow-lg">
          <div className="flex items-center gap-2 mb-4">
            <GitBranch className="w-5 h-5 text-primary" />
            <h3 className="font-semibold text-foreground">Scenario Analysis</h3>
          </div>
          
          {analysis.scenarios && (
            <div className="space-y-4 mb-4">
              {/* Bullish Scenario */}
              <div className="p-3 rounded-lg bg-bullish/5 border border-bullish/20">
                <div className="flex items-center gap-2 mb-2">
                  <TrendingUp className="w-4 h-4 text-bullish" />
                  <span className="text-sm font-medium text-bullish">Bullish Scenario</span>
                </div>
                <p className="text-sm text-muted-foreground">{analysis.scenarios.bullishScenario}</p>
              </div>

              {/* Bearish Scenario */}
              <div className="p-3 rounded-lg bg-bearish/5 border border-bearish/20">
                <div className="flex items-center gap-2 mb-2">
                  <TrendingDown className="w-4 h-4 text-bearish" />
                  <span className="text-sm font-medium text-bearish">Bearish Scenario</span>
                </div>
                <p className="text-sm text-muted-foreground">{analysis.scenarios.bearishScenario}</p>
              </div>

              {/* Neutral Scenario */}
              <div className="p-3 rounded-lg bg-neutral/5 border border-neutral/20">
                <div className="flex items-center gap-2 mb-2">
                  <Minus className="w-4 h-4 text-neutral" />
                  <span className="text-sm font-medium text-neutral">Neutral Scenario</span>
                </div>
                <p className="text-sm text-muted-foreground">{analysis.scenarios.neutralScenario}</p>
              </div>
            </div>
          )}

          {/* AI Scenario Analysis */}
          {analysis.scenarioAnalysis && (
            <div className="pt-4 border-t border-border">
              <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-line">
                {analysis.scenarioAnalysis}
              </p>
            </div>
          )}
        </div>
      )}

      {/* Invalidation Triggers */}
      {(analysis.invalidationTriggers || analysis.scenarios?.invalidationTriggers) && (
        <div className="card-gradient rounded-xl border border-neutral/20 p-5 shadow-lg">
          <div className="flex items-center gap-2 mb-3">
            <Target className="w-5 h-5 text-neutral" />
            <h3 className="font-semibold text-foreground">Invalidation Triggers</h3>
          </div>
          {analysis.scenarios?.invalidationTriggers && analysis.scenarios.invalidationTriggers.length > 0 ? (
            <ul className="space-y-2">
              {analysis.scenarios.invalidationTriggers.map((trigger, index) => (
                <li key={index} className="flex items-start gap-2">
                  <span className="text-neutral mt-1">•</span>
                  <span className="text-sm text-muted-foreground">{trigger}</span>
                </li>
              ))}
            </ul>
          ) : analysis.invalidationTriggers ? (
            <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-line">
              {analysis.invalidationTriggers}
            </p>
          ) : null}
        </div>
      )}

      {/* Uncertainty Assessment */}
      <div className="card-gradient rounded-xl border border-neutral/20 p-5 shadow-lg">
        <div className="flex items-center gap-2 mb-3">
          <FileWarning className="w-5 h-5 text-neutral" />
          <h3 className="font-semibold text-foreground">Uncertainty Assessment</h3>
        </div>
        <p className="text-sm text-muted-foreground leading-relaxed">
          {analysis.uncertaintyAssessment}
        </p>
      </div>

      {/* Interpretation Summary */}
      <div className="card-gradient rounded-xl border border-primary/20 p-5 shadow-lg">
        <div className="flex items-center gap-2 mb-3">
          <BarChart3 className="w-5 h-5 text-primary" />
          <h3 className="font-semibold text-foreground">Interpretation Summary</h3>
        </div>
        <p className="text-sm text-foreground/90 leading-relaxed">
          {analysis.interpretationSummary}
        </p>
      </div>

      {/* Disclaimer */}
      <div className="p-4 rounded-lg bg-muted/30 border border-border">
        <p className="text-xs text-muted-foreground text-center">
          <strong>Disclaimer:</strong> This analysis is for informational purposes only and does not constitute financial advice. 
          AI output represents interpretation, not instruction. Scenarios are conditional possibilities, not predictions. Human judgment is always final.
        </p>
      </div>
    </div>
  );
};

export default AnalysisResult;
