import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  User, 
  Calendar, 
  Pill, 
  AlertTriangle, 
  Heart, 
  Activity,
  FileText,
  Clock,
  TrendingUp,
  Stethoscope,
  History
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";
import { motion } from "framer-motion";
import { useInView } from "react-intersection-observer";

interface PatientHistoryViewProps {
  patientId: string;
  patientName: string;
}

interface QuestionnaireData {
  age: number | null;
  gender: string | null;
  chronic_conditions: string | null;
  medications: string | null;
  allergies: string | null;
  primary_concern: string | null;
  issue_duration: string | null;
  pain_level: number | null;
  recent_travel: string | null;
  past_surgeries: string | null;
  substance_use: string | null;
  created_at: string;
}

interface Diagnosis {
  id: string;
  symptoms: string[];
  diseases: any[];
  severity: string;
  recommendations: string[];
  care_tips: string[] | null;
  analysis_type: string;
  input_text: string | null;
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

export const PatientHistoryView = ({ patientId, patientName }: PatientHistoryViewProps) => {
  const [questionnaire, setQuestionnaire] = useState<QuestionnaireData | null>(null);
  const [diagnoses, setDiagnoses] = useState<Diagnosis[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchPatientData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [patientId]);

  const fetchPatientData = async () => {
    setIsLoading(true);
    try {
      // Fetch questionnaire
      const { data: qData, error: qError } = await supabase
        .from("patient_questionnaire")
        .select("*")
        .eq("patient_id", patientId)
        .maybeSingle();

      if (qError && qError.code !== 'PGRST116') {
        console.error("Error fetching questionnaire:", qError);
      } else {
        setQuestionnaire(qData);
      }

      // Fetch diagnoses
      const { data: dData, error: dError } = await supabase
        .from("patient_diagnoses")
        .select("*")
        .eq("patient_id", patientId)
        .order("created_at", { ascending: false })
        .limit(50);

      if (dError) {
        console.error("Error fetching diagnoses:", dError);
      } else {
        setDiagnoses(dData || []);
      }
    } catch (error) {
      console.error("Error fetching patient data:", error);
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
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-6"
      >
        <h2 className="text-2xl font-bold mb-2 flex items-center gap-2">
          <User className="w-6 h-6 text-primary" />
          Patient History: {patientName}
        </h2>
        <p className="text-muted-foreground">
          Complete medical history and diagnosis records
        </p>
      </motion.div>

      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="overview">
            <History className="w-4 h-4 mr-2" />
            Overview
          </TabsTrigger>
          <TabsTrigger value="diagnoses">
            <Activity className="w-4 h-4 mr-2" />
            Diagnoses ({diagnoses.length})
          </TabsTrigger>
          <TabsTrigger value="questionnaire">
            <FileText className="w-4 h-4 mr-2" />
            Questionnaire
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <AnimatedCard>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Heart className="w-5 h-5 text-primary" />
                  Medical History Summary
                </CardTitle>
                <CardDescription>
                  Key medical information for {patientName}
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
                    {questionnaire.past_surgeries && (
                      <div className="md:col-span-2 p-4 rounded-lg border border-purple-200 bg-purple-50/50">
                        <div className="flex items-start gap-3">
                          <Stethoscope className="w-5 h-5 text-purple-600 mt-0.5" />
                          <div className="flex-1">
                            <p className="text-sm font-medium text-purple-900 mb-1">Past Surgeries</p>
                            <p className="text-sm text-purple-800">{questionnaire.past_surgeries}</p>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <FileText className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>No medical history available</p>
                  </div>
                )}

                {diagnoses.length > 0 && (
                  <div className="mt-6 pt-6 border-t">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-semibold flex items-center gap-2">
                        <TrendingUp className="w-5 h-5 text-primary" />
                        Recent Diagnoses
                      </h3>
                      <Badge variant="secondary">{diagnoses.length} total</Badge>
                    </div>
                    <div className="space-y-2">
                      {diagnoses.slice(0, 3).map((diagnosis) => (
                        <div key={diagnosis.id} className="p-3 rounded-lg bg-muted/30 border border-muted">
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-sm font-medium">
                              {diagnosis.analysis_type.charAt(0).toUpperCase() + diagnosis.analysis_type.slice(1)} Analysis
                            </span>
                            <Badge variant={getSeverityColor(diagnosis.severity)} className="text-xs">
                              {diagnosis.severity}
                            </Badge>
                          </div>
                          <p className="text-xs text-muted-foreground">
                            {format(new Date(diagnosis.created_at), "MMM dd, yyyy")}
                          </p>
                          {diagnosis.diseases && diagnosis.diseases.length > 0 && (
                            <p className="text-xs mt-1 text-muted-foreground">
                              Conditions: {diagnosis.diseases.slice(0, 2).map((d: any) => d.name).join(", ")}
                              {diagnosis.diseases.length > 2 && "..."}
                            </p>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </AnimatedCard>
        </TabsContent>

        <TabsContent value="diagnoses" className="space-y-4">
          {diagnoses.length === 0 ? (
            <AnimatedCard>
              <Card>
                <CardContent className="py-12 text-center">
                  <Activity className="w-12 h-12 mx-auto mb-4 text-muted-foreground opacity-50" />
                  <p className="text-muted-foreground">No diagnoses recorded</p>
                </CardContent>
              </Card>
            </AnimatedCard>
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
                    {diagnosis.input_text && (
                      <div className="p-3 rounded-lg bg-muted/30">
                        <p className="text-xs font-medium text-muted-foreground mb-1">Input:</p>
                        <p className="text-sm">{diagnosis.input_text}</p>
                      </div>
                    )}
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
                          {diagnosis.diseases.slice(0, 5).map((disease: any, idx: number) => (
                            <div key={idx} className="flex items-center justify-between p-2 rounded bg-muted/50">
                              <span className="text-sm">{disease.name}</span>
                              <Badge variant="outline" className="text-xs">
                                {disease.score || disease.confidence || 'N/A'}
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
        </TabsContent>

        <TabsContent value="questionnaire" className="space-y-4">
          <AnimatedCard>
            <Card>
              <CardHeader>
                <CardTitle>Questionnaire Details</CardTitle>
                <CardDescription>
                  Patient health questionnaire responses
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
                      {questionnaire.issue_duration && (
                        <div>
                          <p className="text-sm font-medium text-muted-foreground">Issue Duration</p>
                          <p className="text-lg">{questionnaire.issue_duration}</p>
                        </div>
                      )}
                      {questionnaire.pain_level !== null && (
                        <div>
                          <p className="text-sm font-medium text-muted-foreground">Pain Level</p>
                          <p className="text-lg">{questionnaire.pain_level}/10</p>
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
        </TabsContent>
      </Tabs>
    </div>
  );
};

