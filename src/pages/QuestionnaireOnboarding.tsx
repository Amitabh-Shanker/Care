import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { 
  Loader2, 
  Heart, 
  User, 
  Calendar, 
  Pill, 
  AlertTriangle, 
  FileText, 
  Activity,
  Plane,
  Stethoscope,
  Wine,
  MessageCircle,
  ChevronLeft,
  ChevronRight,
  Sparkles
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";

const QuestionnaireOnboarding = () => {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [loading, setLoading] = useState(false);
  const [checking, setChecking] = useState(true);
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    const checkExistingQuestionnaire = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        
        if (!user) {
          navigate('/patient-auth');
          return;
        }

        const { data, error } = await supabase
          .from('patient_questionnaire')
          .select('id')
          .eq('patient_id', user.id)
          .maybeSingle();

        if (data) {
          // Questionnaire already completed, redirect to dashboard
          navigate('/patient-dashboard');
        }
      } catch (error) {
        console.error('Error checking questionnaire:', error);
      } finally {
        setChecking(false);
      }
    };

    checkExistingQuestionnaire();
  }, [navigate]);

  const [answers, setAnswers] = useState({
    age: "",
    gender: "",
    chronic_conditions: "",
    medications: "",
    allergies: "",
    primary_concern: "",
    recent_travel: "",
    past_surgeries: "",
    substance_use: "",
    doctor_contact_preference: ""
  });

  const questions = [
    {
      id: "age",
      question: "What is your age?",
      type: "number",
      placeholder: "Enter your age",
      icon: Calendar
    },
    {
      id: "gender",
      question: "What is your gender?",
      type: "radio",
      options: ["Male", "Female", "Other", "Prefer not to say"],
      icon: User
    },
    {
      id: "chronic_conditions",
      question: "Do you have any chronic medical conditions?",
      type: "textarea",
      placeholder: "e.g., Diabetes, Hypertension, Asthma (or type 'None')",
      icon: Activity
    },
    {
      id: "medications",
      question: "Are you currently taking any medications?",
      type: "textarea",
      placeholder: "List medications or type 'None'",
      icon: Pill
    },
    {
      id: "allergies",
      question: "Do you have any allergies?",
      type: "textarea",
      placeholder: "List allergies or type 'None'",
      icon: AlertTriangle
    },
    {
      id: "primary_concern",
      question: "What is your primary health concern?",
      type: "textarea",
      placeholder: "Describe your main health concern",
      icon: Heart
    },
    {
      id: "recent_travel",
      question: "Have you traveled recently?",
      type: "textarea",
      placeholder: "Describe recent travel or type 'None'",
      icon: Plane
    },
    {
      id: "past_surgeries",
      question: "Do you have any past surgeries or major health events?",
      type: "textarea",
      placeholder: "List past surgeries or type 'None'",
      icon: Stethoscope
    },
    {
      id: "substance_use",
      question: "Do you smoke or drink?",
      type: "radio",
      options: ["Never", "Occasionally", "Regularly", "Prefer not to say"],
      icon: Wine
    },
    {
      id: "doctor_contact_preference",
      question: "Would you like a doctor to contact you about your concerns?",
      type: "radio",
      options: ["Yes", "No"],
      icon: MessageCircle
    }
  ];

  const currentQ = questions[currentQuestion];

  const handleNext = () => {
    const answer = answers[currentQ.id as keyof typeof answers];
    if (!answer || answer.trim() === "") {
      toast({
        title: "Answer Required",
        description: "Please answer the question before proceeding.",
        variant: "destructive"
      });
      return;
    }

    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    } else {
      handleSubmit();
    }
  };

  const handlePrevious = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
    }
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        throw new Error("No user found");
      }

      // Convert answers to the correct format
      const questionnaireData = {
        patient_id: user.id,
        age: answers.age ? parseInt(answers.age) : null,
        gender: answers.gender || null,
        chronic_conditions: answers.chronic_conditions || null,
        medications: answers.medications || null,
        allergies: answers.allergies || null,
        primary_concern: answers.primary_concern || null,
        recent_travel: answers.recent_travel || null,
        past_surgeries: answers.past_surgeries || null,
        substance_use: answers.substance_use || null,
        doctor_contact_preference: answers.doctor_contact_preference === "Yes"
      };

      const { error } = await supabase
        .from('patient_questionnaire')
        .insert(questionnaireData);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Questionnaire completed successfully!",
      });

      navigate('/patient-dashboard');
    } catch (error: any) {
      console.error('Error submitting questionnaire:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to submit questionnaire",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (value: string) => {
    setAnswers({
      ...answers,
      [currentQ.id]: value
    });
  };

  if (checking) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
        >
          <Loader2 className="w-12 h-12 animate-spin text-primary" />
        </motion.div>
      </div>
    );
  }

  const QuestionIcon = currentQ.icon || FileText;
  const progress = ((currentQuestion + 1) / questions.length) * 100;

  return (
    <div className="min-h-screen relative overflow-hidden bg-gradient-to-br from-blue-50 via-indigo-50/50 to-purple-50 flex items-center justify-center p-4">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Floating circles */}
        {[...Array(6)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute rounded-full bg-gradient-to-br from-primary/20 to-purple-300/20 blur-2xl"
            style={{
              width: `${100 + i * 50}px`,
              height: `${100 + i * 50}px`,
              left: `${10 + i * 15}%`,
              top: `${10 + i * 10}%`,
            }}
            animate={{
              y: [0, -30, 0],
              x: [0, 20, 0],
              scale: [1, 1.1, 1],
            }}
            transition={{
              duration: 5 + i,
              repeat: Infinity,
              ease: "easeInOut",
              delay: i * 0.5,
            }}
          />
        ))}
        
        {/* Sparkle effects */}
        {[...Array(8)].map((_, i) => (
          <motion.div
            key={`sparkle-${i}`}
            className="absolute"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
            animate={{
              opacity: [0, 1, 0],
              scale: [0, 1, 0],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              delay: i * 0.3,
            }}
          >
            <Sparkles className="w-4 h-4 text-primary/40" />
          </motion.div>
        ))}
      </div>

      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-3xl relative z-10"
      >
        <Card className="shadow-2xl border-0 bg-white/80 backdrop-blur-sm">
          {/* Header with gradient */}
          <div className="relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-primary/10 via-purple-500/10 to-pink-500/10" />
            <CardHeader className="relative bg-gradient-to-r from-primary/5 to-purple-500/5 pb-6">
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
                className="flex items-center gap-3 mb-4"
              >
                <motion.div
                  animate={{ rotate: [0, 10, -10, 0] }}
                  transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
                  className="p-3 rounded-xl bg-gradient-to-br from-primary to-purple-600 text-white shadow-lg"
                >
                  <Heart className="w-6 h-6" />
                </motion.div>
                <div className="flex-1">
                  <CardTitle className="text-3xl font-bold bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">
                    Health Questionnaire
                  </CardTitle>
                  <CardDescription className="text-base mt-1 font-medium">
                    Question {currentQuestion + 1} of {questions.length}
                  </CardDescription>
                </div>
              </motion.div>
              
              {/* Enhanced Progress Bar */}
              <div className="space-y-2">
                <div className="flex justify-between text-sm text-muted-foreground">
                  <span className="font-medium">Progress</span>
                  <span className="font-bold text-primary">{Math.round(progress)}%</span>
                </div>
                <div className="relative w-full bg-muted/50 rounded-full h-4 overflow-hidden shadow-inner">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${progress}%` }}
                    transition={{ duration: 0.5, ease: "easeOut" }}
                    className="absolute inset-y-0 left-0 bg-gradient-to-r from-primary via-purple-500 to-pink-500 rounded-full shadow-lg"
                  >
                    <motion.div
                      animate={{ x: ["-100%", "100%"] }}
                      transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                      className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent"
                    />
                  </motion.div>
                </div>
              </div>
            </CardHeader>
          </div>

          <CardContent className="p-8 space-y-8">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentQuestion}
                initial={{ opacity: 0, x: 30, scale: 0.95 }}
                animate={{ opacity: 1, x: 0, scale: 1 }}
                exit={{ opacity: 0, x: -30, scale: 0.95 }}
                transition={{ duration: 0.4 }}
                className="space-y-6"
              >
                {/* Question with Icon */}
                <div className="flex items-start gap-4 p-6 rounded-2xl bg-gradient-to-br from-primary/5 via-purple-500/5 to-pink-500/5 border border-primary/20">
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.2, type: "spring" }}
                    className="p-3 rounded-xl bg-gradient-to-br from-primary to-purple-600 text-white shadow-lg flex-shrink-0"
                  >
                    <QuestionIcon className="w-6 h-6" />
                  </motion.div>
                  <div className="flex-1 pt-1">
                    <Label className="text-xl font-semibold text-foreground leading-relaxed">
                      {currentQ.question}
                    </Label>
                  </div>
                </div>
                
                {/* Input Fields */}
                <div className="space-y-4">
                  {currentQ.type === "number" && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.3 }}
                    >
                      <Input
                        type="number"
                        placeholder={currentQ.placeholder}
                        value={answers[currentQ.id as keyof typeof answers]}
                        onChange={(e) => handleInputChange(e.target.value)}
                        className="w-full h-14 text-lg border-2 focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
                      />
                    </motion.div>
                  )}

                  {currentQ.type === "textarea" && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.3 }}
                    >
                      <Textarea
                        placeholder={currentQ.placeholder}
                        value={answers[currentQ.id as keyof typeof answers]}
                        onChange={(e) => handleInputChange(e.target.value)}
                        className="w-full min-h-[140px] text-base border-2 focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all resize-none"
                      />
                    </motion.div>
                  )}

                  {currentQ.type === "radio" && currentQ.options && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.3 }}
                    >
                      <RadioGroup
                        value={answers[currentQ.id as keyof typeof answers]}
                        onValueChange={handleInputChange}
                        className="space-y-3"
                      >
                        {currentQ.options.map((option, index) => (
                          <motion.div
                            key={option}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.4 + index * 0.1 }}
                            whileHover={{ scale: 1.02, x: 5 }}
                            whileTap={{ scale: 0.98 }}
                          >
                            <div className="flex items-center space-x-3 p-4 rounded-xl border-2 border-muted hover:border-primary/50 hover:bg-primary/5 transition-all cursor-pointer group">
                              <RadioGroupItem 
                                value={option} 
                                id={option}
                                className="border-2 group-hover:border-primary"
                              />
                              <Label 
                                htmlFor={option} 
                                className="cursor-pointer flex-1 text-base font-medium group-hover:text-primary transition-colors"
                              >
                                {option}
                              </Label>
                            </div>
                          </motion.div>
                        ))}
                      </RadioGroup>
                    </motion.div>
                  )}
                </div>
              </motion.div>
            </AnimatePresence>

            {/* Navigation Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.2 }}
              className="flex justify-between items-center pt-6 border-t border-border"
            >
              <motion.div 
                whileHover={{ scale: 1.05, x: -5 }} 
                whileTap={{ scale: 0.95 }}
              >
                <Button
                  variant="outline"
                  size="lg"
                  onClick={handlePrevious}
                  disabled={currentQuestion === 0 || loading}
                  className="min-w-[140px] h-12 border-2"
                >
                  <ChevronLeft className="w-5 h-5 mr-2" />
                  Previous
                </Button>
              </motion.div>

              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <span className="font-medium">{currentQuestion + 1}</span>
                <span>/</span>
                <span>{questions.length}</span>
              </div>

              <motion.div 
                whileHover={{ scale: 1.05, x: 5 }} 
                whileTap={{ scale: 0.95 }}
              >
                <Button
                  onClick={handleNext}
                  disabled={loading}
                  size="lg"
                  className="min-w-[140px] h-12 bg-gradient-to-r from-primary to-purple-600 hover:from-primary/90 hover:to-purple-600/90 shadow-lg"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                      Submitting...
                    </>
                  ) : currentQuestion === questions.length - 1 ? (
                    <>
                      Submit
                      <Sparkles className="w-5 h-5 ml-2" />
                    </>
                  ) : (
                    <>
                      Next
                      <ChevronRight className="w-5 h-5 ml-2" />
                    </>
                  )}
                </Button>
              </motion.div>
            </motion.div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
};

export default QuestionnaireOnboarding;
