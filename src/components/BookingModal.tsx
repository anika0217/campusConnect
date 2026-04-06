import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from './ui/dialog';
import { Button } from './ui/button';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Input } from './ui/input';
import { Checkbox } from './ui/checkbox';
import { Alert, AlertDescription } from './ui/alert';
import { AlertTriangle, Calendar } from 'lucide-react';
import { HallId, Year, Branch, Batch, Booking } from '../types';

interface BookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (booking: Omit<Booking, 'id'>) => void;
  selectedDate: string;
  selectedTime: string;
  bookings: Booking[];
  facultyName?: string;
}

const HALLS: HallId[] = ['L1', 'L2', 'L3', 'L4', 'L5', 'L6', 'L7', 'L8', 'L9', 'L10', 
                         'L11', 'L12', 'L13', 'L14', 'L15', 'L16', 'L17', 'L18', 'L19'];
const YEARS: Year[] = ['Y22', 'Y23', 'Y24', 'Y25'];
const BRANCHES: Branch[] = ['CSE', 'ECE', 'CCE', 'MECH'];

// Reference dates that represent a standard week (Monday-Friday)
// These dates match the timetable CSV data structure
const REFERENCE_WEEK_DATES = [
  '2025-09-01', // Monday
  '2025-09-02', // Tuesday  
  '2025-09-03', // Wednesday
  '2025-09-04', // Thursday
  '2025-09-05', // Friday
  '2025-09-06', // Saturday
];

// Define available batches for each branch based on year (matches LoginPage logic)
const getAvailableBatches = (year: Year, branch: Branch): Batch[] => {
  if (year === 'Y23') {
    // Y23 batch structure based on timetable data
    switch (branch) {
      case 'ECE':
        return ['A1', 'A2']; // ECE has A1 and A2
      case 'CSE':
        return ['B1', 'B2']; // CSE has B1 and B2
      case 'CCE':
        return ['A1', 'A2', 'A3', 'B1', 'B2', 'B3']; // CCE might have all batches
      case 'MECH':
        return ['A1', 'A2', 'A3', 'B1', 'B2', 'B3']; // MECH might have all batches
      default:
        return ['A1', 'A2', 'A3', 'B1', 'B2', 'B3'];
    }
  } else if (year === 'Y25') {
    // Y25 has all batches for all branches
    return ['A1', 'A2', 'A3', 'B1', 'B2', 'B3'];
  } else {
    // Y22, Y24 - default to all batches
    return ['A1', 'A2', 'A3', 'B1', 'B2', 'B3'];
  }
};

export function BookingModal({ isOpen, onClose, onSubmit, selectedDate, selectedTime, bookings, facultyName = 'Faculty' }: BookingModalProps) {
  const [hallId, setHallId] = useState<HallId>('L1');
  const [year, setYear] = useState<Year>('Y23');
  const [branch, setBranch] = useState<Branch>('CSE');
  const [batch, setBatch] = useState<Batch>('B1'); // Default to B1 for CSE
  const [courseName, setCourseName] = useState('');
  const [isExtraClass, setIsExtraClass] = useState(true);
  const [showWarning, setShowWarning] = useState(false);
  const [isPastDate, setIsPastDate] = useState(false);

  // Calculate end time (1 hour after start)
  const calculateEndTime = (startTime: string) => {
    const [hours, minutes] = startTime.split(':').map(Number);
    const endHours = hours + 1;
    return `${String(endHours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
  };

  // Check if a hall is occupied at the selected time and date
  const isHallOccupied = (hall: HallId) => {
    // Get the day of week for the selected date (0 = Sunday, 1 = Monday, etc.)
    const selectedDay = new Date(selectedDate + 'T00:00:00').getDay();
    // Convert to Monday-based index (0 = Monday, 1 = Tuesday, etc.)
    const dayIndex = selectedDay === 0 ? 6 : selectedDay - 1; // Sunday becomes 6, Monday-Saturday become 0-5
    // Get the reference date for this day of week from timetable
    const referenceDate = REFERENCE_WEEK_DATES[dayIndex];
    
    return bookings.some(
      booking => {
        // Check both the actual selected date AND the timetable reference date
        const matchesActualDate = booking.date === selectedDate && 
                                 booking.hallId === hall && 
                                 booking.startTime === selectedTime;
        
        const matchesTimetableDate = booking.date === referenceDate && 
                                     booking.hallId === hall && 
                                     booking.startTime === selectedTime &&
                                     !booking.isExtraClass; // Only check recurring timetable classes
        
        return matchesActualDate || matchesTimetableDate;
      }
    );
  };

  // Get available halls
  const availableHalls = HALLS.filter(hall => !isHallOccupied(hall));
  const occupiedHalls = HALLS.filter(hall => isHallOccupied(hall));

  // Check if selected date is in the past
  useEffect(() => {
    if (isOpen && selectedDate) {
      const today = new Date();
      today.setHours(0, 0, 0, 0); // Reset to start of day for accurate comparison
      const selected = new Date(selectedDate + 'T00:00:00');
      setIsPastDate(selected < today);
    }
  }, [isOpen, selectedDate]);

  // Set default hall to first available hall when modal opens
  useEffect(() => {
    if (isOpen && availableHalls.length > 0) {
      // Only update if current hall is occupied
      if (occupiedHalls.includes(hallId)) {
        setHallId(availableHalls[0]);
      }
    }
  }, [isOpen, selectedDate, selectedTime]);

  // Handle branch change and reset batch if it's not available for the new branch
  const handleBranchChange = (newBranch: Branch) => {
    setBranch(newBranch);
    const availableBatches = getAvailableBatches(year, newBranch);
    // If current batch is not available for the new branch, reset to first available batch
    if (!availableBatches.includes(batch)) {
      setBatch(availableBatches[0]);
    }
  };

  // Handle year change and reset batch if needed
  const handleYearChange = (newYear: Year) => {
    setYear(newYear);
    const availableBatches = getAvailableBatches(newYear, branch);
    // If current batch is not available for the new year, reset to first available batch
    if (!availableBatches.includes(batch)) {
      setBatch(availableBatches[0]);
    }
  };

  // Get available batches based on current year and branch
  const availableBatches = getAvailableBatches(year, branch);

  // Check if batch has 4+ classes on the selected date
  useEffect(() => {
    if (isExtraClass && year && branch && batch && selectedDate) {
      // Combine branch and batch to match the data format (e.g., "CSE-B1")
      const branchBatch = `${branch}-${batch}`;
      
      const classCountForBatch = bookings.filter(
        booking => booking.date === selectedDate && 
                  booking.year === year && 
                  booking.branch === branchBatch
      ).length;

      setShowWarning(classCountForBatch >= 4);
    } else {
      setShowWarning(false);
    }
  }, [isExtraClass, year, branch, batch, selectedDate, bookings]);

  const handleSubmit = () => {
    // Check if date is in the past
    if (isPastDate) {
      alert('Cannot book classes for past dates. Please select a future date.');
      return;
    }

    if (!courseName.trim()) {
      alert('Please enter a course name');
      return;
    }

    // Combine branch and batch for storage (e.g., "CSE-B1")
    const branchBatch = `${branch}-${batch}`;

    const newBooking: Omit<Booking, 'id'> = {
      hallId,
      year,
      branch: branchBatch, // Store as combined "BRANCH-BATCH" format
      courseName,
      date: selectedDate,
      startTime: selectedTime,
      endTime: calculateEndTime(selectedTime),
      isExtraClass,
      facultyName
    };

    onSubmit(newBooking);
    handleClose();
  };

  const handleClose = () => {
    setHallId('L1');
    setYear('Y23');
    setBranch('CSE');
    setBatch('B1');
    setCourseName('');
    setIsExtraClass(true);
    setShowWarning(false);
    setIsPastDate(false);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Book Lecture Hall</DialogTitle>
          <DialogDescription>
            Book an extra class for your batch. The system will check for conflicts and warn if the batch already has 4+ classes on the selected day.
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="date">Date & Time</Label>
            <Input 
              id="date"
              value={`${selectedDate} at ${selectedTime}`}
              disabled
              className={isPastDate ? 'bg-red-50 border-red-300' : 'bg-gray-50'}
            />
            {isPastDate && (
              <p className="text-xs text-red-600 flex items-center gap-1">
                <Calendar className="h-3 w-3" />
                This date is in the past. Please select a future date.
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="hall">Hall ID *</Label>
            <Select value={hallId} onValueChange={(value) => setHallId(value as HallId)}>
              <SelectTrigger id="hall">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {availableHalls.length > 0 && (
                  <>
                    <div className="px-2 py-1.5 text-xs text-gray-500">Available Halls</div>
                    {availableHalls.map(hall => (
                      <SelectItem key={hall} value={hall}>{hall}</SelectItem>
                    ))}
                  </>
                )}
                {occupiedHalls.length > 0 && (
                  <>
                    <div className="px-2 py-1.5 text-xs text-gray-500 border-t mt-1 pt-2">Occupied Halls</div>
                    {occupiedHalls.map(hall => {
                      const occupiedBy = bookings.find(
                        b => b.hallId === hall && b.date === selectedDate && b.startTime === selectedTime
                      );
                      return (
                        <SelectItem 
                          key={hall} 
                          value={hall} 
                          disabled
                          className="opacity-50"
                        >
                          {hall} - {occupiedBy?.courseName} ({occupiedBy?.year} {occupiedBy?.branch})
                        </SelectItem>
                      );
                    })}
                  </>
                )}
              </SelectContent>
            </Select>
            {occupiedHalls.length > 0 && (
              <p className="text-xs text-gray-500">
                {occupiedHalls.length} hall{occupiedHalls.length > 1 ? 's are' : ' is'} occupied at this time
              </p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="year">Year/Batch *</Label>
              <Select value={year} onValueChange={(value) => handleYearChange(value as Year)}>
                <SelectTrigger id="year">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {YEARS.map(y => (
                    <SelectItem key={y} value={y}>{y}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="branch">Branch *</Label>
              <Select value={branch} onValueChange={(value) => handleBranchChange(value as Branch)}>
                <SelectTrigger id="branch">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {BRANCHES.map(b => (
                    <SelectItem key={b} value={b}>{b}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="batch">Batch *</Label>
            <Select value={batch} onValueChange={(value) => setBatch(value as Batch)}>
              <SelectTrigger id="batch">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {availableBatches.map(b => (
                  <SelectItem key={b} value={b}>{b}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-xs text-gray-500">
              Full batch identifier: {year} {branch}-{batch}
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="course">Course Name *</Label>
            <Input 
              id="course"
              value={courseName}
              onChange={(e) => setCourseName(e.target.value)}
              placeholder="Enter course name"
            />
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox 
              id="extra"
              checked={isExtraClass}
              onCheckedChange={(checked) => setIsExtraClass(checked as boolean)}
            />
            <Label htmlFor="extra" className="cursor-pointer">
              Extra Class
            </Label>
          </div>

          {availableHalls.length === 0 && (
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                <span className="font-semibold">All halls are occupied</span> at this time slot. 
                Please select a different time or check the waiting list.
              </AlertDescription>
            </Alert>
          )}

          {showWarning && (
            <Alert variant="destructive" className="border-yellow-500 bg-yellow-50">
              <AlertTriangle className="h-4 w-4 text-yellow-600" />
              <AlertDescription className="text-yellow-800">
                <span className="font-semibold">Warning:</span> This batch currently has 4+ classes. 
                Booking this extra slot may make the day too hectic for students. Confirm?
              </AlertDescription>
            </Alert>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleClose}>
            Cancel
          </Button>
          <Button 
            onClick={handleSubmit} 
            className="bg-blue-500 hover:bg-blue-600"
            disabled={availableHalls.length === 0 || isPastDate}
          >
            Confirm Booking
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}