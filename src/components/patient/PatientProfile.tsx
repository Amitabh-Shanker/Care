import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  User, 
  Calendar, 
  Pill, 
  AlertTriangle, 
  Heart, 
  Activity,
  FileText,
  Clock,
  TrendingUp
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { format } from "date-fns";
import { motion } from "framer-motion";
import { useInView } from "react-intersection-observer";

interface QuestionnaireData {
  age: number | null;
  gender: string | null;
  chronic_conditions: string | null;
  medications: string | null;
  allergies: string | null;
  primary_concern: string | null;
  recent_travel: string | null;
  past_surgeries: string | null;
  substance_use: string | null;
  created_at: string;
}

interface Diagnosis {
  id: string;
  symptoms: string[];
  diseases: Array<{ name: string; score?: number; confidence?: number }>;
  severity: string;
  recommendations: string[];
  care_tips: string[] | null;
  analysis_type: string;
  input_text?: string | null;
  created_at: string;
}

const AnimatedCard = ({ children, delay = 0 }: { children: React.ReactNode; delay?: number }) => {
  const [ref, inView] = useInView({ triggerOnce: true, threshold: 0.1 });
  
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 20 }}
      animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
      transition={{ duration: 0.5, delay }}
    >
      {children}
    </motion.div>
  );
};

export const PatientProfile = () => {
  const { user } = useAuth();
  const [questionnaire, setQuestionnaire] = useState<QuestionnaireData | null>(null);
  const [diagnoses, setDiagnoses] = useState<Diagnosis[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchProfileData();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const fetchProfileData = async () => {
    if (!user) return;

    setIsLoading(true);
    try {
      // Fetch questionnaire
      const { data: qData, error: qError } = await supabase
        .from("patient_questionnaire")
        .select("*")
        .eq("patient_id", user.id)
        .maybeSingle();

      if (qError && qError.code !== 'PGRST116') {
        console.error("Error fetching questionnaire:", qError);
      } else {
        setQuestionnaire(qData);
      }

      // Fetch diagnoses
      const { data: dData, error: dError } = await supabase
        .from("patient_diagnoses" as any)
        .select("*")
        .eq("patient_id", user.id)
        .order("created_at", { ascending: false })
        .limit(20);

      if (dError) {
        console.error("Error fetching diagnoses:", dError);
      } else {
        setDiagnoses((dData as unknown as Diagnosis[]) || []);
      }
    } catch (error) {
      console.error("Error fetching profile data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "emergency": return "destructive";
      case "urgent": return "destructive";
      case "moderate": return "default";
      case "mild": return "secondary";
      default: return "secondary";
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
        >
          <Activity className="w-8 h-8 text-primary" />
        </motion.div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Medical History Section */}
      <AnimatedCard>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Heart className="w-5 h-5 text-primary" />
              Medical History Overview
            </CardTitle>
            <CardDescription>
              Your complete medical history and health information
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {questionnaire ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {questionnaire.age && (
                  <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                    <Calendar className="w-5 h-5 text-primary" />
                    <div>
                      <p className="text-sm font-medium">Age</p>
                      <p className="text-2xl font-bold">{questionnaire.age} years</p>
                    </div>
                  </div>
                )}
                {questionnaire.gender && (
                  <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                    <User className="w-5 h-5 text-primary" />
                    <div>
                      <p className="text-sm font-medium">Gender</p>
                      <p className="text-2xl font-bold">{questionnaire.gender}</p>
                    </div>
                  </div>
                )}
                {questionnaire.chronic_conditions && (
                  <div className="md:col-span-2 p-4 rounded-lg border border-orange-200 bg-orange-50/50">
                    <div className="flex items-start gap-3">
                      <AlertTriangle className="w-5 h-5 text-orange-600 mt-0.5" />
                      <div className="flex-1">
                        <p className="text-sm font-medium text-orange-900 mb-1">Chronic Conditions</p>
                        <p className="text-sm text-orange-800">{questionnaire.chronic_conditions}</p>
                      </div>
                    </div>
                  </div>
                )}
                {questionnaire.medications && (
                  <div className="md:col-span-2 p-4 rounded-lg border border-blue-200 bg-blue-50/50">
                    <div className="flex items-start gap-3">
                      <Pill className="w-5 h-5 text-blue-600 mt-0.5" />
                      <div className="flex-1">
                        <p className="text-sm font-medium text-blue-900 mb-1">Current Medications</p>
                        <p className="text-sm text-blue-800">{questionnaire.medications}</p>
                      </div>
                    </div>
                  </div>
                )}
                {questionnaire.allergies && (
                  <div className="md:col-span-2 p-4 rounded-lg border border-red-200 bg-red-50/50">
                    <div className="flex items-start gap-3">
                      <AlertTriangle className="w-5 h-5 text-red-600 mt-0.5" />
                      <div className="flex-1">
                        <p className="text-sm font-medium text-red-900 mb-1">Allergies</p>
                        <p className="text-sm text-red-800">{questionnaire.allergies}</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <FileText className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>No medical history available</p>
                <p className="text-sm mt-2">Complete the questionnaire to add your medical history</p>
              </div>
            )}
          </CardContent>
        </Card>
      </AnimatedCard>

      {/* Diagnoses Section */}
      <AnimatedCard delay={0.2}>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="w-5 h-5 text-primary" />
              Diagnosis History
            </CardTitle>
            <CardDescription>
              Your past symptom analysis results and diagnoses
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {diagnoses.length === 0 ? (
              <div className="text-center py-12">
                <Activity className="w-12 h-12 mx-auto mb-4 text-muted-foreground opacity-50" />
                <p className="text-muted-foreground">No diagnoses recorded yet</p>
                <p className="text-sm text-muted-foreground mt-2">
                  Your symptom analysis results will appear here
                </p>
              </div>
            ) : (
              diagnoses.map((diagnosis, index) => (
                <AnimatedCard key={diagnosis.id} delay={index * 0.1}>
                  <Card className="overflow-hidden border-l-4 border-l-primary">
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between">
                        <div>
                          <CardTitle className="text-lg flex items-center gap-2">
                            <TrendingUp className="w-5 h-5 text-primary" />
                            {diagnosis.analysis_type.charAt(0).toUpperCase() + diagnosis.analysis_type.slice(1)} Analysis
                          </CardTitle>
                          <CardDescription className="flex items-center gap-2 mt-1">
                            <Clock className="w-3 h-3" />
                            {format(new Date(diagnosis.created_at), "MMM dd, yyyy 'at' h:mm a")}
                          </CardDescription>
                        </div>
                        <Badge variant={getSeverityColor(diagnosis.severity)}>
                          {diagnosis.severity}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {diagnosis.symptoms && diagnosis.symptoms.length > 0 && (
                        <div>
                          <p className="text-sm font-medium mb-2">Symptoms Detected:</p>
                          <div className="flex flex-wrap gap-2">
                            {diagnosis.symptoms.map((symptom, idx) => (
                              <Badge key={idx} variant="secondary">
                                {symptom}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}
                      {diagnosis.diseases && diagnosis.diseases.length > 0 && (
                        <div>
                          <p className="text-sm font-medium mb-2">Possible Conditions:</p>
                          <div className="space-y-1">
                            {diagnosis.diseases.slice(0, 5).map((disease, idx: number) => (
                              <div key={idx} className="flex items-center justify-between p-2 rounded bg-muted/50">
                                <span className="text-sm">{disease.name}</span>
                                <Badge variant="outline" className="text-xs">
                                  Score: {disease.score || disease.confidence || 'N/A'}
                                </Badge>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                      {diagnosis.recommendations && diagnosis.recommendations.length > 0 && (
                        <div>
                          <p className="text-sm font-medium mb-2">Recommendations:</p>
                          <ul className="space-y-1">
                            {diagnosis.recommendations.map((rec, idx) => (
                              <li key={idx} className="text-sm text-muted-foreground flex items-start gap-2">
                                <span className="w-1.5 h-1.5 rounded-full bg-primary mt-2 flex-shrink-0" />
                                {rec}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </AnimatedCard>
              ))
            )}
          </CardContent>
        </Card>
      </AnimatedCard>

      {/* Questionnaire Section */}
      <AnimatedCard delay={0.4}>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="w-5 h-5 text-primary" />
              Questionnaire Details
            </CardTitle>
            <CardDescription>
              Your health questionnaire responses
            </CardDescription>
          </CardHeader>
          <CardContent>
            {questionnaire ? (
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {questionnaire.age && (
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Age</p>
                      <p className="text-lg">{questionnaire.age} years</p>
                    </div>
                  )}
                  {questionnaire.gender && (
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Gender</p>
                      <p className="text-lg">{questionnaire.gender}</p>
                    </div>
                  )}
                  {questionnaire.primary_concern && (
                    <div className="md:col-span-2">
                      <p className="text-sm font-medium text-muted-foreground">Primary Concern</p>
                      <p className="text-lg">{questionnaire.primary_concern}</p>
                    </div>
                  )}
                  {questionnaire.chronic_conditions && (
                    <div className="md:col-span-2">
                      <p className="text-sm font-medium text-muted-foreground">Chronic Conditions</p>
                      <p className="text-lg">{questionnaire.chronic_conditions}</p>
                    </div>
                  )}
                  {questionnaire.medications && (
                    <div className="md:col-span-2">
                      <p className="text-sm font-medium text-muted-foreground">Medications</p>
                      <p className="text-lg">{questionnaire.medications}</p>
                    </div>
                  )}
                  {questionnaire.allergies && (
                    <div className="md:col-span-2">
                      <p className="text-sm font-medium text-muted-foreground">Allergies</p>
                      <p className="text-lg">{questionnaire.allergies}</p>
                    </div>
                  )}
                  {questionnaire.past_surgeries && (
                    <div className="md:col-span-2">
                      <p className="text-sm font-medium text-muted-foreground">Past Surgeries</p>
                      <p className="text-lg">{questionnaire.past_surgeries}</p>
                    </div>
                  )}
                  {questionnaire.substance_use && (
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Substance Use</p>
                      <p className="text-lg">{questionnaire.substance_use}</p>
                    </div>
                  )}
                  {questionnaire.recent_travel && (
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Recent Travel</p>
                      <p className="text-lg">{questionnaire.recent_travel}</p>
                    </div>
                  )}
                </div>
                <div className="pt-4 border-t">
                  <p className="text-xs text-muted-foreground">
                    Completed on {format(new Date(questionnaire.created_at), "MMMM dd, yyyy 'at' h:mm a")}
                  </p>
                </div>
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <User className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>No questionnaire data available</p>
              </div>
            )}
          </CardContent>
        </Card>
      </AnimatedCard>
    </div>
  );
};
