import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { BookingModal } from './BookingModal';
import { Booking, HallId } from '../types';
import { Calendar as CalendarIcon, Clock, MapPin, BookOpen, Filter, ChevronLeft, ChevronRight, RotateCcw, Trash2, Undo2 } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Badge } from './ui/badge';
import { Calendar } from './ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover';
import { RescheduleModal } from './RescheduleModal';
import { RescheduleListModal } from './RescheduleListModal';

interface FacultyDashboardProps {
  bookings: Booking[];
  onAddBooking: (booking: Omit<Booking, 'id'>) => void;
  facultyName?: string;
  onDeleteBooking?: (bookingId: string) => void;
  onRescheduleBooking?: (
    originalBooking: Booking,
    newDate: string,
    newStartTime: string,
    newEndTime: string,
    newHallId: HallId,
    fromDate: string,
    toDate: string,
    reason?: string
  ) => void;
  onUndo?: () => void;
  canUndo?: boolean;
}

const TIME_SLOTS = [
  '08:00', '09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00', '18:00', '19:00'
];

const DAYS_OF_WEEK = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

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

export function FacultyDashboard({ bookings, onAddBooking, facultyName, onRescheduleBooking, onDeleteBooking, onUndo, canUndo }: FacultyDashboardProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isRescheduleModalOpen, setIsRescheduleModalOpen] = useState(false);
  const [isRescheduleListModalOpen, setIsRescheduleListModalOpen] = useState(false);
  const [selectedBookingForReschedule, setSelectedBookingForReschedule] = useState<Booking | null>(null);
  const today = new Date().toISOString().split('T')[0];
  const [selectedDate, setSelectedDate] = useState(today);
  const [selectedTime, setSelectedTime] = useState('09:00');
  const [viewMode, setViewMode] = useState<'month' | 'timetable'>('timetable');
  
  // Timetable filters
  const [filterBatch, setFilterBatch] = useState<string>('all');
  const [filterBranch, setFilterBranch] = useState<string>('all');
  const [filterHall, setFilterHall] = useState<string>('all');
  
  // Monthly calendar state
  const [calendarDate, setCalendarDate] = useState<Date>(new Date());
  const [selectedMonthDate, setSelectedMonthDate] = useState<Date | undefined>(new Date());

  // Get faculty's courses from bookings (courses they teach)
  const getFacultyCourses = () => {
    const courses = Array.from(new Set(
      bookings
        .filter(b => b.facultyName === facultyName && !b.isExtraClass)
        .map(b => b.courseName)
    ));
    
    // Debug logging
    console.log('🔍 Faculty Dashboard Debug:');
    console.log('Faculty Name:', facultyName);
    console.log('Total Bookings:', bookings.length);
    console.log('Matching Courses:', courses);
    console.log('Sample faculty names in bookings:', Array.from(new Set(bookings.slice(0, 20).map(b => b.facultyName))));
    
    return courses;
  };

  const facultyCourses = getFacultyCourses();

  // Get bookings for a specific date and time
  const getBookingForSlot = (date: string, time: string) => {
    return bookings.find(
      booking => booking.date === date && booking.startTime === time
    );
  };

  // Get timetable classes for a specific day-of-week
  const getTimetableForDay = (dayIndex: number) => {
    const referenceDate = REFERENCE_WEEK_DATES[dayIndex];
    
    // Get regular timetable classes (not rescheduled away)
    let classes = bookings.filter(booking => 
      booking.date === referenceDate && !booking.isExtraClass && !booking.isRescheduled
    );
    
    // Calculate the next occurrence of this day
    const today = new Date();
    const currentDayOfWeek = today.getDay(); // 0 = Sunday, 1 = Monday, etc.
    const targetDayOfWeek = dayIndex + 1; // 0->1 (Monday), 1->2 (Tuesday), etc.
    
    let daysUntil = targetDayOfWeek - currentDayOfWeek;
    if (daysUntil <= 0) {
      daysUntil += 7; // Move to next week if day has passed
    }
    
    const targetDate = new Date(today);
    targetDate.setDate(today.getDate() + daysUntil);
    const nextOccurrenceDate = targetDate.toISOString().split('T')[0];
    
    // Get extra classes for this next occurrence
    const extraClasses = bookings.filter(booking => 
      booking.date === nextOccurrenceDate && booking.isExtraClass && !booking.isRescheduled
    );
    
    // Get classes that have been rescheduled TO this next occurrence
    const rescheduledToThisDate = bookings.filter(booking =>
      booking.isRescheduled &&
      booking.date === nextOccurrenceDate
    );
    
    // Check which regular classes have been rescheduled away from their original time
    const rescheduledAwayIds = bookings
      .filter(booking => 
        booking.isRescheduled && 
        booking.originalDate === referenceDate &&
        nextOccurrenceDate >= (booking.rescheduledFrom || '') &&
        nextOccurrenceDate <= (booking.rescheduledUntil || '')
      )
      .map(booking => booking.originalBookingId);
    
    // Remove classes that have been rescheduled away
    classes = classes.filter(booking => !rescheduledAwayIds.includes(booking.id));
    
    // Combine regular, extra, and rescheduled classes
    classes = [...classes, ...extraClasses, ...rescheduledToThisDate];
    
    // Apply filters
    if (filterBatch !== 'all') {
      // When filtering by batch (e.g., Y23), show all sections of that batch
      classes = classes.filter(b => {
        // Extract the year prefix from batch/branch names (e.g., "Y23" from "ECE-A1" or "CSE-B1")
        const batchYear = b.year.match(/^Y\d{2}/)?.[0] || b.year;
        return batchYear === filterBatch || b.year === filterBatch || b.year === 'All' || b.year === 'TBD';
      });
    }
    
    if (filterBranch !== 'all') {
      // Filter by branch, handling sub-sections
      classes = classes.filter(b => {
        // Check if branch matches exactly or starts with the filter (e.g., "CSE-B1" starts with "CSE")
        return b.branch === filterBranch || 
               b.branch.startsWith(filterBranch + '-') ||
               b.branch === 'All' ||
               b.branch === 'TBD';
      });
    }
    
    if (filterHall !== 'all') {
      classes = classes.filter(b => b.hallId === filterHall);
    }
    
    return classes.sort((a, b) => a.startTime.localeCompare(b.startTime));
  };

  // Extract unique batches and branches from bookings
  // Filter to only show main batches (Y22, Y23, Y24, Y25) not the sub-sections
  const uniqueBatches = ['all', ...Array.from(new Set(
    bookings
      .map(b => b.year)
      .filter(y => y && y !== 'TBD' && /^Y\d{2}$/.test(y)) // Only match Y22, Y23, Y24, Y25 format
  ))].sort();
  const uniqueBranches = ['all', ...Array.from(new Set(bookings.map(b => b.branch).filter(br => br && br !== 'TBD')))];
  const uniqueHalls = ['all', ...Array.from(new Set(bookings.map(b => b.hallId).filter(h => h)))];

  // Generate week dates starting from Monday
  const getWeekDates = () => {
    const today = new Date();
    const dayOfWeek = today.getDay(); // 0 = Sunday, 1 = Monday, etc.
    const diff = dayOfWeek === 0 ? -6 : 1 - dayOfWeek; // Calculate days to Monday
    const monday = new Date(today);
    monday.setDate(today.getDate() + diff);
    
    return Array.from({ length: 6 }, (_, i) => {
      const date = new Date(monday);
      date.setDate(monday.getDate() + i);
      return date.toISOString().split('T')[0];
    });
  };

  const weekDates = getWeekDates();
  
  // Format the current week for display
  const getWeekRange = () => {
    const firstDate = new Date(weekDates[0]);
    const lastDate = new Date(weekDates[weekDates.length - 1]);
    return `${firstDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - ${lastDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`;
  };

  const handleSlotClick = (date: string, time: string) => {
    const booking = getBookingForSlot(date, time);
    if (!booking) {
      setSelectedDate(date);
      setSelectedTime(time);
      setIsModalOpen(true);
    }
  };

  // Handle timetable slot click - converts day-of-week to actual future date
  const handleTimetableSlotClick = (dayIndex: number, time: string) => {
    // Get today
    const today = new Date();
    const currentDayOfWeek = today.getDay(); // 0 = Sunday, 1 = Monday, etc.
    
    // Convert our dayIndex (0 = Monday) to JavaScript day (1 = Monday)
    const targetDayOfWeek = dayIndex + 1; // 0->1 (Monday), 1->2 (Tuesday), etc.
    
    // Calculate days until target day
    let daysUntil = targetDayOfWeek - currentDayOfWeek;
    if (daysUntil <= 0) {
      daysUntil += 7; // Move to next week if day has passed
    }
    
    // Calculate the actual date
    const targetDate = new Date(today);
    targetDate.setDate(today.getDate() + daysUntil);
    const dateStr = targetDate.toISOString().split('T')[0];
    
    setSelectedDate(dateStr);
    setSelectedTime(time);
    setIsModalOpen(true);
  };

  return (
    <div className="space-y-8">
      {/* Enhanced Header with Gradient */}
      <div className="bg-gradient-to-r from-[#60A5FA] to-[#3B9FF5] rounded-2xl shadow-xl p-8 text-white relative z-10">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2">
            <h1 className="text-4xl lg:text-5xl">Welcome Back!</h1>
            <p className="text-blue-50 text-lg">{facultyName || 'Faculty Member'}</p>
            {facultyCourses.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-3">
                <span className="text-sm text-blue-50">Teaching:</span>
                {facultyCourses.map((course, idx) => (
                  <Badge key={idx} className="bg-white/20 text-white border-white/30 hover:bg-white/30">
                    {course}
                  </Badge>
                ))}
              </div>
            )}
          </div>
          <div className="flex gap-3 flex-wrap relative z-20">
            {onUndo && (
              <Button 
                onClick={onUndo}
                disabled={!canUndo}
                className="bg-amber-600 hover:bg-amber-700 disabled:bg-gray-400 disabled:cursor-not-allowed shadow-lg hover:shadow-xl transition-all flex items-center gap-2 px-6 py-6 relative z-30"
                title={canUndo ? "Undo last action" : "No actions to undo"}
              >
                <Undo2 className="h-5 w-5" />
                <span>Undo</span>
              </Button>
            )}
            {onRescheduleBooking && (
              <Button 
                onClick={() => setIsRescheduleListModalOpen(true)}
                className="bg-purple-600 hover:bg-purple-700 shadow-lg hover:shadow-xl transition-all flex items-center gap-2 px-6 py-6 relative z-30"
              >
                <RotateCcw className="h-5 w-5" />
                <span>Reschedule Classes</span>
              </Button>
            )}
            <Popover>
              <PopoverTrigger asChild>
                <Button 
                  variant="outline"
                  className="flex items-center gap-2 px-6 py-6 bg-white hover:bg-blue-50 rounded-lg border-2 border-white/30 text-blue-900 hover:text-blue-800 transition-colors shadow-lg relative z-30"
                >
                  <CalendarIcon className="h-5 w-5" />
                  <span>{getWeekRange()}</span>
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="end">
                <div className="p-4 space-y-3">
                  <div>
                    <Calendar
                      mode="single"
                      selected={selectedMonthDate}
                      onSelect={(date) => {
                        setSelectedMonthDate(date);
                        if (date) {
                          setSelectedDate(date.toISOString().split('T')[0]);
                          setCalendarDate(date);
                          // Switch to monthly view to show the selected date
                          setViewMode('month');
                        }
                      }}
                      initialFocus
                      modifiers={{
                        hasExtraClass: (date) => {
                          const dateStr = date.toISOString().split('T')[0];
                          return bookings.some(b => b.date === dateStr && b.isExtraClass);
                        }
                      }}
                      modifiersStyles={{
                        hasExtraClass: {
                          backgroundColor: '#fed7aa',
                          fontWeight: 'bold'
                        }
                      }}
                    />
                  </div>
                  <div className="flex gap-3 text-xs pt-2 border-t">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded bg-orange-200"></div>
                      <span>Extra Classes</span>
                    </div>
                  </div>
                </div>
              </PopoverContent>
            </Popover>
          </div>
        </div>
      </div>

      <Tabs value={viewMode} onValueChange={(v) => setViewMode(v as 'month' | 'timetable')}>
        <TabsList>
          <TabsTrigger value="timetable">Timetable</TabsTrigger>
          <TabsTrigger value="month">Monthly View</TabsTrigger>
        </TabsList>

        <TabsContent value="month" className="mt-6">
          <Card className="bg-white shadow-md border-gray-200">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Monthly Calendar View</CardTitle>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <CalendarIcon className="h-4 w-4" />
                  <span>
                    {calendarDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                  </span>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Calendar */}
                <div className="flex flex-col items-center">
                  <Calendar
                    mode="single"
                    selected={selectedMonthDate}
                    onSelect={(date) => {
                      setSelectedMonthDate(date);
                      if (date) {
                        setSelectedDate(date.toISOString().split('T')[0]);
                      }
                    }}
                    month={calendarDate}
                    onMonthChange={setCalendarDate}
                    className="rounded-md border"
                    modifiers={{
                      hasExtraClass: (date) => {
                        const dateStr = date.toISOString().split('T')[0];
                        return bookings.some(b => b.date === dateStr && b.isExtraClass);
                      }
                    }}
                    modifiersStyles={{
                      hasExtraClass: {
                        backgroundColor: '#fed7aa',
                        fontWeight: 'bold'
                      }
                    }}
                  />
                  <div className="mt-4 flex gap-4 text-xs">
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 rounded bg-blue-100 border border-blue-300"></div>
                      <span>Selected</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 rounded bg-orange-200"></div>
                      <span>Has Extra Classes</span>
                    </div>
                  </div>
                </div>

                {/* Selected Date Details */}
                <div>
                  <h3 className="text-lg mb-3">
                    {selectedMonthDate 
                      ? selectedMonthDate.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })
                      : 'Select a date'}
                  </h3>
                  
                  {selectedMonthDate && (
                    <div className="space-y-3">
                      {/* Classes on selected date */}
                      {(() => {
                        const dateStr = selectedMonthDate.toISOString().split('T')[0];
                        const dayClasses = bookings.filter(b => b.date === dateStr);
                        const extraClasses = dayClasses.filter(b => b.isExtraClass);
                        
                        return (
                          <>
                            {extraClasses.length > 0 && (
                              <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                                <h4 className="text-sm font-semibold mb-2 text-orange-900">
                                  Extra Classes ({extraClasses.length})
                                </h4>
                                <div className="space-y-2">
                                  {extraClasses.map(booking => (
                                    <div key={booking.id} className="text-sm bg-white p-2 rounded border border-orange-100">
                                      <div className="flex items-center gap-2">
                                        <Clock className="h-3 w-3 text-orange-600" />
                                        <span className="font-medium">{booking.startTime}</span>
                                      </div>
                                      <div className="text-gray-700 mt-1">{booking.courseName}</div>
                                      <div className="text-gray-500 text-xs mt-1">
                                        {booking.hallId} • {booking.year} {booking.branch}
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}
                            
                            <Button 
                              onClick={() => {
                                setSelectedDate(dateStr);
                                setIsModalOpen(true);
                              }}
                              className="w-full bg-blue-600 hover:bg-blue-700"
                            >
                              <CalendarIcon className="h-4 w-4 mr-2" />
                              Book Extra Class
                            </Button>
                          </>
                        );
                      })()}
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="timetable" className="mt-6">
          <Card className="bg-white/95 backdrop-blur-sm shadow-md border-gray-200">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>College Timetable</CardTitle>
                <Badge variant="outline" className="text-sm">
                  Weekly Schedule
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center gap-4 flex-wrap">
                  <div className="flex items-center gap-2">
                    <Filter className="h-4 w-4 text-gray-500" />
                    <span className="text-sm text-gray-600">Filters:</span>
                  </div>
                  <Select value={filterBatch} onValueChange={setFilterBatch}>
                    <SelectTrigger className="w-40">
                      <SelectValue placeholder="Batch" />
                    </SelectTrigger>
                    <SelectContent>
                      {uniqueBatches.map(batch => (
                        <SelectItem key={batch} value={batch}>
                          {batch === 'all' ? 'All Batches' : batch}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Select value={filterBranch} onValueChange={setFilterBranch}>
                    <SelectTrigger className="w-40">
                      <SelectValue placeholder="Branch" />
                    </SelectTrigger>
                    <SelectContent>
                      {uniqueBranches.map(branch => (
                        <SelectItem key={branch} value={branch}>
                          {branch === 'all' ? 'All Branches' : branch}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Select value={filterHall} onValueChange={setFilterHall}>
                    <SelectTrigger className="w-40">
                      <SelectValue placeholder="Hall" />
                    </SelectTrigger>
                    <SelectContent>
                      {uniqueHalls.map(hall => (
                        <SelectItem key={hall} value={hall}>
                          {hall === 'all' ? 'All Halls' : hall}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {(filterBatch !== 'all' || filterBranch !== 'all' || filterHall !== 'all') && (
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => {
                        setFilterBatch('all');
                        setFilterBranch('all');
                        setFilterHall('all');
                      }}
                    >
                      Clear Filters
                    </Button>
                  )}
                </div>
                <div className="overflow-x-auto">
                  <div className="min-w-[800px]">
                    {/* Header Row */}
                    <div className="grid grid-cols-7 gap-2 mb-2">
                      <div className="p-2"></div>
                      {DAYS_OF_WEEK.map((day, idx) => (
                        <div key={day} className="p-3 text-center bg-blue-50 rounded-lg">
                          <div className="text-sm text-gray-600">{day}</div>
                        </div>
                      ))}
                    </div>

                    {/* Time Slots */}
                    {TIME_SLOTS.map(time => (
                      <div key={time} className="grid grid-cols-7 gap-2 mb-2">
                        <div className="p-3 flex items-center justify-center bg-gray-50 rounded-lg">
                          <Clock className="h-4 w-4 mr-2 text-gray-500" />
                          <span className="text-sm">{time}</span>
                        </div>
                        {DAYS_OF_WEEK.map((_, dayIndex) => {
                          const classes = getTimetableForDay(dayIndex);
                          const classForTime = classes.find(c => c.startTime === time);
                          const isExtraClass = classForTime?.isExtraClass || false;
                          return (
                            <div
                              key={`${dayIndex}-${time}`}
                              onClick={() => !classForTime && handleTimetableSlotClick(dayIndex, time)}
                              className={`p-3 rounded-lg border-2 min-h-[80px] transition-all ${
                                classForTime
                                  ? isExtraClass 
                                    ? 'bg-orange-100 border-orange-300 cursor-default'
                                    : 'bg-blue-100 border-blue-300 cursor-default'
                                  : 'bg-white border-gray-200 hover:border-blue-400 hover:bg-blue-50 cursor-pointer'
                              }`}
                            >
                              {classForTime ? (
                                <div className="space-y-1">
                                  <div className="flex items-center justify-between">
                                    {isExtraClass && (
                                      <Badge className="text-xs bg-orange-600">Extra</Badge>
                                    )}
                                    {classForTime.isRescheduled && (
                                      <Badge className="text-xs bg-purple-600">Rescheduled</Badge>
                                    )}
                                  </div>
                                  <div className="text-sm">{classForTime.courseName}</div>
                                  <div className="flex items-center gap-1 text-xs text-gray-600">
                                    <MapPin className="h-3 w-3" />
                                    {classForTime.hallId}
                                  </div>
                                  <div className="text-xs text-gray-600">
                                    {classForTime.year} {classForTime.branch}
                                  </div>
                                  {classForTime.isRescheduled && classForTime.originalStartTime && (
                                    <div className="text-xs text-gray-500 italic">
                                      Originally: {classForTime.originalStartTime}
                                    </div>
                                  )}
                                  {!isExtraClass && onDeleteBooking && (
                                    <Button
                                      size="sm"
                                      variant="ghost"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        if (confirm('Are you sure you want to remove this class?')) {
                                          onDeleteBooking(classForTime.id);
                                        }
                                      }}
                                      className="mt-2 h-7 px-2 text-xs hover:bg-red-100 text-red-600 w-full"
                                    >
                                      <Trash2 className="h-3 w-3 mr-1" />
                                      Remove
                                    </Button>
                                  )}
                                  {!isExtraClass && onRescheduleBooking && (
                                    <Button
                                      size="sm"
                                      variant="ghost"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        setSelectedBookingForReschedule(classForTime);
                                      }}
                                      className="mt-2 h-7 px-2 text-xs hover:bg-blue-100 text-blue-600 w-full"
                                    >
                                      <RotateCcw className="h-3 w-3 mr-1" />
                                      Reschedule
                                    </Button>
                                  )}
                                </div>
                              ) : (
                                <div className="text-xs text-gray-400 text-center">
                                  Click to book
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <BookingModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={onAddBooking}
        selectedDate={selectedDate}
        selectedTime={selectedTime}
        bookings={bookings}
        facultyName={facultyName}
      />
      {onRescheduleBooking && (
        <RescheduleModal
          isOpen={selectedBookingForReschedule !== null}
          onClose={() => setSelectedBookingForReschedule(null)}
          booking={selectedBookingForReschedule}
          onReschedule={onRescheduleBooking}
          halls={uniqueHalls.filter(h => h !== 'all') as HallId[]}
          bookings={bookings}
        />
      )}
      {onRescheduleBooking && (
        <RescheduleListModal
          isOpen={isRescheduleListModalOpen}
          onClose={() => setIsRescheduleListModalOpen(false)}
          bookings={bookings}
          facultyName={facultyName}
          onSelectBooking={(booking) => {
            setSelectedBookingForReschedule(booking);
            setIsRescheduleListModalOpen(false);
            // Use a small delay to ensure smooth transition
            setTimeout(() => {
              // The RescheduleModal will open automatically because selectedBookingForReschedule is not null
            }, 100);
          }}
        />
      )}
    </div>
  );
}