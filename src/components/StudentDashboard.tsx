import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Booking, Student } from '../types';
import { Calendar, Clock, MapPin, BookOpen, AlertCircle, ChevronLeft, ChevronRight } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Button } from './ui/button';

interface StudentDashboardProps {
  bookings: Booking[];
  student: Student;
}

const DAYS_OF_WEEK = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

export function StudentDashboard({ bookings, student }: StudentDashboardProps) {
  const [weekOffset, setWeekOffset] = useState(0); // 0 = current week, 1 = next week, -1 = previous week
  
  // Debug logging
  console.log('📚 Student Dashboard - Total bookings:', bookings.length);
  console.log('👤 Student info:', student);
  console.log('🎓 Student Year:', student.year, 'Branch:', student.branch, 'Batch:', student.batch);
  
  // Sample a few bookings to see their structure
  console.log('📋 Sample bookings:', bookings.slice(0, 5).map(b => ({
    course: b.courseName,
    year: b.year,
    branch: b.branch,
    date: b.date,
    time: b.startTime
  })));
  
  // Filter bookings for the logged-in student
  const studentBookings = bookings.filter(booking => {
    // Year matching: Check if booking year matches student year
    const bookingYear = booking.year.match(/^Y\d{2}/)?.[0] || booking.year;
    const yearMatch = bookingYear === student.year || 
                      booking.year === student.year ||
                      booking.year.includes(student.year) || 
                      booking.year === 'All' ||
                      booking.year === 'TBD';
    
    if (!yearMatch) return false;
    
    // Branch matching
    // For extra classes or specific batch bookings, match exactly
    const exactBranchMatch = booking.branch === student.branch;
    const exactBranchBatchMatch = booking.branch === `${student.branch}-${student.batch}`;
    const generalMatch = booking.branch === 'All' || booking.branch === 'TBD';
    
    // Handle Y25 batch structure: booking.branch = "A1", "A2", "B1", etc. (just the batch identifier)
    // For Y25 students, we only need to match the batch since all Y25 students take same courses regardless of branch
    // NOTE: Y25 students still select a branch during registration, but the timetable is only batch-based
    if (student.year === 'Y25') {
      // For Y25, the booking.branch field contains just the batch identifier (A1, A2, B1, etc.)
      // Match if booking batch equals student batch, or if it's a general booking
      const batchMatch = booking.branch === student.batch || 
                         booking.branch === 'All' ||
                         booking.branch === 'TBD' ||
                         // Also check if booking.branch contains the batch (in case of future changes)
                         booking.branch.includes(student.batch);
      
      if (batchMatch) {
        console.log('✓ Y25 class matched:', {
          booking: booking.courseName,
          bookingBatch: booking.branch,
          studentBatch: student.batch,
          time: `${booking.startTime}-${booking.endTime}`
        });
      }
      
      return batchMatch;
    }
    
    // Handle Y23 and other years' batch structure: booking.branch = "CSE-A1", "ECE-B2", etc.
    // For Y23 students, we need to match both branch and batch
    const expectedBranchBatch = `${student.branch}-${student.batch}`;
    
    // Check if booking.branch is in "BRANCH-BATCH" format (e.g., "CSE-B1", "ECE-A2")
    const branchBatchParts = booking.branch.match(/^([A-Z]+)-([AB][123])$/);
    if (branchBatchParts) {
      const [, bookingBranchPart, bookingBatchPart] = branchBatchParts;
      // If booking has a specific branch-batch, both must match
      const matches = bookingBranchPart === student.branch && bookingBatchPart === student.batch;
      
      if (matches) {
        console.log('✓ Y23 class matched (branch-batch):', {
          booking: booking.courseName,
          bookingBranch: booking.branch,
          studentBranch: student.branch,
          studentBatch: student.batch,
          time: `${booking.startTime}-${booking.endTime}`
        });
      }
      
      return matches;
    }
    
    // Handle general branch bookings (no specific batch, applies to all batches of that branch)
    // e.g., booking.branch = "CSE", "ECE", "CCE", "MECH"
    const branchMatch = booking.branch === student.branch || 
                        booking.branch === 'All' ||
                        booking.branch === 'TBD';
    
    if (branchMatch) {
      console.log('✓ General class matched:', {
        booking: booking.courseName,
        bookingBranch: booking.branch,
        studentBranch: student.branch,
        time: `${booking.startTime}-${booking.endTime}`
      });
    }
    
    return branchMatch;
  });
  
  console.log('✓ Filtered bookings for student:', studentBookings.length);
  
  if (studentBookings.length === 0) {
    console.warn('⚠️ No bookings found for student. This could mean:');
    console.warn(`   - No timetable data exists for ${student.year} ${student.branch} ${student.batch}`);
    console.warn(`   - The filtering logic needs adjustment`);
    console.warn(`   - Check that timetable data is loaded correctly`);
  } else {
    console.log('🔍 Sample filtered bookings:', studentBookings.slice(0, 3).map(b => ({
      course: b.courseName,
      year: b.year,
      branch: b.branch,
      date: b.date,
      time: b.startTime
    })));
  }

  // Get week dates starting from Monday with offset support
  const getWeekDates = (offset: number = 0) => {
    const today = new Date();
    const dayOfWeek = today.getDay(); // 0 = Sunday, 1 = Monday, etc.
    const diff = dayOfWeek === 0 ? -6 : 1 - dayOfWeek; // Calculate days to Monday
    const monday = new Date(today);
    monday.setDate(today.getDate() + diff + (offset * 7)); // Add week offset
    
    return Array.from({ length: 6 }, (_, i) => {
      const date = new Date(monday);
      date.setDate(monday.getDate() + i);
      return date.toISOString().split('T')[0];
    });
  };

  const weekDates = getWeekDates(weekOffset);
  const today = new Date().toISOString().split('T')[0];
  
  // Get week label
  const getWeekLabel = () => {
    if (weekOffset === 0) return 'This Week';
    if (weekOffset === 1) return 'Next Week';
    if (weekOffset === -1) return 'Previous Week';
    return `Week ${weekOffset > 0 ? '+' : ''}${weekOffset}`;
  };

  // Map current week dates to timetable reference dates (for recurring schedule)
  const getTimetableReferenceDate = (currentDate: string) => {
    const date = new Date(currentDate);
    const dayOfWeek = date.getDay(); // 0 = Sunday, 1 = Monday, etc.
    // Map to the base timetable dates used in the CSV
    // The CSV uses: Sep 1 (Mon), Sep 2 (Tue), Sep 3 (Wed), Sep 4 (Thu), Sep 5 (Fri), Sep 6 (Sat)
    const timetableBaseDates = [
      '2025-09-07', // Sunday (not used)
      '2025-09-01', // Monday -> Sep 1, 2025
      '2025-09-02', // Tuesday -> Sep 2, 2025
      '2025-09-03', // Wednesday -> Sep 3, 2025
      '2025-09-04', // Thursday -> Sep 4, 2025
      '2025-09-05', // Friday -> Sep 5, 2025
      '2025-09-06', // Saturday -> Sep 6, 2025
    ];
    return timetableBaseDates[dayOfWeek];
  };

  const getBookingsForDate = (currentDate: string) => {
    const timetableDate = getTimetableReferenceDate(currentDate);
    
    // Get recurring timetable classes for this day of week (not rescheduled)
    const recurringClasses = studentBookings.filter(
      booking => booking.date === timetableDate && !booking.isExtraClass && !booking.isRescheduled
    );
    
    // Check if any recurring classes have been rescheduled for this date
    const rescheduledClasses = studentBookings.filter(booking => 
      booking.isRescheduled && 
      booking.originalDate === timetableDate &&
      currentDate >= (booking.rescheduledFrom || '') &&
      currentDate <= (booking.rescheduledUntil || '')
    );
    
    // Get classes that have been rescheduled TO this date
    const classesRescheduledToThisDate = studentBookings.filter(booking =>
      booking.isRescheduled &&
      booking.date === currentDate
    );
    
    // Remove classes that have been rescheduled away from their original time
    const finalRecurringClasses = recurringClasses.filter(booking => {
      const isRescheduled = rescheduledClasses.some(rc => 
        rc.originalBookingId === booking.id
      );
      return !isRescheduled;
    });
    
    // Get extra classes scheduled for the actual date (non-rescheduled)
    const extraClasses = studentBookings.filter(
      booking => booking.date === currentDate && booking.isExtraClass && !booking.isRescheduled
    );
    
    return [...finalRecurringClasses, ...extraClasses, ...classesRescheduledToThisDate]
      .sort((a, b) => a.startTime.localeCompare(b.startTime));
  };

  // Today's schedule
  const todayBookings = getBookingsForDate(today);

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-4xl text-gray-900">My Schedule</h1>
          <p className="text-gray-500 mt-2">
            {student.name} • {student.year} {student.branch}-{student.batch}
          </p>
        </div>
        <Card className="md:w-48 bg-gradient-to-br from-blue-50/90 to-blue-100/90 backdrop-blur-sm border-blue-200">
          <CardContent className="p-6 text-center">
            <div className="text-sm text-blue-600 mb-1">Today's Classes</div>
            <div className="text-4xl text-blue-500">{todayBookings.length}</div>
          </CardContent>
        </Card>
      </div>

      {studentBookings.length === 0 && (
        <div className="bg-yellow-50 border-2 border-yellow-200 rounded-lg p-6">
          <div className="flex items-start gap-3">
            <AlertCircle className="h-6 w-6 text-yellow-600 mt-0.5" />
            <div>
              <h3 className="text-lg text-yellow-900 mb-2">No Timetable Data Found</h3>
              <p className="text-sm text-yellow-800 mb-2">
                We couldn't find any classes for <strong>{student.year} {student.branch} ({student.batch})</strong>.
              </p>
              <p className="text-sm text-yellow-800">
                This could mean:
              </p>
              <ul className="text-sm text-yellow-800 list-disc list-inside mt-2 space-y-1">
                <li>Your timetable hasn't been uploaded yet</li>
                <li>There might be a mismatch in your batch/branch information</li>
                <li>Check with your administrator to ensure timetable data is available</li>
              </ul>
            </div>
          </div>
        </div>
      )}

      <Tabs defaultValue="calendar">
        <TabsList>
          <TabsTrigger value="calendar">Calendar View</TabsTrigger>
          <TabsTrigger value="list">List View</TabsTrigger>
        </TabsList>

        <TabsContent value="calendar" className="mt-6">
          <Card className="bg-white/95 backdrop-blur-sm shadow-md border-gray-200">
            <CardHeader>
              <CardTitle className="mb-4">Weekly Schedule</CardTitle>
              
              {/* Week Navigation */}
              <div className="flex items-center justify-between bg-gray-50 rounded-lg p-3">
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => setWeekOffset(weekOffset - 1)}
                  className="flex items-center gap-1"
                >
                  <ChevronLeft className="h-4 w-4" />
                  Previous
                </Button>
                
                <div className="flex items-center gap-3">
                  <div className="text-center">
                    <div className="text-sm">{getWeekLabel()}</div>
                    <div className="text-xs text-gray-500">
                      {new Date(weekDates[0]).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - {new Date(weekDates[5]).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    </div>
                  </div>
                  
                  {weekOffset !== 0 && (
                    <Button 
                      variant="default" 
                      size="sm"
                      onClick={() => setWeekOffset(0)}
                      className="bg-blue-500 hover:bg-blue-600"
                    >
                      Today
                    </Button>
                  )}
                </div>
                
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => setWeekOffset(weekOffset + 1)}
                  className="flex items-center gap-1"
                >
                  Next
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {weekDates.map((date, idx) => {
                  const dayBookings = getBookingsForDate(date);
                  const isToday = date === today;
                  const hasExtraClasses = dayBookings.some(b => b.isExtraClass);
                  
                  return (
                    <Card key={date} className={`bg-white/90 backdrop-blur-sm ${isToday ? 'border-2 border-blue-500 shadow-lg' : 'border-gray-200'}`}>
                      <CardHeader className="pb-3">
                        <CardTitle className="text-lg flex items-center justify-between">
                          <span>{DAYS_OF_WEEK[idx]}</span>
                          <div className="flex items-center gap-2">
                            {isToday && (
                              <Badge variant="default" className="bg-blue-500">Today</Badge>
                            )}
                            {hasExtraClasses && (
                              <Badge variant="default" className="bg-orange-600">Extra</Badge>
                            )}
                          </div>
                        </CardTitle>
                        <p className="text-sm text-gray-500">
                          {new Date(date).toLocaleDateString('en-US', { month: 'long', day: 'numeric' })}
                        </p>
                      </CardHeader>
                      <CardContent>
                        {dayBookings.length === 0 ? (
                          <div className="text-center py-8 text-gray-400">
                            <Calendar className="h-8 w-8 mx-auto mb-2" />
                            <p className="text-sm">No classes</p>
                          </div>
                        ) : (
                          <div className="space-y-3">
                            {dayBookings.map(booking => (
                              <div
                                key={booking.id}
                                className={`p-3 rounded-lg border-l-4 ${
                                  booking.isRescheduled
                                    ? 'bg-purple-50 border-purple-500'
                                    : booking.isExtraClass
                                    ? 'bg-orange-50 border-orange-500'
                                    : 'bg-blue-50 border-blue-500'
                                }`}
                              >
                                <div className="flex items-start justify-between mb-2">
                                  <div className="flex-1">
                                    <div className="text-sm mb-1">{booking.courseName}</div>
                                    <div className="flex items-center gap-1 text-xs text-gray-600">
                                      <Clock className="h-3 w-3" />
                                      {booking.startTime} - {booking.endTime}
                                    </div>
                                    {booking.isRescheduled && booking.originalStartTime && (
                                      <div className="text-xs text-gray-500 italic mt-1">
                                        Originally: {booking.originalStartTime} - {booking.originalEndTime}
                                      </div>
                                    )}
                                  </div>
                                  <div className="flex flex-col gap-1">
                                    {booking.isRescheduled && (
                                      <Badge className="bg-purple-600 hover:bg-purple-700 text-xs">
                                        Rescheduled
                                      </Badge>
                                    )}
                                    {booking.isExtraClass && (
                                      <Badge className="bg-orange-600 hover:bg-orange-700 text-xs">
                                        Extra
                                      </Badge>
                                    )}
                                  </div>
                                </div>
                                <div className="flex items-center gap-1 text-xs text-gray-600">
                                  <MapPin className="h-3 w-3" />
                                  {booking.hallId}
                                </div>
                                {booking.facultyName && (
                                  <div className="text-xs text-gray-500 mt-1">
                                    {booking.facultyName}
                                  </div>
                                )}
                                {booking.isRescheduled && booking.rescheduleReason && (
                                  <div className="text-xs text-purple-700 mt-2 italic">
                                    Reason: {booking.rescheduleReason}
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="list" className="mt-6">
          <Card className="bg-white/95 backdrop-blur-sm shadow-md border-gray-200">
            <CardHeader>
              <CardTitle>Today's Classes - List View</CardTitle>
            </CardHeader>
            <CardContent>
              {todayBookings.length === 0 ? (
                <div className="text-center py-12 text-gray-400">
                  <BookOpen className="h-16 w-16 mx-auto mb-4" />
                  <p>No classes scheduled for today</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {todayBookings.map(booking => (
                    <div
                      key={booking.id}
                      className={`p-4 rounded-lg border-2 ${
                        booking.isExtraClass
                          ? 'bg-orange-50 border-orange-300'
                          : 'bg-white border-gray-200'
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <h3 className="text-lg">{booking.courseName}</h3>
                            {booking.isExtraClass && (
                              <Badge className="bg-orange-600 hover:bg-orange-700">
                                Extra Class
                              </Badge>
                            )}
                          </div>
                          <div className="grid grid-cols-2 gap-4 text-sm text-gray-600">
                            <div className="flex items-center gap-2">
                              <Clock className="h-4 w-4" />
                              {booking.startTime} - {booking.endTime}
                            </div>
                            <div className="flex items-center gap-2">
                              <MapPin className="h-4 w-4" />
                              Hall {booking.hallId}
                            </div>
                          </div>
                          {booking.facultyName && (
                            <div className="mt-2 text-sm text-gray-600">
                              Faculty: {booking.facultyName}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {todayBookings.filter(b => b.isExtraClass).length > 0 && (
                <div className="mt-6 p-4 bg-orange-50 border border-orange-200 rounded-lg">
                  <div className="flex items-start gap-3">
                    <AlertCircle className="h-5 w-5 text-orange-600 mt-0.5" />
                    <div>
                      <h4 className="text-sm text-orange-900">Extra Classes Today</h4>
                      <p className="text-sm text-orange-700 mt-1">
                        {todayBookings.filter(b => b.isExtraClass).length} extra class(es) scheduled
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}