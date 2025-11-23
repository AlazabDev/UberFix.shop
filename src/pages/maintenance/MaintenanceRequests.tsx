import { useNavigate } from "react-router-dom";
import { MaintenanceRequestsList } from "@/components/maintenance/MaintenanceRequestsList";
import { AppFooter } from "@/components/shared/AppFooter";

export default function MaintenanceRequests() {
  const navigate = useNavigate();

  const handleNewRequestClick = () => {
    navigate("/maintenance/create");
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto p-6" dir="rtl">
        <MaintenanceRequestsList onNewRequestClick={handleNewRequestClick} />
      </div>
      <AppFooter />
    </div>
  );
}
