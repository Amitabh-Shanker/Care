import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar, Clock, User, X, Stethoscope, AlertCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { useInView } from "react-intersection-observer";
import { format } from "date-fns";

interface Appointment {
  id: string;
  appointment_date: string;
  appointment_time: string;
  reason: string;
  status: string;
  doctor: {
    first_name: string;
    last_name: string;
    specialty: string;
  };
}

export const MyAppointments = () => {
  const { user } = useAuth();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchAppointments();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const fetchAppointments = async () => {
    if (!user) return;

    setIsLoading(true);
    try {
      // First get appointments
      const { data: appointmentsData, error: appointmentsError } = await supabase
        .from("appointments")
        .select(`
          id,
          appointment_date,
          appointment_time,
          reason,
          status,
          doctor_id
        `)
        .eq("patient_id", user.id)
        .order("appointment_date", { ascending: false });

      if (appointmentsError) throw appointmentsError;

      if (!appointmentsData || appointmentsData.length === 0) {
        setAppointments([]);
        setIsLoading(false);
        return;
      }

      // Get doctor details for each appointment
      const doctorIds = [...new Set(appointmentsData.map(apt => apt.doctor_id))];
      const { data: doctorsData, error: doctorsError } = await supabase
        .from("doctors")
        .select("user_id, first_name, last_name, specialty")
        .in("user_id", doctorIds);

      if (doctorsError) throw doctorsError;

      // Map appointments with doctor data
      const appointmentsWithDoctors = appointmentsData.map(apt => {
        const doctor = doctorsData?.find(d => d.user_id === apt.doctor_id);
        return {
          ...apt,
          doctor: doctor || { first_name: "Unknown", last_name: "Doctor", specialty: "" }
        };
      });

      setAppointments(appointmentsWithDoctors as Appointment[]);
    } catch (error: any) {
      console.error("Error fetching appointments:", error);
      toast.error("Failed to load appointments: " + (error.message || "Unknown error"));
    } finally {
      setIsLoading(false);
    }
  };

  const cancelAppointment = async (appointmentId: string) => {
    const { error } = await supabase
      .from("appointments")
      .update({ status: "cancelled" })
      .eq("id", appointmentId);

    if (error) {
      toast.error("Failed to cancel appointment");
    } else {
      toast.success("Appointment cancelled");
      fetchAppointments();
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "confirmed": return "default";
      case "pending": return "secondary";
      case "cancelled": return "destructive";
      case "completed": return "outline";
      default: return "secondary";
    }
  };

  const AppointmentCard = ({ appointment, index }: { appointment: Appointment; index: number }) => {
    const [ref, inView] = useInView({ triggerOnce: true, threshold: 0.1 });
    const isUpcoming = new Date(`${appointment.appointment_date}T${appointment.appointment_time}`) > new Date();
    
    return (
      <motion.div
        ref={ref}
        initial={{ opacity: 0, y: 20 }}
        animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
        transition={{ duration: 0.5, delay: index * 0.1 }}
      >
        <Card className="overflow-hidden border-l-4 border-l-primary hover:shadow-lg transition-shadow">
          <CardHeader className="pb-3">
            <div className="flex items-start justify-between">
              <div className="space-y-1 flex-1">
                <CardTitle className="flex items-center gap-2 text-xl">
                  <div className="p-2 rounded-lg bg-primary/10">
                    <Stethoscope className="w-5 h-5 text-primary" />
                  </div>
                  Dr. {appointment.doctor.first_name} {appointment.doctor.last_name}
                </CardTitle>
                {appointment.doctor.specialty && (
                  <CardDescription className="flex items-center gap-2">
                    <span className="px-2 py-1 rounded-md bg-muted text-xs font-medium">
                      {appointment.doctor.specialty}
                    </span>
                  </CardDescription>
                )}
              </div>
              <Badge 
                variant={getStatusColor(appointment.status)} 
                className="text-sm px-3 py-1"
              >
                {appointment.status.charAt(0).toUpperCase() + appointment.status.slice(1)}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-6 text-sm">
              <div className="flex items-center gap-2 p-2 rounded-lg bg-muted/50">
                <Calendar className="w-4 h-4 text-primary" />
                <span className="font-medium">
                  {format(new Date(appointment.appointment_date), "MMM dd, yyyy")}
                </span>
              </div>
              <div className="flex items-center gap-2 p-2 rounded-lg bg-muted/50">
                <Clock className="w-4 h-4 text-primary" />
                <span className="font-medium">{appointment.appointment_time}</span>
              </div>
            </div>
            
            {appointment.reason && (
              <div className="p-3 rounded-lg bg-muted/30 border border-muted">
                <p className="text-sm font-medium mb-1 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4" />
                  Reason for Visit:
                </p>
                <p className="text-sm text-muted-foreground whitespace-pre-wrap ml-6">
                  {appointment.reason}
                </p>
              </div>
            )}

            {appointment.status === "pending" && isUpcoming && (
              <motion.div
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => cancelAppointment(appointment.id)}
                  className="w-full sm:w-auto"
                >
                  <X className="w-4 h-4 mr-2" />
                  Cancel Appointment
                </Button>
              </motion.div>
            )}
          </CardContent>
        </Card>
      </motion.div>
    );
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
        >
          <Calendar className="w-8 h-8 text-primary" />
        </motion.div>
      </div>
    );
  }

  if (appointments.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3 }}
      >
        <Card className="border-dashed">
          <CardContent className="py-12 text-center">
            <motion.div
              animate={{ y: [0, -10, 0] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <Calendar className="w-16 h-16 mx-auto mb-4 text-muted-foreground opacity-50" />
            </motion.div>
            <p className="text-lg font-medium text-muted-foreground mb-2">
              No appointments scheduled yet
            </p>
            <p className="text-sm text-muted-foreground">
              Book an appointment to get started
            </p>
          </CardContent>
        </Card>
      </motion.div>
    );
  }

  return (
    <div className="space-y-4">
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-6"
      >
        <h2 className="text-2xl font-bold mb-2">Your Appointments</h2>
        <p className="text-muted-foreground">
          Manage and view your scheduled appointments
        </p>
      </motion.div>
      {appointments.map((appointment, index) => (
        <AppointmentCard key={appointment.id} appointment={appointment} index={index} />
      ))}
    </div>
  );
};
