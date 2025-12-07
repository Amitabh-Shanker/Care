import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, Brain, MessageSquare, Camera } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import heroImage from "@/assets/hero-healthcare.jpg";
import { motion } from "framer-motion";
import { useInView } from "react-intersection-observer";

export const HeroSection = () => {
  const { user } = useAuth();

  const handleStartAnalysis = () => {
    if (user) {
      window.location.href = '/patient-dashboard';
    } else {
      window.location.href = '/patient-auth';
    }
  };

  return (
    <section id="home" className="relative min-h-screen flex items-center justify-center bg-gradient-health pt-20 overflow-hidden">
      <div className="container mx-auto px-4 py-16">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left Content */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            className="space-y-8"
          >
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="space-y-4"
            >
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, delay: 0.3 }}
              >
                <Badge variant="secondary" className="inline-flex items-center gap-2">
                  <motion.div
                    animate={{ rotate: [0, 10, -10, 0] }}
                    transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
                  >
                    <Brain className="w-4 h-4" />
                  </motion.div>
                  AI-Powered Healthcare
                </Badge>
              </motion.div>
              
              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.4 }}
                className="text-5xl lg:text-6xl font-bold leading-tight"
              >
                <span className="text-foreground">Smart Healthcare</span>
                <br />
                <span className="bg-gradient-primary bg-clip-text text-transparent">
                  At Your Fingertips
                </span>
              </motion.h1>
              
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.5 }}
                className="text-xl text-muted-foreground leading-relaxed max-w-lg"
              >
                Experience next-generation healthcare with our AI-driven virtual assistant. 
                Get instant symptom analysis through text, voice, and image inputs with 
                personalized recommendations.
              </motion.p>
            </motion.div>

            {/* Feature Pills */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.6 }}
              className="flex flex-wrap gap-3"
            >
              {[
                { icon: MessageSquare, text: "Text Analysis" },
                { icon: Camera, text: "Image Recognition" },
                { icon: Brain, text: "AI Diagnosis" }
              ].map((feature, index) => (
                <motion.div
                  key={feature.text}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.4, delay: 0.7 + index * 0.1 }}
                  whileHover={{ scale: 1.05 }}
                  className="flex items-center gap-2 bg-card border border-border px-4 py-2 rounded-full shadow-card cursor-pointer"
                >
                  <feature.icon className="w-4 h-4 text-primary" />
                  <span className="text-sm font-medium">{feature.text}</span>
                </motion.div>
              ))}
            </motion.div>

            {/* CTA Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.9 }}
              className="flex justify-center sm:justify-start"
            >
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Button size="lg" variant="medical" className="group" onClick={handleStartAnalysis}>
                  Start Your Health Analysis
                  <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                </Button>
              </motion.div>
            </motion.div>

            {/* Stats */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 1.0 }}
              className="grid grid-cols-3 gap-8 pt-8 border-t border-border"
            >
              {[
                { value: "85%", label: "Accuracy Rate" },
                { value: "24/7", label: "AI Support" },
                { value: "10k+", label: "Users Helped" }
              ].map((stat, index) => (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.4, delay: 1.1 + index * 0.1 }}
                  whileHover={{ scale: 1.1 }}
                  className="text-center cursor-pointer"
                >
                  <div className="text-2xl font-bold text-primary">{stat.value}</div>
                  <div className="text-sm text-muted-foreground">{stat.label}</div>
                </motion.div>
              ))}
            </motion.div>
          </motion.div>

          {/* Right Image */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="relative"
          >
            <motion.div
              whileHover={{ scale: 1.02 }}
              transition={{ duration: 0.3 }}
              className="relative z-10"
            >
              <img
                src={heroImage}
                alt="AI-powered healthcare dashboard showing medical analysis and patient data"
                className="w-full h-auto rounded-2xl shadow-float"
              />
            </motion.div>
            
            {/* Background Elements */}
            <motion.div
              animate={{
                scale: [1, 1.2, 1],
                opacity: [0.2, 0.3, 0.2],
              }}
              transition={{
                duration: 4,
                repeat: Infinity,
                ease: "easeInOut",
              }}
              className="absolute -top-8 -right-8 w-24 h-24 bg-gradient-care rounded-full blur-xl"
            />
            <motion.div
              animate={{
                scale: [1, 1.3, 1],
                opacity: [0.1, 0.2, 0.1],
              }}
              transition={{
                duration: 5,
                repeat: Infinity,
                ease: "easeInOut",
              }}
              className="absolute -bottom-8 -left-8 w-32 h-32 bg-gradient-primary rounded-full blur-2xl"
            />
          </motion.div>
        </div>
      </div>
    </section>
  );
};