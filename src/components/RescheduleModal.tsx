import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from './ui/dialog';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Textarea } from './ui/textarea';
import { Badge } from './ui/badge';
import { Booking, HallId } from '../types';
import { Calendar, Clock, MapPin, BookOpen, AlertTriangle } from 'lucide-react';
import { Calendar as CalendarComponent } from './ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover';

interface RescheduleModalProps {
  isOpen: boolean;
  onClose: () => void;
  booking: Booking | null;
  onReschedule: (
    originalBooking: Booking,
    newDate: string,
    newStartTime: string,
    newEndTime: string,
    newHallId: HallId,
    fromDate: string,
    toDate: string,
    reason?: string
  ) => void;
  halls: HallId[];
  bookings: Booking[];
}

const TIME_SLOTS = [
  '08:00', '09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00', '18:00', '19:00'
];

export function RescheduleModal({ 
  isOpen, 
  onClose, 
  booking, 
  onReschedule,
  halls,
  bookings
}: RescheduleModalProps) {
  const [newDate, setNewDate] = useState<Date | undefined>(undefined);
  const [newStartTime, setNewStartTime] = useState('09:00');
  const [newEndTime, setNewEndTime] = useState('10:00');
  const [newHallId, setNewHallId] = useState<HallId>('L1');
  const [fromDate, setFromDate] = useState<Date | undefined>(undefined);
  const [toDate, setToDate] = useState<Date | undefined>(undefined);
  const [reason, setReason] = useState('');
  const [conflicts, setConflicts] = useState<string[]>([]);

  // Initialize form when booking changes
  useEffect(() => {
    if (booking) {
      setNewHallId(booking.hallId);
      setNewStartTime(booking.startTime);
      
      // Calculate end time (assuming 1 hour duration)
      const startHour = parseInt(booking.startTime.split(':')[0]);
      const endHour = startHour + 1;
      setNewEndTime(`${endHour.toString().padStart(2, '0')}:00`);
      
      // Set default dates
      const today = new Date();
      setNewDate(today);
      setFromDate(today);
      
      // Default to 1 month from today
      const oneMonthLater = new Date(today);
      oneMonthLater.setMonth(oneMonthLater.getMonth() + 1);
      setToDate(oneMonthLater);
    }
  }, [booking]);

  // Check for conflicts when time/hall changes
  useEffect(() => {
    if (newDate && newStartTime && newHallId) {
      checkConflicts();
    }
  }, [newDate, newStartTime, newHallId]);

  const checkConflicts = () => {
    if (!newDate || !booking) return;

    const newDateStr = newDate.toISOString().split('T')[0];
    const conflictingBookings = bookings.filter(b => 
      b.date === newDateStr && 
      b.startTime === newStartTime && 
      b.hallId === newHallId &&
      b.id !== booking.id
    );

    if (conflictingBookings.length > 0) {
      setConflicts(conflictingBookings.map(b => 
        `${b.courseName} (${b.facultyName || 'Unknown'})`
      ));
    } else {
      setConflicts([]);
    }
  };

  const handleSubmit = () => {
    if (!booking || !newDate || !fromDate || !toDate) return;

    const newDateStr = newDate.toISOString().split('T')[0];
    const fromDateStr = fromDate.toISOString().split('T')[0];
    const toDateStr = toDate.toISOString().split('T')[0];

    onReschedule(
      booking,
      newDateStr,
      newStartTime,
      newEndTime,
      newHallId,
      fromDateStr,
      toDateStr,
      reason
    );

    onClose();
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (!booking) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl">Reschedule Class</DialogTitle>
          <DialogDescription>
            Reschedule this class to a different date and time. The original schedule will be updated.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Original Class Information */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 space-y-2">
            <h3 className="font-semibold text-blue-900 mb-3">Original Class Details</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="flex items-center gap-2 text-sm">
                <BookOpen className="h-4 w-4 text-blue-500" />
                <span className="text-gray-600">Course:</span>
                <span className="font-medium">{booking.courseName}</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Clock className="h-4 w-4 text-blue-500" />
                <span className="text-gray-600">Time:</span>
                <span className="font-medium">{booking.startTime} - {booking.endTime}</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Calendar className="h-4 w-4 text-blue-500" />
                <span className="text-gray-600">Day:</span>
                <span className="font-medium">{formatDate(booking.date)}</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <MapPin className="h-4 w-4 text-blue-600" />
                <span className="text-gray-600">Hall:</span>
                <span className="font-medium">{booking.hallId}</span>
              </div>
              <div className="flex items-center gap-2 text-sm col-span-2">
                <span className="text-gray-600">Year/Branch:</span>
                <Badge variant="outline">{booking.year}</Badge>
                <Badge variant="outline">{booking.branch}</Badge>
              </div>
            </div>
          </div>

          {/* New Schedule */}
          <div className="space-y-4">
            <h3 className="font-semibold text-gray-900">New Schedule</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>New Date</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className="w-full justify-start text-left"
                    >
                      <Calendar className="mr-2 h-4 w-4" />
                      {newDate ? newDate.toLocaleDateString() : 'Pick a date'}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <CalendarComponent
                      mode="single"
                      selected={newDate}
                      onSelect={setNewDate}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>

              <div className="space-y-2">
                <Label>New Hall</Label>
                <Select value={newHallId} onValueChange={(value) => setNewHallId(value as HallId)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {halls.map(hall => (
                      <SelectItem key={hall} value={hall}>{hall}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Start Time</Label>
                <Select value={newStartTime} onValueChange={setNewStartTime}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {TIME_SLOTS.map(time => (
                      <SelectItem key={time} value={time}>{time}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>End Time</Label>
                <Select value={newEndTime} onValueChange={setNewEndTime}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {TIME_SLOTS.map(time => (
                      <SelectItem key={time} value={time}>{time}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Conflicts Warning */}
            {conflicts.length > 0 && (
              <div className="bg-orange-50 border border-orange-200 rounded-lg p-3 flex items-start gap-2">
                <AlertTriangle className="h-5 w-5 text-orange-600 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-orange-900">Slot Conflict Detected</p>
                  <p className="text-sm text-orange-700 mt-1">
                    The following class(es) are already scheduled:
                  </p>
                  <ul className="text-sm text-orange-700 list-disc list-inside mt-1">
                    {conflicts.map((conflict, idx) => (
                      <li key={idx}>{conflict}</li>
                    ))}
                  </ul>
                </div>
              </div>
            )}
          </div>

          {/* Reschedule Duration */}
          <div className="space-y-4">
            <h3 className="font-semibold text-gray-900">Reschedule Duration</h3>
            <p className="text-sm text-gray-600">
              This change will apply to all occurrences of this class within the specified date range.
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>From Date</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className="w-full justify-start text-left"
                    >
                      <Calendar className="mr-2 h-4 w-4" />
                      {fromDate ? fromDate.toLocaleDateString() : 'Pick start date'}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <CalendarComponent
                      mode="single"
                      selected={fromDate}
                      onSelect={setFromDate}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>

              <div className="space-y-2">
                <Label>To Date</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className="w-full justify-start text-left"
                    >
                      <Calendar className="mr-2 h-4 w-4" />
                      {toDate ? toDate.toLocaleDateString() : 'Pick end date'}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <CalendarComponent
                      mode="single"
                      selected={toDate}
                      onSelect={setToDate}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>
          </div>

          {/* Reason */}
          <div className="space-y-2">
            <Label>Reason for Reschedule (Optional)</Label>
            <Textarea
              placeholder="e.g., Faculty unavailable, Room maintenance, etc."
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              rows={3}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button 
            onClick={handleSubmit}
            disabled={!newDate || !fromDate || !toDate || conflicts.length > 0}
            className="bg-purple-600 hover:bg-purple-700"
          >
            Reschedule Class
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}