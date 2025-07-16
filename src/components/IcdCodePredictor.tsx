import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { Brain, Search, CheckCircle, Clock, AlertCircle } from "lucide-react";

// Sample dataset matching your requirements
const sampleData = [
  { diagnosis: "Type 2 diabetes mellitus", code: "E11.9" },
  { diagnosis: "Essential hypertension", code: "I10" },
  { diagnosis: "Acute bronchitis", code: "J20.9" },
  { diagnosis: "Migraine", code: "G43.9" },
  { diagnosis: "Chronic kidney disease", code: "N18.9" },
  { diagnosis: "Asthma", code: "J45.9" },
];

interface PredictionResult {
  code: string;
  confidence: number;
  description: string;
}

const IcdCodePredictor = () => {
  const [diagnosisText, setDiagnosisText] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [prediction, setPrediction] = useState<PredictionResult | null>(null);
  const { toast } = useToast();

  // Mock ML prediction function
  const predictIcdCode = (input: string): PredictionResult => {
    const normalizedInput = input.toLowerCase().trim();
    
    // Find the best match based on keyword similarity
    let bestMatch = { code: "Z00.00", confidence: 0.3, description: "General medical examination" };
    
    for (const sample of sampleData) {
      const sampleWords = sample.diagnosis.toLowerCase().split(" ");
      const inputWords = normalizedInput.split(" ");
      
      let matchCount = 0;
      sampleWords.forEach(word => {
        if (inputWords.some(inputWord => inputWord.includes(word) || word.includes(inputWord))) {
          matchCount++;
        }
      });
      
      const confidence = Math.min(0.95, (matchCount / sampleWords.length) * 0.9 + 0.1);
      
      if (confidence > bestMatch.confidence) {
        bestMatch = {
          code: sample.code,
          confidence,
          description: sample.diagnosis
        };
      }
    }
    
    return bestMatch;
  };

  const handlePredict = async () => {
    if (!diagnosisText.trim()) {
      toast({
        title: "Please enter diagnosis text",
        description: "Enter a medical diagnosis to get ICD-10 code prediction.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    
    // Simulate API call delay
    setTimeout(() => {
      const result = predictIcdCode(diagnosisText);
      setPrediction(result);
      setIsLoading(false);
      
      toast({
        title: "Prediction Complete",
        description: `ICD-10 code predicted with ${(result.confidence * 100).toFixed(1)}% confidence.`,
      });
    }, 1500);
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 0.8) return "success";
    if (confidence >= 0.6) return "warning";
    return "destructive";
  };

  const getConfidenceIcon = (confidence: number) => {
    if (confidence >= 0.8) return <CheckCircle className="h-4 w-4" />;
    if (confidence >= 0.6) return <Clock className="h-4 w-4" />;
    return <AlertCircle className="h-4 w-4" />;
  };

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="text-center space-y-4">
        <div className="flex items-center justify-center space-x-3">
          <div className="p-3 bg-gradient-primary rounded-full">
            <Brain className="h-8 w-8 text-primary-foreground" />
          </div>
          <h1 className="text-3xl font-bold bg-gradient-primary bg-clip-text text-transparent">
            ICD-10 Code Predictor
          </h1>
        </div>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          AI-powered tool for automating health insurance claim processing by predicting ICD-10 codes from medical diagnosis text.
        </p>
      </div>

      {/* Input Section */}
      <Card className="shadow-card">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Search className="h-5 w-5 text-primary" />
            <span>Enter Medical Diagnosis</span>
          </CardTitle>
          <CardDescription>
            Type a medical diagnosis to get the corresponding ICD-10 code prediction.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="diagnosis">Diagnosis Text</Label>
            <Input
              id="diagnosis"
              placeholder="e.g., Type 2 diabetes mellitus, Essential hypertension..."
              value={diagnosisText}
              onChange={(e) => setDiagnosisText(e.target.value)}
              className="min-h-[100px] text-base"
            />
          </div>
          
          <Button 
            onClick={handlePredict}
            disabled={isLoading}
            className="w-full"
            variant="medical"
            size="lg"
          >
            {isLoading ? (
              <>
                <div className="animate-spin h-4 w-4 border-2 border-current border-t-transparent rounded-full" />
                Processing...
              </>
            ) : (
              <>
                <Brain className="h-4 w-4" />
                Predict ICD-10 Code
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Results Section */}
      {prediction && (
        <Card className="shadow-card animate-pulse-glow">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              {getConfidenceIcon(prediction.confidence)}
              <span>Prediction Results</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Main Result */}
            <div className="text-center space-y-4 p-6 bg-gradient-subtle rounded-lg">
              <div className="space-y-2">
                <div className="text-4xl font-bold text-primary">
                  {prediction.code}
                </div>
                <div className="text-lg text-muted-foreground">
                  {prediction.description}
                </div>
              </div>
            </div>

            {/* Confidence Score */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label className="text-sm font-medium">Confidence Score</Label>
                <Badge variant={getConfidenceColor(prediction.confidence)}>
                  {(prediction.confidence * 100).toFixed(1)}%
                </Badge>
              </div>
              <Progress 
                value={prediction.confidence * 100} 
                className="h-2"
              />
            </div>

            {/* Confidence Interpretation */}
            <div className="p-4 rounded-lg bg-muted/50">
              <div className="text-sm">
                <strong>Confidence Interpretation:</strong>
                {prediction.confidence >= 0.8 && (
                  <span className="ml-2 text-success">High confidence - Ready for automated processing</span>
                )}
                {prediction.confidence >= 0.6 && prediction.confidence < 0.8 && (
                  <span className="ml-2 text-warning">Medium confidence - Consider manual review</span>
                )}
                {prediction.confidence < 0.6 && (
                  <span className="ml-2 text-destructive">Low confidence - Manual review required</span>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Sample Data Reference */}
      <Card className="shadow-card">
        <CardHeader>
          <CardTitle className="text-lg">Sample Training Data</CardTitle>
          <CardDescription>
            This demo uses the following sample dataset for prediction
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3">
            {sampleData.map((item, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                <span className="text-sm">{item.diagnosis}</span>
                <Badge variant="outline">{item.code}</Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Integration Info */}
      <Card className="shadow-card border-primary/20">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2 text-primary">
            <Brain className="h-5 w-5" />
            <span>Python Backend Integration</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm text-muted-foreground">
          <p>
            This React frontend is ready to integrate with your Python ML backend using:
          </p>
          <ul className="list-disc list-inside space-y-1 ml-4">
            <li><strong>Flask API endpoint:</strong> POST /predict-icd</li>
            <li><strong>Input:</strong> JSON with diagnosis text</li>
            <li><strong>Output:</strong> JSON with predicted code and confidence</li>
            <li><strong>Technologies:</strong> scikit-learn, spaCy, joblib</li>
          </ul>
          <p className="pt-2 text-xs">
            Deploy your Python backend separately and update the API endpoints in this frontend.
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default IcdCodePredictor;