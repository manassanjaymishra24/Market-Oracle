import { BarChart3, TrendingUp, Shield, AlertCircle } from "lucide-react";

const EmptyState = () => {
  const features = [
    {
      icon: TrendingUp,
      title: "Directional Bias",
      description: "Identify market direction based on your data",
    },
    {
      icon: BarChart3,
      title: "Regime Detection",
      description: "Understand current market conditions",
    },
    {
      icon: Shield,
      title: "Confidence Assessment",
      description: "Know when signals agree or conflict",
    },
    {
      icon: AlertCircle,
      title: "Risk Awareness",
      description: "Explicit uncertainty and limitations",
    },
  ];

  return (
    <div className="card-gradient rounded-xl border border-border p-8 shadow-lg animate-fade-in">
      <div className="text-center mb-8">
        <div className="w-16 h-16 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center mx-auto mb-4">
          <BarChart3 className="w-8 h-8 text-primary" />
        </div>
        <h2 className="text-xl font-semibold text-foreground mb-2">
          Ready to Analyze
        </h2>
        <p className="text-muted-foreground max-w-md mx-auto">
          Enter your market data on the left to receive an objective, structured interpretation 
          of market conditions.
        </p>
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        {features.map((feature, index) => (
          <div
            key={index}
            className="p-4 rounded-lg bg-muted/30 border border-border/50 hover:border-primary/30 transition-colors"
          >
            <feature.icon className="w-5 h-5 text-primary mb-2" />
            <h3 className="font-medium text-foreground text-sm mb-1">{feature.title}</h3>
            <p className="text-xs text-muted-foreground">{feature.description}</p>
          </div>
        ))}
      </div>

      <div className="mt-6 p-4 rounded-lg bg-primary/5 border border-primary/10">
        <p className="text-xs text-muted-foreground text-center">
          <strong className="text-foreground">Important:</strong> This tool interprets 
          data you provide. It does not fetch real-time data, predict prices, or give 
          trading instructions.
        </p>
      </div>
    </div>
  );
};

export default EmptyState;
