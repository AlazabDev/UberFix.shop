import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { Calendar, Clock, Plus, User } from "lucide-react";
import { NewAppointmentForm } from "@/components/forms/NewAppointmentForm";
import { useAppointments } from "@/hooks/useAppointments";
import { AppFooter } from "@/components/shared/AppFooter";

export default function Appointments() {
  const [showNewAppointmentForm, setShowNewAppointmentForm] = useState(false);
  
  const { appointments, loading } = useAppointments();

  const mockAppointments = [
    {
      id: 1,
      title: "فحص دوري للمكيفات",
      customer: "شركة الأعمال المتقدمة",
      date: "2025-01-15",
      time: "10:00 ص",
      status: "مؤكد"
    },
    {
      id: 2,
      title: "صيانة أنظمة الكهرباء",
      customer: "مجمع الإدارة",
      date: "2025-01-16",
      time: "2:00 م",
      status: "في الانتظار"
    }
  ];

  return (
    <div className="max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-foreground">المواعيد</h1>
        <Dialog open={showNewAppointmentForm} onOpenChange={setShowNewAppointmentForm}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              حجز موعد جديد
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <NewAppointmentForm 
              onClose={() => setShowNewAppointmentForm(false)}
              onSuccess={() => setShowNewAppointmentForm(false)}
            />
          </DialogContent>
        </Dialog>
      </div>
      
      <div className="grid gap-6">
        {(loading ? mockAppointments : appointments.length > 0 ? appointments : mockAppointments).map((appointment: any) => (
          <Card key={appointment.id} className="card-elegant">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5 text-primary" />
                {appointment.title}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">{appointment.customer}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">{appointment.date}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">{appointment.time}</span>
                </div>
                <div>
                  <span className={`inline-block px-2 py-1 text-xs rounded-full ${
                    appointment.status === 'مؤكد' ? 'bg-success text-success-foreground' : 'bg-warning text-warning-foreground'
                  }`}>
                    {appointment.status}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <AppFooter />
    </div>
  );
}
