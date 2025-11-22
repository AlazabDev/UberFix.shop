// ========================================
// TECHNICIAN MODULE - TYPE DEFINITIONS
// ========================================

export type TechnicianStatus = 'online' | 'busy' | 'offline' | 'on_route';
export type ApplicationStatus = 'pending' | 'approved' | 'rejected' | 'verified';
export type VerificationStatus = 'pending' | 'verified' | 'rejected';
export type TaskStatus = 'pending' | 'accepted' | 'rejected' | 'in_progress' | 'completed' | 'cancelled';
export type TechnicianLevel = 'technician' | 'pro' | 'elite';
export type BadgeType = 'gold_monthly' | 'crown_annual' | 'legacy';
export type TrainingStatus = 'not_started' | 'in_progress' | 'completed' | 'failed';
export type SkillGrade = 'A' | 'B' | 'C' | 'F';

export interface TechnicianApplication {
  id: string;
  user_id: string;
  full_name: string;
  phone: string;
  national_id: string;
  city_id?: number;
  district_id?: number;
  specialization: string;
  profile_image?: string;
  years_of_experience: number;
  alternative_contact?: string;
  home_address?: string;
  status: ApplicationStatus;
  created_at: string;
  updated_at: string;
}

export interface TechnicianVerification {
  id: string;
  application_id: string;
  national_id_front?: string;
  national_id_back?: string;
  selfie_image?: string;
  verification_status: VerificationStatus;
  verified_by?: string;
  verified_at?: string;
  rejection_reason?: string;
  created_at: string;
}

export interface TechnicianAgreement {
  id: string;
  application_id: string;
  quality_policy_accepted: boolean;
  conduct_policy_accepted: boolean;
  pricing_policy_accepted: boolean;
  customer_respect_policy_accepted: boolean;
  punctuality_policy_accepted: boolean;
  signed_at?: string;
  ip_address?: string;
  created_at: string;
}

export interface SkillTest {
  id: string;
  technician_id: string;
  specialization: string;
  score: number;
  grade: SkillGrade;
  questions_data?: any;
  answers_data?: any;
  completed_at?: string;
  created_at: string;
}

export interface TrainingCourse {
  id: string;
  technician_id: string;
  course_type: string;
  course_title: string;
  status: TrainingStatus;
  progress: number;
  score?: number;
  completed_at?: string;
  certificate_url?: string;
  created_at: string;
  updated_at: string;
}

export interface TechnicianTask {
  id: string;
  technician_id: string;
  maintenance_request_id?: string;
  task_title: string;
  task_description?: string;
  customer_location?: string;
  latitude?: number;
  longitude?: number;
  estimated_price?: number;
  estimated_duration?: number;
  status: TaskStatus;
  check_in_at?: string;
  check_in_photo?: string;
  check_out_at?: string;
  before_photos?: string[];
  after_photos?: string[];
  work_report?: string;
  actual_duration?: number;
  created_at: string;
  updated_at: string;
}

export interface TechnicianPerformance {
  id: string;
  technician_id: string;
  total_tasks: number;
  completed_tasks: number;
  cancelled_tasks: number;
  average_rating: number;
  punctuality_score: number;
  quality_score: number;
  professionalism_score: number;
  total_points: number;
  complaints_count: number;
  excellence_count: number;
  last_calculated_at: string;
  created_at: string;
  updated_at: string;
}

export interface TechnicianLevelData {
  id: string;
  technician_id: string;
  current_level: TechnicianLevel;
  level_updated_at: string;
  promotion_history: any[];
  created_at: string;
  updated_at: string;
}

export interface TechnicianBadge {
  id: string;
  technician_id: string;
  badge_type: BadgeType;
  badge_title: string;
  badge_description?: string;
  awarded_for?: string;
  awarded_at: string;
  created_at: string;
}

export interface MonthlyExcellenceAward {
  id: string;
  technician_id: string;
  award_month: string;
  award_type: string;
  reward_description?: string;
  reward_value?: number;
  certificate_url?: string;
  announcement_url?: string;
  created_at: string;
}

export interface AnnualGrandWinner {
  id: string;
  technician_id: string;
  award_year: number;
  story?: string;
  video_url?: string;
  certificate_url?: string;
  created_at: string;
}

export interface HallOfExcellence {
  id: string;
  technician_id: string;
  achievement_type: 'monthly' | 'annual' | 'legacy';
  achievement_title: string;
  achievement_description?: string;
  achievement_date: string;
  media_urls?: string[];
  story?: string;
  display_order: number;
  is_featured: boolean;
  created_at: string;
  technician?: {
    name: string;
    profile_image?: string;
    specialization: string;
  };
}
