import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { 
  Search, 
  Video, 
  FileText, 
  AlertTriangle, 
  Clock, 
  Shield,
  CheckCircle
} from "lucide-react";

export const ServicesSection = () => {
  const { user } = useAuth();

  const handleStartAnalysis = () => {
    if (user) {
      window.location.href = '/patient-dashboard';
    } else {
      window.location.href = '/patient-auth';
    }
  };
  const services = [
    {
      icon: Search,
      title: "AI Symptom Analysis",
      description: "Upload symptoms via text, voice, or images for instant AI-powered analysis and recommendations",
      features: ["Multimodal input", "Real-time analysis", "Severity classification", "Personalized advice"],
      badge: "Core Service",
      color: "primary"
    },
    {
      icon: Video,
      title: "Doctor Consultation",
      description: "Connect with certified healthcare professionals for moderate to critical cases",
      features: ["Verified doctors", "Instant booking", "Symptom context sharing", "Secure video calls"],
      badge: "Professional Care",
      color: "accent"
    },
    {
      icon: AlertTriangle,
      title: "Emergency Support",
      description: "Immediate assistance for critical cases with facial recognition for unconscious patients",
      features: ["Critical case detection", "Emergency routing", "Medical history access", "Rapid response"],
      badge: "Emergency",
      color: "destructive"
    },
    {
      icon: FileText,
      title: "Health History Tracking",
      description: "Secure storage and analysis of your medical history for personalized healthcare",
      features: ["Encrypted storage", "History analysis", "Progress tracking", "Export capabilities"],
      badge: "Personal Health",
      color: "secondary"
    }
  ];


  return (
    <section id="services" className="py-24 bg-muted/30">
      <div className="container mx-auto px-4">
        <div className="text-center space-y-4 mb-16">
          <Badge variant="secondary" className="inline-flex items-center gap-2">
            <CheckCircle className="w-4 h-4" />
            Our Services
          </Badge>
          <h2 className="text-4xl lg:text-5xl font-bold">
            Comprehensive Healthcare
            <span className="bg-gradient-primary bg-clip-text text-transparent"> Solutions</span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            From AI-powered symptom analysis to emergency support, we provide end-to-end 
            healthcare assistance tailored to your needs.
          </p>
        </div>

        {/* Services Grid */}
        <div className="grid md:grid-cols-2 gap-8 mb-16">
          {services.map((service, index) => (
            <Card key={index} className="group hover:shadow-medical transition-all duration-300 border-0 shadow-card bg-card">
              <CardHeader className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className={`w-14 h-14 rounded-xl bg-gradient-primary p-3 group-hover:scale-110 transition-transform`}>
                    <service.icon className="w-full h-full text-primary-foreground" />
                  </div>
                  <Badge variant="secondary" className="text-xs">
                    {service.badge}
                  </Badge>
                </div>
                <CardTitle className="text-xl group-hover:text-primary transition-colors">
                  {service.title}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <CardDescription className="text-base leading-relaxed">
                  {service.description}
                </CardDescription>
                
                <div className="space-y-3">
                  {service.features.map((feature, featureIndex) => (
                    <div key={featureIndex} className="flex items-center gap-3">
                      <CheckCircle className="w-4 h-4 text-success flex-shrink-0" />
                      <span className="text-sm text-muted-foreground">{feature}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* CTA Section */}
        <div className="text-center mt-16">
          <Card className="inline-block p-8 bg-gradient-care border-0 shadow-float">
            <div className="space-y-4">
              <Clock className="w-12 h-12 mx-auto text-primary" />
              <CardTitle className="text-2xl">Ready to Get Started?</CardTitle>
              <CardDescription className="text-base max-w-md">
                Experience the future of healthcare with our AI-powered platform. 
                Start your health analysis today.
              </CardDescription>
              <Button size="lg" variant="medical" className="mt-4" onClick={handleStartAnalysis}>
                Start Free Analysis
              </Button>
            </div>
          </Card>
        </div>
      </div>
    </section>
  );
};