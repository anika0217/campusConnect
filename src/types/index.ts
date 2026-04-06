export type UserRole = 'admin' | 'faculty' | 'student';

export type Branch = 'CSE' | 'ECE' | 'CCE' | 'MECH';
export type Year = 'Y22' | 'Y23' | 'Y24' | 'Y25' | 'Y21';
export type Batch = 'A1' | 'A2' | 'A3' | 'B1' | 'B2' | 'B3';
export type HallId = 'L1' | 'L2' | 'L3' | 'L4' | 'L5' | 'L6' | 'L7' | 'L8' | 'L9' | 'L10' | 
                     'L11' | 'L12' | 'L13' | 'L14' | 'L15' | 'L16' | 'L17' | 'L18' | 'L19';

export interface Booking {
  id: string;
  hallId: HallId;
  year: string; // Flexible to accommodate "Y25", "Y24", "TBD", "Y21 & Older", etc.
  branch: string; // Flexible to accommodate complex branch combinations
  courseName: string;
  date: string;
  startTime: string;
  endTime: string;
  isExtraClass: boolean;
  facultyName?: string;
  classType?: string; // IC, PC, PE, OE, Lab, Repeaters, etc.
  
  // Rescheduling properties
  isRescheduled?: boolean;              // True if this is a rescheduled class
  originalDate?: string;                 // Original date of the class
  originalStartTime?: string;            // Original start time
  originalEndTime?: string;              // Original end time
  rescheduledFrom?: string;              // Start date of reschedule period
  rescheduledUntil?: string;             // End date of reschedule period
  originalBookingId?: string;            // ID of the original timetable class
  rescheduleReason?: string;             // Optional reason for rescheduling
}

export interface Hall {
  id: HallId;
  capacity: number;
  location: string;
  facilities: string[];
}

export interface Student {
  id: string;
  name: string;
  year: Year;
  branch: Branch;
  batch: Batch;
}