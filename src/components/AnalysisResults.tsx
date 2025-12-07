// import { useState } from "react";
// import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
// import { Badge } from "@/components/ui/badge";
// import { Button } from "@/components/ui/button";
// import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
// import { AlertTriangle, Clock, MessageSquareText, Mic, Image as ImageIcon, Calendar } from "lucide-react";
// import { format } from "date-fns";
// import { AppointmentBooking } from "@/components/patient/AppointmentBooking";

// interface AnalysisResult {
//   id: string;
//   type: 'text' | 'voice' | 'image';
//   input: string;
//   analysis: {
//     symptoms: string[];
//     severity: 'low' | 'medium' | 'high';
//     recommendations: string[];
//     urgency: boolean;
//   };
//   timestamp: Date;
// }

// interface AnalysisResultsProps {
//   analyses: AnalysisResult[];
// }

// const AnalysisResults = ({ analyses }: AnalysisResultsProps) => {
//   const [showBooking, setShowBooking] = useState(false);
//   const [selectedAnalysis, setSelectedAnalysis] = useState<AnalysisResult | null>(null);

//   if (analyses.length === 0) {
//     return (
//       <Card>
//         <CardContent className="flex flex-col items-center justify-center py-8">
//           <div className="text-center">
//             <h3 className="text-lg font-medium text-muted-foreground mb-2">
//               No Analysis Results Yet
//             </h3>
//             <p className="text-sm text-muted-foreground">
//               Your symptom analyses will appear here
//             </p>
//           </div>
//         </CardContent>
//       </Card>
//     );
//   }

//   const getTypeIcon = (type: string) => {
//     switch (type) {
//       case 'text':
//         return <MessageSquareText className="w-4 h-4" />;
//       case 'voice':
//         return <Mic className="w-4 h-4" />;
//       case 'image':
//         return <ImageIcon className="w-4 h-4" />;
//       default:
//         return null;
//     }
//   };

//   const getSeverityColor = (severity: string) => {
//     switch (severity) {
//       case 'low':
//         return 'bg-success text-success-foreground';
//       case 'medium':
//         return 'bg-warning text-warning-foreground';
//       case 'high':
//         return 'bg-destructive text-destructive-foreground';
//       default:
//         return 'bg-muted text-muted-foreground';
//     }
//   };

//   const shouldShowBooking = (analysis: AnalysisResult) => {
//     const severity = analysis.analysis.severity?.toLowerCase() || '';
//     const recommendations = Array.isArray(analysis.analysis.recommendations) 
//       ? analysis.analysis.recommendations.join(' ').toLowerCase() 
//       : '';
//     const isUrgent = analysis.analysis.urgency || false;
    
//     return isUrgent || 
//            severity === 'high' || 
//            recommendations.includes('see a doctor') ||
//            recommendations.includes('medical attention') ||
//            recommendations.includes('consult');
//   };

//   const handleBookAppointment = (analysis: AnalysisResult) => {
//     setSelectedAnalysis(analysis);
//     setShowBooking(true);
//   };

//   return (
//     <div className="space-y-4">
//       <h2 className="text-2xl font-bold">Analysis Results</h2>
      
//       {analyses.map((result) => (
//         <Card key={result.id} className={`shadow-card ${result.analysis.urgency ? 'border-destructive' : ''}`}>
//           <CardHeader>
//             <div className="flex items-center justify-between">
//               <CardTitle className="flex items-center gap-2">
//                 {getTypeIcon(result.type)}
//                 {result.type.charAt(0).toUpperCase() + result.type.slice(1)} Analysis
//                 {result.analysis.urgency && (
//                   <AlertTriangle className="w-5 h-5 text-destructive" />
//                 )}
//               </CardTitle>
//               <div className="flex items-center gap-2">
//                 <Badge className={getSeverityColor(result.analysis.severity)}>
//                   {result.analysis.severity.toUpperCase()} SEVERITY
//                 </Badge>
//                 <Badge variant="outline" className="flex items-center gap-1">
//                   <Clock className="w-3 h-3" />
//                   {format(result.timestamp, 'MMM d, HH:mm')}
//                 </Badge>
//               </div>
//             </div>
//             <CardDescription>
//               Input: {result.input}
//             </CardDescription>
//           </CardHeader>
          
//           <CardContent className="space-y-4">
//             {result.analysis.urgency && (
//               <div className="p-4 bg-destructive/10 border border-destructive/20 rounded-lg">
//                 <div className="flex items-center gap-2 text-destructive font-medium mb-2">
//                   <AlertTriangle className="w-4 h-4" />
//                   Urgent Medical Attention Required
//                 </div>
//                 <p className="text-sm">
//                   Based on the analysis, it's recommended to seek immediate medical attention.
//                 </p>
//               </div>
//             )}

//             <div className="space-y-3">
//               <div>
//                 <h4 className="font-medium mb-2">Identified Symptoms:</h4>
//                 <div className="flex flex-wrap gap-2">
//                   {result.analysis.symptoms.map((symptom, index) => (
//                     <Badge key={index} variant="secondary">
//                       {symptom}
//                     </Badge>
//                   ))}
//                 </div>
//               </div>

//               <div>
//                 <h4 className="font-medium mb-2">Recommendations:</h4>
//                 <ul className="space-y-1">
//                   {result.analysis.recommendations.map((rec, index) => (
//                     <li key={index} className="text-sm text-muted-foreground flex items-start gap-2">
//                       <span className="w-1 h-1 rounded-full bg-muted-foreground mt-2 flex-shrink-0" />
//                       {rec}
//                     </li>
//                   ))}
//                 </ul>
//               </div>
//             </div>

//             {shouldShowBooking(result) && (
//               <div className="pt-4 border-t">
//                 <Button 
//                   onClick={() => handleBookAppointment(result)}
//                   className="w-full"
//                 >
//                   <Calendar className="w-4 h-4 mr-2" />
//                   Book Appointment with Doctor
//                 </Button>
//               </div>
//             )}
//           </CardContent>
//         </Card>
//       ))}

//       <Dialog open={showBooking} onOpenChange={setShowBooking}>
//         <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
//           <DialogHeader>
//             <DialogTitle>Book an Appointment</DialogTitle>
//           </DialogHeader>
//           <AppointmentBooking 
//             analysisData={selectedAnalysis ? {
//               symptoms: Array.isArray(selectedAnalysis.analysis.symptoms) 
//                 ? selectedAnalysis.analysis.symptoms.join(', ') 
//                 : '',
//               severity: selectedAnalysis.analysis.severity || '',
//               recommendations: Array.isArray(selectedAnalysis.analysis.recommendations)
//                 ? selectedAnalysis.analysis.recommendations.join('\n')
//                 : ''
//             } : undefined}
//             onSuccess={() => setShowBooking(false)}
//           />
//         </DialogContent>
//       </Dialog>
//     </div>
//   );
// };

// export default AnalysisResults;

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { AlertTriangle, Clock, MessageSquareText, Mic, Image as ImageIcon, Calendar, MapPin } from "lucide-react";
import { format } from "date-fns";
import { AppointmentBooking } from "@/components/patient/AppointmentBooking";
import NearbyMedicalHelp from "./NearbyMedicalHelp";

interface SymptomWithConfidence {
  name: string;
  confidence: number;
  source?: string;
}

interface ExtractionStats {
  total_symptoms: number;
  model_extracted: number;
  rule_enhanced: number;
}

interface AnalysisResult {
  id: string;
  type: 'text' | 'voice' | 'image';
  input: string;
  normalizedInput?: string;
  analysis: {
    symptoms: string[];
    symptomsWithConfidence?: SymptomWithConfidence[];
    treatments?: string[];
    severity: 'mild' | 'moderate' | 'urgent' | 'emergency';
    recommendations: string[];
    urgency: boolean;
    entityCount?: number;
    hasEntities?: boolean;
    extractionStats?: ExtractionStats;
  };
  timestamp: Date;
}

interface AnalysisResultsProps {
  analyses: AnalysisResult[];
}

const AnalysisResults = ({ analyses }: AnalysisResultsProps) => {
  const [showBooking, setShowBooking] = useState(false);
  const [selectedAnalysis, setSelectedAnalysis] = useState<AnalysisResult | null>(null);
  const [showNearbyHelp, setShowNearbyHelp] = useState<string | null>(null);

  if (analyses.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <div className="text-center space-y-3">
            <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto">
              <MessageSquareText className="w-8 h-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-medium text-muted-foreground">
              No Analysis Results Yet
            </h3>
            <p className="text-sm text-muted-foreground max-w-sm">
              Your symptom analyses will appear here. Start by describing your symptoms in the input area above.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'text':
        return <MessageSquareText className="w-4 h-4" />;
      case 'voice':
        return <Mic className="w-4 h-4" />;
      case 'image':
        return <ImageIcon className="w-4 h-4" />;
      default:
        return null;
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'mild':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'moderate':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'urgent':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'emergency':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 0.8) return 'bg-green-500';
    if (confidence >= 0.6) return 'bg-yellow-500';
    return 'bg-orange-500';
  };

  const getConfidenceLabel = (confidence: number) => {
    if (confidence >= 0.8) return 'High Confidence';
    if (confidence >= 0.6) return 'Medium Confidence';
    return 'Low Confidence';
  };

  const shouldShowBooking = (analysis: AnalysisResult) => {
    const severity = analysis.analysis.severity?.toLowerCase() || '';
    const recommendations = Array.isArray(analysis.analysis.recommendations) 
      ? analysis.analysis.recommendations.join(' ').toLowerCase() 
      : '';
    const isUrgent = analysis.analysis.urgency || false;
    
    return isUrgent || 
           severity === 'urgent' || 
           severity === 'emergency' ||
           recommendations.includes('see a doctor') ||
           recommendations.includes('medical attention') ||
           recommendations.includes('consult');
  };

  const handleBookAppointment = (analysis: AnalysisResult) => {
    setSelectedAnalysis(analysis);
    setShowBooking(true);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Analysis Results</h2>
        <Badge variant="outline" className="text-sm">
          {analyses.length} {analyses.length === 1 ? 'Analysis' : 'Analyses'}
        </Badge>
      </div>
      
      {analyses.map((result) => (
        <Card 
          key={result.id} 
          className={`shadow-lg transition-all hover:shadow-xl ${
            result.analysis.severity === 'emergency' || result.analysis.severity === 'urgent'
              ? 'border-red-500 border-2' 
              : ''
          }`}
        >
          <CardHeader>
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <CardTitle className="flex items-center gap-2 mb-2">
                  {getTypeIcon(result.type)}
                  {result.type.charAt(0).toUpperCase() + result.type.slice(1)} Analysis
                  {result.analysis.urgency && (
                    <AlertTriangle className="w-5 h-5 text-red-600 animate-pulse" />
                  )}
                </CardTitle>
                
                <CardDescription className="space-y-2">
                  <div>
                    <span className="font-medium">Original Input:</span>
                    <p className="text-sm mt-1">{result.input}</p>
                  </div>
                </CardDescription>
              </div>
              
              <div className="flex flex-col gap-2 items-end">
                <Badge className={`${getSeverityColor(result.analysis.severity)} border`}>
                  {result.analysis.severity.toUpperCase()} SEVERITY
                </Badge>
                <Badge variant="outline" className="flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {format(result.timestamp, 'MMM d, HH:mm')}
                </Badge>
                {result.analysis.entityCount !== undefined && (
                  <Badge variant="outline" className="flex items-center gap-1">
                    {result.analysis.entityCount} {result.type === 'image' ? 'predictions' : 'entities'}
                  </Badge>
                )}
              </div>
            </div>
          </CardHeader>
          
          <CardContent className="space-y-6">
            {/* Urgent Warning */}
            {(result.analysis.severity === 'emergency' || result.analysis.severity === 'urgent') && (
              <div className={`p-4 rounded-lg border-2 ${
                result.analysis.severity === 'emergency' 
                  ? 'bg-red-50 border-red-500' 
                  : 'bg-orange-50 border-orange-500'
              }`}>
                <div className={`flex items-center gap-2 font-semibold mb-2 ${
                  result.analysis.severity === 'emergency' ? 'text-red-700' : 'text-orange-700'
                }`}>
                  <AlertTriangle className="w-5 h-5 animate-pulse" />
                  {result.analysis.severity === 'emergency' 
                    ? '🚨 EMERGENCY - Seek Immediate Care' 
                    : '⚠️ Urgent Medical Attention Required'}
                </div>
                <p className={`text-sm ${
                  result.analysis.severity === 'emergency' ? 'text-red-600' : 'text-orange-600'
                }`}>
                  {result.analysis.severity === 'emergency'
                    ? 'Call 911 or go to the nearest emergency room immediately. Do not delay - this could be life-threatening.'
                    : result.type === 'image'
                    ? 'Consult a dermatologist within 24-48 hours. This condition requires professional evaluation.'
                    : 'Contact your healthcare provider within 24 hours or visit urgent care if doctor is unavailable.'}
                </p>
              </div>
            )}

            {/* Symptoms/Conditions with Confidence Scores */}
            <div className="space-y-3">
              <h4 className="font-semibold text-lg flex items-center gap-2">
                <span className="w-1 h-6 bg-primary rounded-full" />
                {result.type === 'image' ? 'Detected Conditions' : 'Identified Symptoms'}
                {result.analysis.symptomsWithConfidence && (
                  <span className="text-sm text-muted-foreground font-normal">
                    ({result.analysis.symptomsWithConfidence.length})
                  </span>
                )}
              </h4>
              
              {result.analysis.symptomsWithConfidence && result.analysis.symptomsWithConfidence.length > 0 ? (
                <div className="space-y-3">
                  {result.analysis.symptomsWithConfidence.map((item, index) => (
                    <div key={index} className="p-3 bg-muted/50 rounded-lg space-y-2">
                      <div className="flex justify-between items-center">
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-sm capitalize">{item.name}</span>
                          {result.type === 'image' && index === 0 && (
                            <Badge variant="default" className="text-xs bg-blue-600">
                              Most Likely
                            </Badge>
                          )}
                          {result.type === 'image' && index > 0 && index < 3 && (
                            <Badge variant="outline" className="text-xs">
                              Alternative #{index + 1}
                            </Badge>
                          )}
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-muted-foreground">
                            {getConfidenceLabel(item.confidence)}
                          </span>
                          <Badge variant="outline" className="text-xs">
                            {(item.confidence * 100).toFixed(0)}%
                          </Badge>
                        </div>
                      </div>
                      
                      {/* Progress bar */}
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className={`h-2 rounded-full transition-all ${getConfidenceColor(item.confidence)}`}
                          style={{ width: `${item.confidence * 100}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {result.analysis.symptoms.length > 0 ? (
                    result.analysis.symptoms.map((symptom, index) => (
                      <Badge key={index} variant="secondary" className="text-sm py-1 px-3">
                        {symptom}
                      </Badge>
                    ))
                  ) : (
                    <p className="text-sm text-muted-foreground">
                      {result.type === 'image' ? 'No conditions detected' : 'No symptoms detected'}
                    </p>
                  )}
                </div>
              )}
            </div>

            {/* Care Tips / Treatments */}
            {result.analysis.treatments && result.analysis.treatments.length > 0 && (
              <div className="space-y-3">
                <h4 className="font-semibold text-lg flex items-center gap-2">
                  <span className="w-1 h-6 bg-blue-500 rounded-full" />
                  {result.type === 'image' ? 'Care Tips' : 'Care Tips & Recommendations'}
                  <span className="text-sm text-muted-foreground font-normal">
                    ({result.analysis.treatments.length})
                  </span>
                </h4>
                <div className="space-y-2">
                  {result.analysis.treatments.map((treatment, index) => (
                    <div 
                      key={index} 
                      className="flex items-start gap-3 p-3 bg-blue-50 rounded-lg border border-blue-100"
                    >
                      <div className="w-6 h-6 rounded-full bg-blue-500 text-white flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">
                        {index + 1}
                      </div>
                      <p className="text-sm text-gray-700 flex-1">{treatment}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Medical Recommendations */}
            <div className="space-y-3">
              <h4 className="font-semibold text-lg flex items-center gap-2">
                <span className="w-1 h-6 bg-purple-500 rounded-full" />
                Medical Recommendations
              </h4>
              
              {result.analysis.recommendations.length > 0 ? (
                <div className="space-y-2">
                  {result.analysis.recommendations.map((rec, index) => (
                    <div 
                      key={index} 
                      className="flex items-start gap-3 p-3 bg-purple-50 rounded-lg border border-purple-100"
                    >
                      <div className="w-6 h-6 rounded-full bg-purple-500 text-white flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">
                        {index + 1}
                      </div>
                      <p className="text-sm text-gray-700 flex-1">{rec}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground italic">
                  General check-up recommended
                </p>
              )}
            </div>

            {/* Find Nearby Medical Help */}
            {(result.analysis.severity === 'emergency' || 
              result.analysis.severity === 'urgent' || 
              result.analysis.severity === 'moderate') && (
              <div className="space-y-3">
                {showNearbyHelp === result.id ? (
                  <NearbyMedicalHelp
                    severity={result.analysis.severity}
                    onClose={() => setShowNearbyHelp(null)}
                  />
                ) : (
                  <Button
                    onClick={() => setShowNearbyHelp(result.id)}
                    className="w-full"
                    variant={result.analysis.severity === 'emergency' ? 'destructive' : 'default'}
                    size="lg"
                  >
                    <MapPin className="w-4 h-4 mr-2" />
                    {result.analysis.severity === 'emergency'
                      ? '🚨 Find Nearest Emergency Hospital'
                      : '🏥 Find Nearby Medical Clinics'}
                  </Button>
                )}
              </div>
            )}

            {/* Book Appointment */}
            {shouldShowBooking(result) && (
              <div className="pt-4 border-t">
                <Button 
                  onClick={() => handleBookAppointment(result)}
                  className="w-full"
                  variant="outline"
                  size="lg"
                >
                  <Calendar className="w-4 h-4 mr-2" />
                  Book Appointment with Doctor
                </Button>
              </div>
            )}

            {/* Disclaimer */}
            <div className="pt-4 border-t">
              <p className="text-xs text-muted-foreground italic">
                ⚕️ <strong>Disclaimer:</strong> This analysis is for informational purposes only and should not replace professional medical advice. 
                {result.type === 'image' 
                  ? ' Always consult a qualified dermatologist for accurate diagnosis and treatment of skin conditions.'
                  : ' Please consult with a qualified healthcare provider for accurate diagnosis and treatment.'
                }
              </p>
            </div>
          </CardContent>
        </Card>
      ))}

      <Dialog open={showBooking} onOpenChange={setShowBooking}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Book an Appointment</DialogTitle>
          </DialogHeader>
          <AppointmentBooking 
            analysisData={selectedAnalysis ? {
              symptoms: Array.isArray(selectedAnalysis.analysis.symptoms) 
                ? selectedAnalysis.analysis.symptoms.join(', ') 
                : '',
              severity: selectedAnalysis.analysis.severity || '',
              recommendations: Array.isArray(selectedAnalysis.analysis.recommendations)
                ? selectedAnalysis.analysis.recommendations.join('\n')
                : ''
            } : undefined}
            onSuccess={() => setShowBooking(false)}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AnalysisResults;