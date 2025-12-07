import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Calendar, Clock, User } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";

interface Doctor {
  user_id: string;
  first_name: string;
  last_name: string;
  specialty: string;
}

interface AppointmentBookingProps {
  analysisData?: {
    symptoms: string;
    severity: string;
    recommendations: string;
  };
  onSuccess?: () => void;
}

export const AppointmentBooking = ({ analysisData, onSuccess }: AppointmentBookingProps) => {
  const { user } = useAuth();
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [selectedDoctor, setSelectedDoctor] = useState<string>("");
  const [appointmentDate, setAppointmentDate] = useState<string>("");
  const [appointmentTime, setAppointmentTime] = useState<string>("");
  const [reason, setReason] = useState<string>(
    analysisData ? `Symptoms: ${analysisData.symptoms}\nSeverity: ${analysisData.severity}` : ""
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoadingDoctors, setIsLoadingDoctors] = useState(true);

  useEffect(() => {
    fetchDoctors();
  }, []);

  const fetchDoctors = async () => {
    setIsLoadingDoctors(true);
    try {
      // Check if user is authenticated
      const { data: { user: authUser } } = await supabase.auth.getUser();
      console.log("Current authenticated user:", authUser?.id || "Not logged in");
      
      if (!authUser) {
        console.warn("User is not authenticated - cannot fetch doctors");
        toast.error("Please log in to view doctors");
        setIsLoadingDoctors(false);
        return;
      }

      const { data, error } = await supabase
        .from("doctors")
        .select("user_id, first_name, last_name, specialty")
        .order("first_name", { ascending: true });

      if (error) {
        console.error("Error fetching doctors:", error);
        console.error("Error details:", {
          message: error.message,
          details: error.details,
          hint: error.hint,
          code: error.code
        });
        toast.error(`Failed to load doctors: ${error.message}`);
        setIsLoadingDoctors(false);
        return;
      }

      console.log("Doctors fetched successfully:", data);
      console.log("Number of doctors:", data?.length || 0);
      
      if (data && data.length === 0) {
        console.warn("No doctors found. This might be due to:");
        console.warn("1. RLS policy not applied - Run the migration: 20251120170000_allow_patients_view_doctors.sql");
        console.warn("2. Doctors table is empty");
        console.warn("3. RLS policy is blocking access");
      }
      
      setDoctors(data || []);
    } catch (err) {
      console.error("Unexpected error fetching doctors:", err);
      toast.error("Failed to load doctors");
    } finally {
      setIsLoadingDoctors(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user || !selectedDoctor || !appointmentDate || !appointmentTime) {
      toast.error("Please fill in all required fields");
      return;
    }

    setIsSubmitting(true);

    try {
      const { error } = await supabase.from("appointments").insert({
        patient_id: user.id,
        doctor_id: selectedDoctor,
        appointment_date: appointmentDate,
        appointment_time: appointmentTime,
        reason: reason,
        status: "pending",
      });

      if (error) throw error;

      toast.success("Appointment booked successfully!");
      
      // Reset form
      setSelectedDoctor("");
      setAppointmentDate("");
      setAppointmentTime("");
      setReason("");
      
      if (onSuccess) onSuccess();
    } catch (error: any) {
      console.error("Error booking appointment:", error);
      toast.error("Failed to book appointment: " + error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const today = new Date().toISOString().split("T")[0];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calendar className="w-5 h-5" />
          Book an Appointment
        </CardTitle>
        <CardDescription>
          Schedule a consultation with a doctor based on your symptoms
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="doctor">Select Doctor *</Label>
            <Select value={selectedDoctor} onValueChange={setSelectedDoctor} disabled={isLoadingDoctors}>
              <SelectTrigger>
                <SelectValue placeholder={isLoadingDoctors ? "Loading doctors..." : doctors.length === 0 ? "No doctors available" : "Choose a doctor"} />
              </SelectTrigger>
              <SelectContent className="bg-popover">
                {doctors.length === 0 ? (
                  <div className="px-3 py-2 text-sm text-muted-foreground">
                    No doctors registered yet
                  </div>
                ) : (
                  doctors.map((doctor) => (
                    <SelectItem key={doctor.user_id} value={doctor.user_id}>
                      <div className="flex items-center gap-2">
                        <User className="w-4 h-4" />
                        Dr. {doctor.first_name} {doctor.last_name}
                        {doctor.specialty && ` - ${doctor.specialty}`}
                      </div>
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="date">Appointment Date *</Label>
              <Input
                id="date"
                type="date"
                min={today}
                value={appointmentDate}
                onChange={(e) => setAppointmentDate(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="time">Appointment Time *</Label>
              <Input
                id="time"
                type="time"
                value={appointmentTime}
                onChange={(e) => setAppointmentTime(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="reason">Reason for Visit</Label>
            <Textarea
              id="reason"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Describe your symptoms and concerns..."
              rows={4}
            />
          </div>

          <Button type="submit" disabled={isSubmitting} className="w-full">
            {isSubmitting ? "Booking..." : "Book Appointment"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};
