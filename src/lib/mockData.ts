import { Booking, Hall } from '../types';
import { generatedTimetableBookings } from './generateTimetableData';

export const halls: Hall[] = [
  { id: 'L1', capacity: 120, location: 'Block A - Ground Floor', facilities: ['Projector', 'AC', 'WiFi'] },
  { id: 'L2', capacity: 100, location: 'Block A - First Floor', facilities: ['Projector', 'AC'] },
  { id: 'L3', capacity: 80, location: 'Block A - Second Floor', facilities: ['Projector', 'WiFi'] },
  { id: 'L4', capacity: 150, location: 'Block B - Ground Floor', facilities: ['Projector', 'AC', 'WiFi', 'Smart Board'] },
  { id: 'L5', capacity: 90, location: 'Block B - First Floor', facilities: ['Projector', 'AC'] },
  { id: 'L6', capacity: 110, location: 'Block B - Second Floor', facilities: ['Projector', 'WiFi'] },
  { id: 'L7', capacity: 100, location: 'Block C - Ground Floor', facilities: ['Projector', 'AC', 'WiFi'] },
  { id: 'L8', capacity: 85, location: 'Block C - First Floor', facilities: ['Projector'] },
  { id: 'L9', capacity: 95, location: 'Block C - Second Floor', facilities: ['Projector', 'AC'] },
  { id: 'L10', capacity: 120, location: 'Block D - Ground Floor', facilities: ['Projector', 'AC', 'WiFi', 'Lab Equipment'] },
  { id: 'L11', capacity: 100, location: 'Block D - First Floor', facilities: ['Projector', 'AC'] },
  { id: 'L12', capacity: 75, location: 'Block D - Second Floor', facilities: ['Projector', 'WiFi'] },
  { id: 'L13', capacity: 130, location: 'Block E - Ground Floor', facilities: ['Projector', 'AC', 'WiFi'] },
  { id: 'L14', capacity: 90, location: 'Block E - First Floor', facilities: ['Projector', 'AC'] },
  { id: 'L15', capacity: 105, location: 'Block E - Second Floor', facilities: ['Projector', 'WiFi'] },
  { id: 'L16', capacity: 80, location: 'Block F - Ground Floor', facilities: ['Projector', 'AC'] },
  { id: 'L17', capacity: 95, location: 'Block F - First Floor', facilities: ['Projector', 'WiFi'] },
  { id: 'L18', capacity: 110, location: 'Block F - Second Floor', facilities: ['Projector', 'AC', 'WiFi'] },
  { id: 'L19', capacity: 140, location: 'Block G - Ground Floor', facilities: ['Projector', 'AC', 'WiFi', 'Smart Board'] },
];

// Built-in timetable data for the college - Auto-generated from your CSV
// This includes all classes from Monday through Friday for your college
// The data is automatically parsed from the generateTimetableData file
export const initialBookings: Booking[] = generatedTimetableBookings;