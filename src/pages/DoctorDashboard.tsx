import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Stethoscope, LogOut, Home, User, ChevronDown, Calendar, Users } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { DashboardStats } from "@/components/doctor/DashboardStats";
import { AppointmentManagement } from "@/components/doctor/AppointmentManagement";
import { PatientRecords } from "@/components/doctor/PatientRecords";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { motion } from "framer-motion";

const DoctorDashboard = () => {
  const { user, loading, signOut } = useAuth();
  const navigate = useNavigate();
  const [doctorName, setDoctorName] = useState<string>("");
  const [activeTab, setActiveTab] = useState("appointments");

  useEffect(() => {
    const fetchDoctorName = async () => {
      if (!user) return;

      console.log('👨‍⚕️ Logged in user ID:', user.id);

      try {
        const { data, error } = await supabase
          .from("doctors")
          .select("user_id, first_name, last_name")
          .eq("user_id", user.id)
          .single();

        console.log('👨‍⚕️ Doctor record:', data);
        console.log('❌ Doctor fetch error:', error);

        if (data) {
          setDoctorName(`${data.first_name} ${data.last_name}`);
        } else {
          console.warn('⚠️ No doctor record found for user ID:', user.id);
        }
      } catch (error) {
        console.error("Error fetching doctor name:", error);
      }
    };

    fetchDoctorName();
  }, [user]);

  const handleLogout = async () => {
    await signOut();
    navigate('/doctor-auth');
  };

  const handleHome = () => {
    navigate('/');
  };

  useEffect(() => {
    if (!loading && !user) {
      navigate('/doctor-auth');
    }
  }, [user, loading, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Beautiful Navbar - Same as Patient Dashboard */}
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
                <Stethoscope className="w-6 h-6 text-white" />
              </motion.div>
              <div>
                <h1 className="text-xl font-bold bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">
                  CareNexus
                </h1>
                <p className="text-xs text-muted-foreground">Doctor Portal</p>
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
                          {doctorName ? doctorName.charAt(0).toUpperCase() : <User className="w-4 h-4" />}
                        </div>
                        <div className="hidden sm:flex flex-col items-start">
                          <span className="text-sm font-medium">My Profile</span>
                          {doctorName && (
                            <span className="text-xs text-muted-foreground">{doctorName}</span>
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
                        {doctorName && (
                          <p className="text-xs leading-none text-muted-foreground">{doctorName}</p>
                        )}
                      </div>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem className="cursor-pointer">
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
                <Stethoscope className="w-6 h-6 text-primary" />
                Welcome back{doctorName ? `, Dr. ${doctorName.split(' ')[0]}` : ''}!
              </CardTitle>
              <CardDescription className="text-base">
                Manage your appointments and patient records all in one place
              </CardDescription>
            </CardHeader>
          </Card>
        </motion.div>

        {/* Dashboard Stats */}
        <div className="mb-8">
          <DashboardStats doctorId={user.id} />
        </div>

        {/* Main Content Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-2 bg-muted/50">
            <TabsTrigger value="appointments" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              <Calendar className="w-4 h-4 mr-2" />
              Appointments
            </TabsTrigger>
            <TabsTrigger value="records" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              <Users className="w-4 h-4 mr-2" />
              Patient Records
            </TabsTrigger>
          </TabsList>

          <TabsContent value="appointments" className="space-y-4">
            <AppointmentManagement doctorId={user.id} />
          </TabsContent>

          <TabsContent value="records" className="space-y-4">
            <PatientRecords doctorId={user.id} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default DoctorDashboard;