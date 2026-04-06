import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { Badge } from './ui/badge';
import { Booking, Hall } from '../types';
import { Building2, Calendar, AlertTriangle, Clock, CheckCircle, XCircle, Info } from 'lucide-react';
import { useState, useMemo } from 'react';
import { Alert, AlertDescription, AlertTitle } from './ui/alert';

interface AdminDashboardProps {
  bookings: Booking[];
  halls: Hall[];
  onAddBookings?: (bookings: Omit<Booking, 'id'>[]) => void;
}

interface ConflictDetail {
  hallId: string;
  date: string;
  startTime: string;
  endTime: string;
  conflictingBookings: Booking[];
  suggestedSolutions: string[];
}

export function AdminDashboard({ bookings, halls, onAddBookings }: AdminDashboardProps) {
  const [sortBy, setSortBy] = useState<'id' | 'capacity' | 'location'>('id');
  const [showConflictDetails, setShowConflictDetails] = useState(false);

  // Get current date and time for real-time availability
  const getCurrentDateTime = () => {
    const now = new Date();
    const currentDate = now.toISOString().split('T')[0];
    const currentTime = now.toTimeString().slice(0, 5);
    return { currentDate, currentTime };
  };

  const { currentDate, currentTime } = getCurrentDateTime();

  // Calculate today's bookings
  const todayBookings = useMemo(() => {
    return bookings.filter(b => b.date === currentDate);
  }, [bookings, currentDate]);

  // Find currently occupied halls (right now)
  const currentlyOccupiedHalls = useMemo(() => {
    return todayBookings.filter(b => {
      return b.startTime <= currentTime && b.endTime > currentTime;
    });
  }, [todayBookings, currentTime]);

  // Find available halls right now
  const currentlyAvailableHalls = useMemo(() => {
    const occupiedHallIds = new Set(currentlyOccupiedHalls.map(b => b.hallId));
    return halls.filter(h => !occupiedHallIds.has(h.id));
  }, [halls, currentlyOccupiedHalls]);

  // Enhanced conflict detection with detailed information
  const conflictDetails = useMemo(() => {
    const conflicts: ConflictDetail[] = [];
    const bookingMap = new Map<string, Booking[]>();
    
    bookings.forEach(booking => {
      const key = `${booking.date}-${booking.hallId}-${booking.startTime}`;
      if (!bookingMap.has(key)) {
        bookingMap.set(key, []);
      }
      bookingMap.get(key)!.push(booking);
    });
    
    bookingMap.forEach((bookingList, key) => {
      if (bookingList.length > 1) {
        const [date, hallId, startTime] = key.split('-');
        
        // Find alternative available halls at this time
        const occupiedAtTime = bookings.filter(
          b => b.date === date && b.startTime === startTime
        ).map(b => b.hallId);
        
        const availableHalls = halls
          .filter(h => !occupiedAtTime.includes(h.id))
          .map(h => h.id)
          .slice(0, 3);
        
        const suggestedSolutions = [
          availableHalls.length > 0 
            ? `Move one class to available halls: ${availableHalls.join(', ')}` 
            : 'No halls available at this time',
          'Reschedule one of the conflicting classes to a different time slot',
          `Contact faculty: ${bookingList.map(b => b.facultyName || 'Unknown').join(' & ')}`,
        ];

        conflicts.push({
          hallId,
          date,
          startTime,
          endTime: bookingList[0].endTime,
          conflictingBookings: bookingList,
          suggestedSolutions,
        });
      }
    });
    
    return conflicts;
  }, [bookings, halls]);

  // Get hall utilization for today
  const getHallUtilization = (hallId: string) => {
    const hallBookings = todayBookings.filter(b => b.hallId === hallId);
    return hallBookings;
  };

  // Check if hall is currently in use
  const isHallCurrentlyOccupied = (hallId: string) => {
    return currentlyOccupiedHalls.some(b => b.hallId === hallId);
  };

  // Get current class in hall
  const getCurrentClass = (hallId: string) => {
    return currentlyOccupiedHalls.find(b => b.hallId === hallId);
  };

  // Sort halls
  const sortedHalls = useMemo(() => {
    return [...halls].sort((a, b) => {
      if (sortBy === 'id') return a.id.localeCompare(b.id);
      if (sortBy === 'capacity') return b.capacity - a.capacity;
      return a.location.localeCompare(b.location);
    });
  }, [halls, sortBy]);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-4xl text-gray-900">Admin Dashboard</h1>
        <p className="text-gray-500 mt-2">System Overview & Management</p>
      </div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Total Halls Card */}
        <Card className="border-blue-200 bg-white/95 backdrop-blur-sm shadow-md hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm text-gray-600">Total Halls</CardTitle>
            <Building2 className="h-5 w-5 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-4xl text-blue-500">{halls.length}</div>
            <p className="text-xs text-gray-500 mt-2">L1 - L19 Active</p>
            <div className="mt-3 pt-3 border-t border-gray-100">
              <div className="flex items-center gap-2 text-sm">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <span className="text-green-600">{currentlyAvailableHalls.length} Available Now</span>
              </div>
              <div className="flex items-center gap-2 text-sm mt-1">
                <XCircle className="h-4 w-4 text-red-600" />
                <span className="text-red-600">{currentlyOccupiedHalls.length} Occupied Now</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Active Bookings Card with Hall Details */}
        <Card className="border-green-200 bg-white/95 backdrop-blur-sm shadow-md hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm text-gray-600">Active Bookings</CardTitle>
            <Calendar className="h-5 w-5 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-4xl text-green-600">{todayBookings.length}</div>
            <p className="text-xs text-gray-500 mt-2">Classes Today</p>
            
            {currentlyOccupiedHalls.length > 0 && (
              <div className="mt-3 pt-3 border-t border-gray-100">
                <div className="flex items-center gap-2 text-sm mb-2">
                  <Clock className="h-4 w-4 text-blue-600" />
                  <span className="text-gray-700">Currently Booked:</span>
                </div>
                <div className="flex flex-wrap gap-1">
                  {currentlyOccupiedHalls.slice(0, 6).map(booking => (
                    <Badge 
                      key={booking.id} 
                      className="bg-blue-100 text-blue-700 hover:bg-blue-200 text-xs"
                    >
                      {booking.hallId}
                    </Badge>
                  ))}
                  {currentlyOccupiedHalls.length > 6 && (
                    <Badge variant="outline" className="text-xs">
                      +{currentlyOccupiedHalls.length - 6} more
                    </Badge>
                  )}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Conflicts Card with Details */}
        <Card className={`bg-white/95 backdrop-blur-sm shadow-md hover:shadow-lg transition-shadow ${
          conflictDetails.length > 0 
            ? 'border-red-200' 
            : 'border-gray-200'
        }`}>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm text-gray-600">Overlaps Detected</CardTitle>
            <AlertTriangle className={`h-5 w-5 ${conflictDetails.length > 0 ? 'text-red-600' : 'text-gray-400'}`} />
          </CardHeader>
          <CardContent>
            <div className={`text-4xl ${conflictDetails.length > 0 ? 'text-red-600' : 'text-gray-400'}`}>
              {conflictDetails.length}
            </div>
            <p className={`text-xs mt-2 ${conflictDetails.length > 0 ? 'text-red-500' : 'text-gray-500'}`}>
              {conflictDetails.length > 0 ? 'Conflicts Found' : 'All Clear'}
            </p>
            
            {conflictDetails.length > 0 && (
              <Button 
                variant="outline" 
                size="sm" 
                className="mt-3 w-full text-red-600 border-red-200 hover:bg-red-50"
                onClick={() => setShowConflictDetails(!showConflictDetails)}
              >
                <Info className="h-3 w-3 mr-2" />
                {showConflictDetails ? 'Hide Details' : 'View Details'}
              </Button>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Conflict Details Section */}
      {showConflictDetails && conflictDetails.length > 0 && (
        <Card className="bg-red-50/50 border-red-200">
          <CardHeader>
            <CardTitle className="text-red-700">Conflict Details & Solutions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {conflictDetails.map((conflict, index) => (
              <Alert key={index} className="bg-white border-red-200">
                <AlertTriangle className="h-4 w-4 text-red-600" />
                <AlertTitle className="text-red-700">
                  Conflict #{index + 1}: Hall {conflict.hallId} on {conflict.date} at {conflict.startTime}
                </AlertTitle>
                <AlertDescription className="mt-2">
                  <div className="space-y-3">
                    <div>
                      <p className="text-sm text-gray-700 mb-2">
                        <strong>Conflicting Classes ({conflict.conflictingBookings.length}):</strong>
                      </p>
                      <div className="space-y-1">
                        {conflict.conflictingBookings.map((booking, idx) => (
                          <div key={idx} className="text-sm bg-red-50 p-2 rounded border border-red-100">
                            <span className="text-gray-700">
                              {booking.courseName} - {booking.year} {booking.branch}
                            </span>
                            {booking.facultyName && (
                              <span className="text-gray-500 ml-2">
                                (Faculty: {booking.facultyName})
                              </span>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                    
                    <div>
                      <p className="text-sm text-gray-700 mb-2">
                        <strong>Suggested Solutions:</strong>
                      </p>
                      <ul className="space-y-1">
                        {conflict.suggestedSolutions.map((solution, idx) => (
                          <li key={idx} className="text-sm text-gray-600 flex items-start gap-2">
                            <span className="text-green-600 mt-0.5">✓</span>
                            <span>{solution}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </AlertDescription>
              </Alert>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Real-time Hall Availability Overview */}
      <Card className="bg-white/95 backdrop-blur-sm shadow-md border-gray-200">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Available Halls Right Now</span>
            <Badge variant="outline" className="text-xs">
              <Clock className="h-3 w-3 mr-1" />
              {currentTime}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {currentlyAvailableHalls.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
              {currentlyAvailableHalls.map(hall => {
                const todayUsage = getHallUtilization(hall.id).length;
                
                return (
                  <div
                    key={hall.id}
                    className="p-3 rounded-lg border-2 bg-green-50 border-green-200 transition-all hover:shadow-md"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm">{hall.id}</span>
                      <CheckCircle className="h-4 w-4 text-green-600" />
                    </div>
                    
                    <div className="text-xs text-green-700">
                      <div>Available</div>
                      <div className="text-gray-500 mt-1">
                        {hall.capacity} seats
                      </div>
                      {todayUsage > 0 && (
                        <div className="text-gray-500 mt-1">
                          {todayUsage} booking{todayUsage > 1 ? 's' : ''} today
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <XCircle className="h-12 w-12 mx-auto mb-3 text-gray-400" />
              <p>All halls are currently occupied</p>
              <p className="text-sm mt-1">Check back later for availability</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Hall Management Table */}
      <Card className="bg-white/95 backdrop-blur-sm shadow-md border-gray-200">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Hall Management</CardTitle>
            <div className="flex gap-2">
              <Button
                variant={sortBy === 'id' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSortBy('id')}
              >
                ID
              </Button>
              <Button
                variant={sortBy === 'capacity' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSortBy('capacity')}
              >
                Capacity
              </Button>
              <Button
                variant={sortBy === 'location' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSortBy('location')}
              >
                Location
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Hall ID</TableHead>
                  <TableHead>Capacity</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead>Facilities</TableHead>
                  <TableHead>Today's Usage</TableHead>
                  <TableHead>Current Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sortedHalls.map(hall => {
                  const hallBookingsToday = getHallUtilization(hall.id);
                  const isOccupied = isHallCurrentlyOccupied(hall.id);
                  const currentClass = getCurrentClass(hall.id);
                  
                  return (
                    <TableRow key={hall.id}>
                      <TableCell>
                        <span className="bg-blue-100 text-blue-600 px-2 py-1 rounded">
                          {hall.id}
                        </span>
                      </TableCell>
                      <TableCell>{hall.capacity} seats</TableCell>
                      <TableCell>{hall.location}</TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-1">
                          {hall.facilities.map(facility => (
                            <Badge key={facility} variant="secondary" className="text-xs">
                              {facility}
                            </Badge>
                          ))}
                        </div>
                      </TableCell>
                      <TableCell>
                        {hallBookingsToday.length > 0 ? (
                          <Badge className="bg-blue-600">
                            {hallBookingsToday.length} booking{hallBookingsToday.length > 1 ? 's' : ''}
                          </Badge>
                        ) : (
                          <Badge variant="outline">No bookings</Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        {isOccupied && currentClass ? (
                          <div className="space-y-1">
                            <Badge className="bg-red-600">Occupied</Badge>
                            <div className="text-xs text-gray-600 mt-1">
                              {currentClass.courseName}
                              <br />
                              <span className="text-gray-500">
                                {currentClass.startTime} - {currentClass.endTime}
                              </span>
                            </div>
                          </div>
                        ) : (
                          <Badge className="bg-green-600">Available</Badge>
                        )}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}