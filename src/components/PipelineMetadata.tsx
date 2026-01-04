import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Activity, TrendingUp, BarChart3, Clock, CheckCircle, AlertTriangle } from "lucide-react";

interface PipelineMetadataProps {
  metadata: {
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

const PipelineMetadata = ({ metadata }: PipelineMetadataProps) => {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  return (
    <Card className="card-gradient border-border">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-medium flex items-center gap-2">
          <Activity className="w-4 h-4 text-primary" />
          Pipeline Metadata
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Data Source Info */}
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="text-muted-foreground">Symbol</span>
            <p className="font-medium text-foreground">{metadata.symbol}</p>
          </div>
          <div>
            <span className="text-muted-foreground">Data Points</span>
            <p className="font-medium text-foreground">{metadata.dataPoints} days</p>
          </div>
          <div className="col-span-2">
            <span className="text-muted-foreground flex items-center gap-1">
              <Clock className="w-3 h-3" /> Fetched At
            </span>
            <p className="font-medium text-foreground text-xs">{formatDate(metadata.fetchedAt)}</p>
          </div>
        </div>

        {/* Raw Indicator Values */}
        <div className="border-t border-border pt-3">
          <h4 className="text-xs font-medium text-muted-foreground mb-2 flex items-center gap-1">
            <BarChart3 className="w-3 h-3" /> Raw Indicator Values
          </h4>
          <div className="grid grid-cols-3 gap-2 text-xs">
            <div className="bg-muted/30 rounded p-2">
              <span className="text-muted-foreground">RSI</span>
              <p className="font-mono font-medium text-foreground">{metadata.rawValues.rsi}</p>
            </div>
            <div className="bg-muted/30 rounded p-2">
              <span className="text-muted-foreground">Price</span>
              <p className="font-mono font-medium text-foreground">${metadata.rawValues.currentPrice.toFixed(2)}</p>
            </div>
            <div className="bg-muted/30 rounded p-2">
              <span className="text-muted-foreground">Days in Trend</span>
              <p className="font-mono font-medium text-foreground">{metadata.rawValues.daysInTrend}</p>
            </div>
            <div className="bg-muted/30 rounded p-2">
              <span className="text-muted-foreground">SMA 50</span>
              <p className="font-mono font-medium text-foreground">{metadata.rawValues.sma50}</p>
            </div>
            <div className="bg-muted/30 rounded p-2">
              <span className="text-muted-foreground">SMA 200</span>
              <p className="font-mono font-medium text-foreground">{metadata.rawValues.sma200}</p>
            </div>
            <div className="bg-muted/30 rounded p-2">
              <span className="text-muted-foreground">ATR</span>
              <p className="font-mono font-medium text-foreground">{metadata.rawValues.atr}</p>
            </div>
          </div>
        </div>

        {/* Validation Status */}
        <div className="border-t border-border pt-3">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-medium text-muted-foreground flex items-center gap-1">
              {metadata.validationStatus.isValid ? (
                <CheckCircle className="w-3 h-3 text-green-500" />
              ) : (
                <AlertTriangle className="w-3 h-3 text-yellow-500" />
              )}
              Validation Status
            </h4>
            <Badge 
              variant={metadata.validationStatus.isValid ? "default" : "secondary"}
              className="text-xs"
            >
              {metadata.validationStatus.unknownCount}/13 unknown ({metadata.validationStatus.unknownPercentage}%)
            </Badge>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default PipelineMetadata;
