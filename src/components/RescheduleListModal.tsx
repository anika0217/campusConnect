import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from './ui/dialog';
import { Button } from './ui/button';
import { Booking } from '../types';
import { Calendar, Clock, MapPin, BookOpen, RotateCcw } from 'lucide-react';
import { Badge } from './ui/badge';

interface RescheduleListModalProps {
  isOpen: boolean;
  onClose: () => void;
  bookings: Booking[];
  facultyName?: string;
  onSelectBooking: (booking: Booking) => void;
}

const DAYS_OF_WEEK = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

const REFERENCE_WEEK_DATES = [
  '2025-09-01', // Monday
  '2025-09-02', // Tuesday  
  '2025-09-03', // Wednesday
  '2025-09-04', // Thursday
  '2025-09-05', // Friday
  '2025-09-06', // Saturday
];

export function RescheduleListModal({ 
  isOpen, 
  onClose, 
  bookings, 
  facultyName,
  onSelectBooking
}: RescheduleListModalProps) {
  // Get all timetable classes (non-extra) - now available for all faculty
  const myClasses = bookings.filter(b => !b.isExtraClass);

  // Group classes by day of week
  const classesByDay: { [key: number]: Booking[] } = {};
  myClasses.forEach(booking => {
    const dayIndex = REFERENCE_WEEK_DATES.indexOf(booking.date);
    if (dayIndex !== -1) {
      if (!classesByDay[dayIndex]) {
        classesByDay[dayIndex] = [];
      }
      classesByDay[dayIndex].push(booking);
    }
  });

  // Sort classes in each day by start time
  Object.keys(classesByDay).forEach(dayIndex => {
    classesByDay[parseInt(dayIndex)].sort((a, b) => 
      a.startTime.localeCompare(b.startTime)
    );
  });

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-3xl bg-gradient-to-r from-purple-600 to-purple-800 bg-clip-text text-transparent">
            All Classes - Select to Reschedule
          </DialogTitle>
          <DialogDescription className="text-base">
            Choose any class from the timetable to reschedule. All timetable classes are shown below.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {myClasses.length === 0 ? (
            <div className="text-center py-16 text-gray-500">
              <div className="bg-gray-100 rounded-full w-24 h-24 flex items-center justify-center mx-auto mb-4">
                <BookOpen className="h-12 w-12 text-gray-400" />
              </div>
              <p className="text-lg font-semibold text-gray-700">No classes found</p>
              <p className="text-sm mt-2">Make sure you have classes assigned in the timetable.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {DAYS_OF_WEEK.map((day, dayIndex) => {
                const dayClasses = classesByDay[dayIndex] || [];
                if (dayClasses.length === 0) return null;

                return (
                  <div key={day} className="border-2 border-gray-200 rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                    <div className="bg-gradient-to-r from-[#60A5FA] to-[#3B9FF5] px-5 py-3">
                      <h3 className="font-semibold text-white text-lg">{day}</h3>
                    </div>
                    <div className="p-4 space-y-3 bg-gray-50">
                      {dayClasses.map(booking => (
                        <div 
                          key={booking.id}
                          className="bg-white border-2 border-gray-200 rounded-xl p-4 hover:border-purple-400 hover:shadow-lg transition-all group"
                        >
                          <div className="flex items-center justify-between gap-4">
                            <div className="flex-1 space-y-3">
                              <div className="flex items-center gap-3 flex-wrap">
                                <div className="flex items-center gap-2">
                                  <div className="bg-blue-100 p-2 rounded-lg">
                                    <BookOpen className="h-5 w-5 text-blue-600" />
                                  </div>
                                  <span className="font-semibold text-lg text-gray-900">{booking.courseName}</span>
                                </div>
                                {booking.isRescheduled && (
                                  <Badge className="text-xs bg-purple-600 px-3 py-1">Rescheduled</Badge>
                                )}
                              </div>
                              
                              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                                <div className="flex items-center gap-2 text-sm text-gray-600 bg-gray-50 rounded-lg px-3 py-2">
                                  <Clock className="h-4 w-4 text-blue-600" />
                                  <span className="font-medium">{booking.startTime} - {booking.endTime}</span>
                                </div>
                                <div className="flex items-center gap-2 text-sm text-gray-600 bg-gray-50 rounded-lg px-3 py-2">
                                  <MapPin className="h-4 w-4 text-green-600" />
                                  <span className="font-medium">{booking.hallId}</span>
                                </div>
                                <div className="flex items-center gap-2 text-sm text-gray-600 bg-gray-50 rounded-lg px-3 py-2">
                                  <Calendar className="h-4 w-4 text-purple-600" />
                                  <span className="font-medium">{booking.year} {booking.branch}</span>
                                </div>
                              </div>

                              {booking.isRescheduled && booking.originalStartTime && (
                                <div className="flex items-center gap-2 text-sm text-purple-600 bg-purple-50 rounded-lg px-3 py-2">
                                  <RotateCcw className="h-3 w-3" />
                                  <span className="italic">Originally scheduled at: {booking.originalStartTime}</span>
                                </div>
                              )}
                            </div>

                            <Button
                              size="lg"
                              onClick={() => {
                                onSelectBooking(booking);
                              }}
                              className="bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 shadow-md hover:shadow-lg transition-all group-hover:scale-105"
                            >
                              <RotateCcw className="h-5 w-5 mr-2" />
                              Reschedule
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}