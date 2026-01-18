import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { format, addMinutes, parse, isBefore, isAfter, startOfDay } from 'date-fns';

export interface TimeSlot {
  time: string;
  available: boolean;
  reason?: string;
}

interface UseAvailableSlotsOptions {
  vendorId?: string;
  duration?: number;
}

// Working hours configuration
const WORKING_HOURS = {
  start: '08:00',
  end: '20:00',
  slotInterval: 30, // minutes
};

// Generate all possible time slots for a day
const generateAllSlots = (): string[] => {
  const slots: string[] = [];
  const startTime = parse(WORKING_HOURS.start, 'HH:mm', new Date());
  const endTime = parse(WORKING_HOURS.end, 'HH:mm', new Date());
  
  let currentSlot = startTime;
  while (isBefore(currentSlot, endTime)) {
    slots.push(format(currentSlot, 'HH:mm'));
    currentSlot = addMinutes(currentSlot, WORKING_HOURS.slotInterval);
  }
  
  return slots;
};

export const useAvailableSlots = (options: UseAvailableSlotsOptions = {}) => {
  const [slots, setSlots] = useState<TimeSlot[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchAvailableSlots = useCallback(async (date: Date) => {
    if (!date) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const dateStr = format(date, 'yyyy-MM-dd');
      const duration = options.duration || 60;
      
      // Fetch existing appointments for the selected date
      let query = supabase
        .from('appointments')
        .select('appointment_time, duration_minutes, status')
        .eq('appointment_date', dateStr)
        .neq('status', 'cancelled');
      
      // Filter by vendor if specified
      if (options.vendorId) {
        query = query.eq('vendor_id', options.vendorId);
      }
      
      const { data: appointments, error: fetchError } = await query;
      
      if (fetchError) throw fetchError;
      
      // Generate all possible slots
      const allSlots = generateAllSlots();
      const today = new Date();
      const isToday = format(date, 'yyyy-MM-dd') === format(today, 'yyyy-MM-dd');
      const currentTime = format(today, 'HH:mm');
      
      // Check each slot for availability
      const availableSlots: TimeSlot[] = allSlots.map(slotTime => {
        // Check if slot is in the past (for today)
        if (isToday && slotTime <= currentTime) {
          return { time: slotTime, available: false, reason: 'وقت سابق' };
        }
        
        // Check if slot conflicts with existing appointments
        const slotStart = parse(slotTime, 'HH:mm', date);
        const slotEnd = addMinutes(slotStart, duration);
        
        const hasConflict = (appointments || []).some(apt => {
          const aptStart = parse(apt.appointment_time, 'HH:mm', date);
          const aptEnd = addMinutes(aptStart, apt.duration_minutes || 60);
          
          // Check for overlap
          return (
            (isBefore(slotStart, aptEnd) && isAfter(slotEnd, aptStart)) ||
            (slotStart.getTime() === aptStart.getTime())
          );
        });
        
        if (hasConflict) {
          return { time: slotTime, available: false, reason: 'محجوز' };
        }
        
        // Check if the slot extends beyond working hours
        const endOfDay = parse(WORKING_HOURS.end, 'HH:mm', date);
        if (isAfter(slotEnd, endOfDay)) {
          return { time: slotTime, available: false, reason: 'يتجاوز وقت العمل' };
        }
        
        return { time: slotTime, available: true };
      });
      
      setSlots(availableSlots);
    } catch (err) {
      console.error('Error fetching available slots:', err);
      setError(err instanceof Error ? err.message : 'خطأ في جلب الفترات المتاحة');
    } finally {
      setLoading(false);
    }
  }, [options.vendorId, options.duration]);

  const checkSlotAvailability = useCallback(async (
    date: Date, 
    time: string, 
    duration: number = 60,
    excludeAppointmentId?: string
  ): Promise<boolean> => {
    try {
      const dateStr = format(date, 'yyyy-MM-dd');
      
      let query = supabase
        .from('appointments')
        .select('id, appointment_time, duration_minutes')
        .eq('appointment_date', dateStr)
        .neq('status', 'cancelled');
      
      if (options.vendorId) {
        query = query.eq('vendor_id', options.vendorId);
      }
      
      if (excludeAppointmentId) {
        query = query.neq('id', excludeAppointmentId);
      }
      
      const { data: appointments, error } = await query;
      
      if (error) throw error;
      
      const slotStart = parse(time, 'HH:mm', date);
      const slotEnd = addMinutes(slotStart, duration);
      
      const hasConflict = (appointments || []).some(apt => {
        const aptStart = parse(apt.appointment_time, 'HH:mm', date);
        const aptEnd = addMinutes(aptStart, apt.duration_minutes || 60);
        
        return (
          (isBefore(slotStart, aptEnd) && isAfter(slotEnd, aptStart)) ||
          (slotStart.getTime() === aptStart.getTime())
        );
      });
      
      return !hasConflict;
    } catch (err) {
      console.error('Error checking slot availability:', err);
      return false;
    }
  }, [options.vendorId]);

  return {
    slots,
    loading,
    error,
    fetchAvailableSlots,
    checkSlotAvailability,
    availableSlots: slots.filter(s => s.available),
    bookedSlots: slots.filter(s => !s.available),
  };
};
