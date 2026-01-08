import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { Calendar, Clock, User, CheckCircle, XCircle, RefreshCw, FileText } from "lucide-react";
import { motion } from "framer-motion";
import { PatientHistoryView } from "./PatientHistoryView";

interface Appointment {
  id: string;
  appointment_date: string;
  appointment_time: string;
  status: string;
  reason: string;
  patient_id: string;
  patient: {
    first_name: string;
    last_name: string;
  };
}

interface AppointmentManagementProps {
  doctorId: string;
}

export const AppointmentManagement = ({ doctorId }: AppointmentManagementProps) => {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [filter, setFilter] = useState<string>("all");
  const [selectedPatient, setSelectedPatient] = useState<{ id: string; name: string } | null>(null);
  const [isHistoryDialogOpen, setIsHistoryDialogOpen] = useState(false);
  const { toast } = useToast();

  const fetchAppointments = async () => {
    try {
      console.log('='.repeat(70));
      console.log('🔍 Fetching appointments for doctor ID:', doctorId);
      console.log('📊 Current filter:', filter);

      // First get appointments
      let appointmentsQuery = supabase
        .from('appointments')
        .select('*')
        .eq('doctor_id', doctorId)
        .order('appointment_date', { ascending: true })
        .order('appointment_time', { ascending: true });

      if (filter !== "all") {
        appointmentsQuery = appointmentsQuery.eq('status', filter);
      }

      const { data: appointmentsData, error: appointmentsError } = await appointmentsQuery;

      console.log('📋 Raw appointments data:', appointmentsData);
      console.log('❌ Appointments error:', appointmentsError);
      console.log('📊 Number of appointments found:', appointmentsData?.length || 0);

      if (appointmentsError) throw appointmentsError;

      if (!appointmentsData || appointmentsData.length === 0) {
        console.log('⚠️ No appointments found for this doctor');
        setAppointments([]);
        return;
      }

      // Get patient details
      const patientIds = [...new Set(appointmentsData.map(apt => apt.patient_id))];
      console.log('👥 Patient IDs to fetch:', patientIds);

      const { data: patientsData, error: patientsError } = await supabase
        .from('patients')
        .select('user_id, first_name, last_name')
        .in('user_id', patientIds);

      console.log('👤 Patients data:', patientsData);
      console.log('❌ Patients error:', patientsError);

      if (patientsError) throw patientsError;

      // Map appointments with patient data
      const appointmentsWithPatients = appointmentsData.map(apt => {
        const patient = patientsData?.find(p => p.user_id === apt.patient_id);
        return {
          ...apt,
          patient: patient || { first_name: "Unknown", last_name: "Patient" }
        };
      });

      console.log('✅ Final appointments with patients:', appointmentsWithPatients);
      console.log('='.repeat(70));

      setAppointments(appointmentsWithPatients as Appointment[]);
    } catch (error: any) {
      console.error('💥 Error in fetchAppointments:', error);
      toast({
        title: "Error",
        description: "Failed to fetch appointments: " + (error.message || "Unknown error"),
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    fetchAppointments();

    // Set up real-time subscription
    const channel = supabase
      .channel('appointments-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'appointments',
          filter: `doctor_id=eq.${doctorId}`,
        },
        () => {
          setTimeout(() => fetchAppointments(), 0);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [doctorId, filter]);

  const updateAppointmentStatus = async (appointmentId: string, newStatus: string) => {
    const { error } = await supabase
      .from('appointments')
      .update({ status: newStatus })
      .eq('id', appointmentId);

    if (error) {
      toast({
        title: "Error",
        description: "Failed to update appointment",
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "Success",
      description: `Appointment ${newStatus} successfully`,
    });

    fetchAppointments();
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
      pending: "outline",
      confirmed: "default",
      completed: "secondary",
      cancelled: "destructive",
      rescheduled: "outline",
    };

    return <Badge variant={variants[status] || "default"}>{status}</Badge>;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Appointment Management</CardTitle>
        <CardDescription>
          View and manage all your appointments
        </CardDescription>
        <div className="flex gap-2 mt-4">
          <Button
            variant={filter === "all" ? "default" : "outline"}
            size="sm"
            onClick={() => setFilter("all")}
          >
            All
          </Button>
          <Button
            variant={filter === "pending" ? "default" : "outline"}
            size="sm"
            onClick={() => setFilter("pending")}
          >
            Pending
          </Button>
          <Button
            variant={filter === "confirmed" ? "default" : "outline"}
            size="sm"
            onClick={() => setFilter("confirmed")}
          >
            Confirmed
          </Button>
          <Button
            variant={filter === "completed" ? "default" : "outline"}
            size="sm"
            onClick={() => setFilter("completed")}
          >
            Completed
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {appointments.length === 0 ? (
          <p className="text-center text-muted-foreground py-8">
            No appointments found
          </p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Patient</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Time</TableHead>
                <TableHead>Reason</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {appointments.map((appointment) => (
                <TableRow key={appointment.id}>
                  <TableCell className="font-medium">
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4 text-muted-foreground" />
                      {appointment.patient?.first_name} {appointment.patient?.last_name}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      {format(new Date(appointment.appointment_date), 'MMM dd, yyyy')}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-muted-foreground" />
                      {appointment.appointment_time}
                    </div>
                  </TableCell>
                  <TableCell>{appointment.reason || 'N/A'}</TableCell>
                  <TableCell>{getStatusBadge(appointment.status)}</TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          setSelectedPatient({
                            id: appointment.patient_id,
                            name: `${appointment.patient?.first_name} ${appointment.patient?.last_name}`
                          });
                          setIsHistoryDialogOpen(true);
                        }}
                      >
                        <FileText className="h-4 w-4 mr-1" />
                        History
                      </Button>
                      {appointment.status === 'pending' && (
                        <>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => updateAppointmentStatus(appointment.id, 'confirmed')}
                          >
                            <CheckCircle className="h-4 w-4 mr-1" />
                            Confirm
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => updateAppointmentStatus(appointment.id, 'cancelled')}
                          >
                            <XCircle className="h-4 w-4 mr-1" />
                            Cancel
                          </Button>
                        </>
                      )}
                      {appointment.status === 'confirmed' && (
                        <>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => updateAppointmentStatus(appointment.id, 'completed')}
                          >
                            <CheckCircle className="h-4 w-4 mr-1" />
                            Complete
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => updateAppointmentStatus(appointment.id, 'rescheduled')}
                          >
                            <RefreshCw className="h-4 w-4 mr-1" />
                            Reschedule
                          </Button>
                        </>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>

      <Dialog open={isHistoryDialogOpen} onOpenChange={setIsHistoryDialogOpen}>
        <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Patient Medical History</DialogTitle>
            <DialogDescription>
              Complete medical history and diagnosis records
            </DialogDescription>
          </DialogHeader>
          {selectedPatient && (
            <PatientHistoryView
              patientId={selectedPatient.id}
              patientName={selectedPatient.name}
            />
          )}
        </DialogContent>
      </Dialog>
    </Card>
  );
};
