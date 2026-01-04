import { Activity, Brain } from "lucide-react";

const Header = () => {
  return (
    <header className="border-b border-border bg-card/30 backdrop-blur-sm sticky top-0 z-50">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="p-2.5 rounded-xl bg-primary/10 border border-primary/20">
              <Brain className="w-6 h-6 text-primary" />
            </div>
            <div className="absolute -top-1 -right-1 w-3 h-3 bg-primary rounded-full animate-pulse-slow" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-foreground flex items-center gap-2">
              Market Oracle
              <Activity className="w-4 h-4 text-primary" />
            </h1>
            <p className="text-sm text-muted-foreground">
              AI-Powered Market Interpretation Assistant
            </p>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
