import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Heart, LogOut, Calendar, Activity, User, Home, ChevronDown } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import SymptomAnalyzer from "@/components/SymptomAnalyzer";
import { MyAppointments } from "@/components/patient/MyAppointments";
import { AppointmentBooking } from "@/components/patient/AppointmentBooking";
import { PatientProfile } from "@/components/patient/PatientProfile";
import { motion } from "framer-motion";

const PatientDashboard = () => {
  const { signOut, user } = useAuth();
  const navigate = useNavigate();
  const [patientName, setPatientName] = useState<string>("");
  const [activeTab, setActiveTab] = useState("analyze");

  useEffect(() => {
    const fetchPatientName = async () => {
      if (!user) return;

      try {
        const { data, error } = await supabase
          .from("patients")
          .select("first_name, last_name")
          .eq("user_id", user.id)
          .single();

        if (data) {
          setPatientName(`${data.first_name} ${data.last_name}`);
        }
      } catch (error) {
        console.error("Error fetching patient name:", error);
      }
    };

    fetchPatientName();
  }, [user]);

  const handleLogout = async () => {
    await signOut();
    navigate('/');
  };

  const handleHome = () => {
    navigate('/');
  };

  const handleProfileClick = () => {
    setActiveTab("profile");
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Beautiful Navbar */}
      <motion.nav
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60"
      >
        <div className="container mx-auto px-4">
          <div className="flex h-16 items-center justify-between">
            {/* Logo and Title */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="flex items-center space-x-3"
            >
              <motion.div
                animate={{ rotate: [0, 10, -10, 0] }}
                transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
                className="w-10 h-10 rounded-lg bg-gradient-to-br from-primary to-purple-600 flex items-center justify-center shadow-lg"
              >
                <Heart className="w-6 h-6 text-white" />
              </motion.div>
              <div>
                <h1 className="text-xl font-bold bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">
                  CareNexus
                </h1>
                <p className="text-xs text-muted-foreground">Patient Portal</p>
              </div>
            </motion.div>

            {/* Navigation Items */}
            <div className="flex items-center space-x-4">
              {/* Home Button */}
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.3 }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Button
                  variant="ghost"
                  onClick={handleHome}
                  className="flex items-center gap-2 hover:bg-primary/10 hover:text-primary transition-colors"
                >
                  <Home className="w-4 h-4" />
                  <span className="hidden sm:inline">Home</span>
                </Button>
              </motion.div>

              {/* My Profile Dropdown */}
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.4 }}
              >
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                      <Button
                        variant="ghost"
                        className="flex items-center gap-2 hover:bg-primary/10 hover:text-primary transition-colors"
                      >
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-purple-600 flex items-center justify-center text-white font-semibold text-sm">
                          {patientName ? patientName.charAt(0).toUpperCase() : <User className="w-4 h-4" />}
                        </div>
                        <div className="hidden sm:flex flex-col items-start">
                          <span className="text-sm font-medium">My Profile</span>
                          {patientName && (
                            <span className="text-xs text-muted-foreground">{patientName}</span>
                          )}
                        </div>
                        <ChevronDown className="w-4 h-4 hidden sm:inline" />
                      </Button>
                    </motion.div>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56">
                    <DropdownMenuLabel>
                      <div className="flex flex-col space-y-1">
                        <p className="text-sm font-medium leading-none">My Account</p>
                        {patientName && (
                          <p className="text-xs leading-none text-muted-foreground">{patientName}</p>
                        )}
                      </div>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={handleProfileClick} className="cursor-pointer">
                      <User className="w-4 h-4 mr-2" />
                      View Profile
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      onClick={handleLogout}
                      className="cursor-pointer text-destructive focus:text-destructive"
                    >
                      <LogOut className="w-4 h-4 mr-2" />
                      Logout
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </motion.div>

              {/* Logout Button (Desktop) */}
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.5 }}
                className="hidden md:block"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Button
                  variant="outline"
                  onClick={handleLogout}
                  className="border-destructive/50 text-destructive hover:bg-destructive hover:text-destructive-foreground"
                >
                  <LogOut className="w-4 h-4 mr-2" />
                  Logout
                </Button>
              </motion.div>
            </div>
          </div>
        </div>
      </motion.nav>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        {/* Welcome Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="mb-8"
        >
          <Card className="border-0 shadow-lg bg-gradient-to-r from-primary/5 via-purple-500/5 to-pink-500/5">
            <CardHeader>
              <CardTitle className="text-2xl font-bold flex items-center gap-2">
                <Heart className="w-6 h-6 text-primary" />
                Welcome back{patientName ? `, ${patientName.split(' ')[0]}` : ''}!
              </CardTitle>
              <CardDescription className="text-base">
                Manage your health, appointments, and medical records all in one place
              </CardDescription>
            </CardHeader>
          </Card>
        </motion.div>

        {/* Main Content Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-4 bg-muted/50">
            <TabsTrigger value="analyze" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              <Activity className="w-4 h-4 mr-2" />
              Symptom Analysis
            </TabsTrigger>
            <TabsTrigger value="profile" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              <User className="w-4 h-4 mr-2" />
              My Profile
            </TabsTrigger>
            <TabsTrigger value="appointments" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              <Calendar className="w-4 h-4 mr-2" />
              My Appointments
            </TabsTrigger>
            <TabsTrigger value="book" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              <Calendar className="w-4 h-4 mr-2" />
              Book Appointment
            </TabsTrigger>
          </TabsList>

          <TabsContent value="analyze">
            <SymptomAnalyzer />
          </TabsContent>

          <TabsContent value="profile">
            <PatientProfile />
          </TabsContent>

          <TabsContent value="appointments">
            <MyAppointments />
          </TabsContent>

          <TabsContent value="book">
            <AppointmentBooking />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default PatientDashboard;
