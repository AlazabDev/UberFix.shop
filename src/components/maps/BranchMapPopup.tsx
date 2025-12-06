import { MapPin, Building, CheckCircle } from "lucide-react";

interface BranchMapPopupProps {
  id: string;
  name: string;
  address: string;
  area?: string;
  status?: "Active" | "Closed";
}

export const BranchMapPopup = ({ id, name, address, area, status = "Active" }: BranchMapPopupProps) => {
  return (
    <div 
      className="min-w-[200px] max-w-[260px] p-3 rounded-xl shadow-2xl"
      style={{ 
        backgroundColor: '#ffffff',
        border: '2px solid #3b82f6'
      }}
    >
      {/* معرف الفرع */}
      <div className="flex items-center gap-2 mb-2">
        <Building className="w-4 h-4 text-blue-600" />
        <span className="text-xs font-mono font-bold text-blue-600">{id}</span>
      </div>

      {/* الاسم */}
      <h3 className="font-bold text-sm text-gray-900 mb-1">{name}</h3>

      {/* العنوان */}
      <div className="flex items-start gap-1.5 mb-2">
        <MapPin className="w-3.5 h-3.5 mt-0.5 text-blue-600 flex-shrink-0" />
        <p className="text-xs text-gray-600">{area || address}</p>
      </div>

      {/* الحالة */}
      <div className="flex items-center gap-1.5">
        <CheckCircle 
          className="w-3.5 h-3.5" 
          style={{ color: status === "Active" ? '#22c55e' : '#ef4444' }}
        />
        <span 
          className="text-xs font-medium"
          style={{ color: status === "Active" ? '#22c55e' : '#ef4444' }}
        >
          {status === "Active" ? "Active" : "Closed"}
        </span>
      </div>
    </div>
  );
};
