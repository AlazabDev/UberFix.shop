export interface BranchLocation {
  id: string;
  branch: string;
  address: string | null;
  latitude: number;
  longitude: number;
  status: 'Active' | 'Closed' | 'UnderMaintenance';
  branch_type: string | null;
  link: string | null;
  icon: string | null;
}

export interface TechnicianLocation {
  id: string;
  name: string;
  specialization: 'plumber' | 'carpenter' | 'electrician' | 'painter';
  rating: number;
  total_reviews: number;
  status: 'available' | 'busy' | 'soon';
  latitude: number;
  longitude: number;
  hourly_rate?: number;
  available_from?: string;
  available_to?: string;
  phone?: string;
  profile_image?: string;
}

export interface MapPin {
  id: string;
  type: 'branch' | 'technician';
  position: google.maps.LatLngLiteral;
  data: BranchLocation | TechnicianLocation;
}

export interface PopupData {
  type: 'branch' | 'technician';
  data: BranchLocation | TechnicianLocation;
  position: { x: number; y: number };
}
