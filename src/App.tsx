import { useState, useEffect } from 'react';
import { ErrorBoundary } from './components/ErrorBoundary';
import { LoginPage } from './components/LoginPage';
import { FacultyDashboard } from './components/FacultyDashboard';
import { StudentDashboard } from './components/StudentDashboard';
import { AdminDashboard } from './components/AdminDashboard';
import { Button } from './components/ui/button';
import { Avatar, AvatarFallback } from './components/ui/avatar';
import { Badge } from './components/ui/badge';
import { Separator } from './components/ui/separator';
import { 
  LayoutDashboard, 
  Users, 
  GraduationCap, 
  UserCog, 
  Menu, 
  X,
  ChevronLeft,
  ChevronRight,
  LogOut
} from 'lucide-react';
import { UserRole, Booking, Student, Year, Branch, Batch, HallId } from './types';
import { halls, initialBookings } from './lib/mockData';
import campusImage from 'figma:asset/e3e2ae0cddcc091b8cd4ee7f77c066649f7a8bc4.png';
import campusBackground from 'figma:asset/b52c288d9aa409c983d659747029eec35980b8da.png';
import lnmiitLogo from 'figma:asset/f574c4cf293f7e0b301cf0c3c63e420965130c74.png';
import { createClient } from './utils/supabase/client';
import { checkAndClearInvalidSession } from './utils/supabase/auth-helpers';
import { api } from './utils/api';
import { toast } from 'sonner@2.0.3';
import { Toaster } from './components/ui/sonner';

// Action history types for undo functionality
type ActionType = 'add' | 'delete' | 'reschedule';

interface Action {
  type: ActionType;
  data: any; // Will store the necessary data to reverse the action
  timestamp: number;
}

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [currentRole, setCurrentRole] = useState<UserRole>('faculty');
  const [currentUserName, setCurrentUserName] = useState('User');
  const [studentYear, setStudentYear] = useState<Year>('Y23');
  const [studentBranch, setStudentBranch] = useState<Branch>('CSE');
  const [studentBatch, setStudentBatch] = useState<Batch>('A1');
  const [bookings, setBookings] = useState<Booking[]>(initialBookings);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [loadingBookings, setLoadingBookings] = useState(true);
  const [actionHistory, setActionHistory] = useState<Action[]>([]); // Undo history

  // Load bookings from storage (Supabase or localStorage)
  const loadBookings = async () => {
    try {
      setLoadingBookings(true);
      const result: any = await api.getBookings();
      
      if (result.bookings && result.bookings.length > 0) {
        // Merge with initial bookings (timetable data)
        const mergedBookings = [...initialBookings];
        
        // Add extra classes AND rescheduled classes from storage (avoid duplicates)
        result.bookings.forEach((dbBooking: Booking) => {
          if (dbBooking.isExtraClass || dbBooking.isRescheduled) {
            // Only add if not already in the list
            const exists = mergedBookings.some(b => b.id === dbBooking.id);
            if (!exists) {
              mergedBookings.push(dbBooking);
            }
          }
        });
        
        setBookings(mergedBookings);
        
        if (result.source === 'localStorage') {
          console.log('💾 Loaded', result.bookings.length, 'bookings from localStorage');
        } else if (result.source === 'database') {
          console.log('✅ Loaded', result.bookings.length, 'bookings from database');
        } else {
          console.log('✅ Loaded', result.bookings.length, 'bookings from', result.source);
        }
      } else {
        // No bookings in storage, use initial bookings
        setBookings(initialBookings);
        console.log('ℹ️ No extra classes found, using timetable data only');
      }
    } catch (error) {
      console.error('Failed to load bookings:', error);
      // On error, fall back to initial bookings
      setBookings(initialBookings);
    } finally {
      setLoadingBookings(false);
    }
  };

  // Check for existing session on mount and load bookings
  useEffect(() => {
    const checkSession = async () => {
      try {
        const session = await checkAndClearInvalidSession();
        
        if (session?.user) {
          const role = (session.user.user_metadata?.role || 'student') as UserRole;
          const name = session.user.user_metadata?.name || session.user.email?.split('@')[0] || 'User';
          const year = session.user.user_metadata?.year as Year | undefined;
          const branch = session.user.user_metadata?.branch as Branch | undefined;
          const batch = session.user.user_metadata?.batch as Batch | undefined;
        
          setIsLoggedIn(true);
          setCurrentRole(role);
          setCurrentUserName(name);
          if (year) setStudentYear(year);
          if (branch) setStudentBranch(branch);
          if (batch) setStudentBatch(batch);
        
          // Load bookings after successful session check
          await loadBookings();
        } else {
          setLoadingBookings(false);
          // Load bookings even if not logged in (for localStorage data)
          await loadBookings();
        }
      } catch (error) {
        console.error('Error checking session:', error);
        setLoadingBookings(false);
        // Still try to load bookings from localStorage
        await loadBookings();
      }
    };
    
    checkSession();
    
    // Set up auth state change listener
    const supabase = createClient();
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('🔐 Auth state changed:', event);
      
      if (event === 'SIGNED_OUT' || event === 'TOKEN_REFRESHED') {
        if (event === 'SIGNED_OUT') {
          setIsLoggedIn(false);
          setCurrentRole('student');
          setCurrentUserName('User');
        } else if (event === 'TOKEN_REFRESHED' && session?.user) {
          // Update user data with refreshed token
          const role = (session.user.user_metadata?.role || 'student') as UserRole;
          const name = session.user.user_metadata?.name || session.user.email?.split('@')[0] || 'User';
          setCurrentUserName(name);
          setCurrentRole(role);
        }
      }
    });
    
    // Cleanup subscription on unmount
    return () => {
      subscription.unsubscribe();
    };
  }, []);

  // Student data based on logged-in user
  const currentStudent: Student = {
    id: '1',
    name: currentUserName,
    year: studentYear,
    branch: studentBranch,
    batch: studentBatch
  };

  const handleLogin = async (email: string, role: UserRole, name: string, year?: Year, branch?: Branch, batch?: Batch) => {
    setIsLoggedIn(true);
    setCurrentRole(role);
    setCurrentUserName(name);
    if (year) setStudentYear(year);
    if (branch) setStudentBranch(branch);
    if (batch) setStudentBatch(batch);
    
    // Load bookings after login
    await loadBookings();
  };

  const handleLogout = async () => {
    try {
      const supabase = createClient();
      await supabase.auth.signOut();
    } catch (error) {
      console.log('⚠️ Error during logout:', error);
    }
    setIsLoggedIn(false);
    setCurrentRole('student');
    setCurrentUserName('User');
    setStudentYear('Y23');
    setStudentBranch('CSE');
    setStudentBatch('A1');
  };

  if (!isLoggedIn) {
    return <LoginPage onLogin={handleLogin} campusBackground={campusBackground} />;
  }

  const handleAddBooking = async (newBooking: Omit<Booking, 'id'>) => {
    try {
      // Get current session for access token
      let accessToken = '';
      try {
        const supabase = createClient();
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.log('⚠️ Could not get session (Supabase unavailable)');
        }
        
        if (!session?.access_token) {
          // If not logged in, still allow booking to localStorage
          console.log('ℹ️ No active session, saving to localStorage only');
          accessToken = 'local'; // Dummy token for localStorage-only mode
        } else {
          accessToken = session.access_token;
        }
      } catch (error) {
        console.log('⚠️ Session check failed, using localStorage only');
        accessToken = 'local';
      }

      // Save to storage (Supabase or localStorage)
      const result: any = await api.createBooking(newBooking, accessToken);
      
      if (result.success) {
        // Create booking with the ID from storage
        const booking: Booking = {
          ...newBooking,
          id: result.bookingId
        };
        
        // Update local state
        setBookings([...bookings, booking]);
        
        // Show success message based on storage source
        if (result.source === 'localStorage') {
          toast.success('Class booked successfully! (Saved locally)');
          console.log('💾 Booking saved to localStorage:', booking);
        } else {
          toast.success('Class booked successfully!');
          console.log('✅ Booking saved to database:', booking);
        }
        
        // Add action to history for undo
        setActionHistory([...actionHistory, { type: 'add', data: booking, timestamp: Date.now() }]);
      }
    } catch (error: any) {
      console.error('Failed to create booking:', error);
      toast.error(error.message || 'Failed to book class. Please try again.');
    }
  };

  const handleAddBookings = (newBookings: Omit<Booking, 'id'>[]) => {
    const bookingsWithIds: Booking[] = newBookings.map((booking, index) => ({
      ...booking,
      id: `${Date.now()}-${index}`
    }));
    setBookings([...bookings, ...bookingsWithIds]);
  };

  const handleRescheduleBooking = async (
    originalBooking: Booking,
    newDate: string,
    newStartTime: string,
    newEndTime: string,
    newHallId: HallId,
    fromDate: string,
    toDate: string,
    reason?: string
  ) => {
    try {
      console.log(`🔄 Rescheduling ${originalBooking.courseName} for ${originalBooking.branch} from ${fromDate} to ${toDate}`);
      
      // Get current session for access token
      let accessToken = '';
      try {
        const supabase = createClient();
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (!session?.access_token) {
          accessToken = 'local';
        } else {
          accessToken = session.access_token;
        }
      } catch (error) {
        accessToken = 'local';
      }
      
      // Find ALL occurrences of this subject for the batch in the date range
      // First, get the day-of-week for each date in the range
      const from = new Date(fromDate);
      const to = new Date(toDate);
      const datesInRange: string[] = [];
      
      for (let d = new Date(from); d <= to; d.setDate(d.getDate() + 1)) {
        datesInRange.push(d.toISOString().split('T')[0]);
      }
      
      console.log(`📅 Checking ${datesInRange.length} dates in range`);
      
      // Map each actual date to its timetable reference date
      const getTimetableReferenceDate = (actualDate: string) => {
        const date = new Date(actualDate);
        const dayOfWeek = date.getDay(); // 0 = Sunday, 1 = Monday, etc.
        const timetableBaseDates = [
          '2025-09-07', // Sunday (not used)
          '2025-09-01', // Monday
          '2025-09-02', // Tuesday
          '2025-09-03', // Wednesday
          '2025-09-04', // Thursday
          '2025-09-05', // Friday
          '2025-09-06', // Saturday
        ];
        return timetableBaseDates[dayOfWeek];
      };
      
      // Find all matching classes in the timetable for this subject and batch
      const matchingClasses: { booking: Booking; actualDate: string }[] = [];
      
      for (const actualDate of datesInRange) {
        const refDate = getTimetableReferenceDate(actualDate);
        
        // Find all timetable bookings for this reference date that match the subject and batch
        const classesOnThisDay = initialBookings.filter(booking => {
          // Must match the reference date
          if (booking.date !== refDate) return false;
          
          // Must match the course name
          if (booking.courseName !== originalBooking.courseName) return false;
          
          // Must match the year
          const bookingYear = booking.year.match(/^Y\d{2}/)?.[0] || booking.year;
          const originalYear = originalBooking.year.match(/^Y\d{2}/)?.[0] || originalBooking.year;
          if (bookingYear !== originalYear && booking.year !== 'All' && booking.year !== 'TBD') return false;
          
          // Must match the branch/batch
          if (booking.branch !== originalBooking.branch && booking.branch !== 'All' && booking.branch !== 'TBD') return false;
          
          // Don't reschedule extra classes or already rescheduled classes
          if (booking.isExtraClass || booking.isRescheduled) return false;
          
          return true;
        });
        
        // Add each matching class with its actual date
        for (const booking of classesOnThisDay) {
          matchingClasses.push({ booking, actualDate });
        }
      }
      
      console.log(`📚 Found ${matchingClasses.length} occurrences of ${originalBooking.courseName} for ${originalBooking.branch}`);
      
      if (matchingClasses.length === 0) {
        toast.warning('No matching classes found in the specified date range');
        return;
      }
      
      // Create rescheduled bookings for each occurrence
      const newBookings: Booking[] = [];
      let successCount = 0;
      let failCount = 0;
      
      // Process bookings with delay to avoid overwhelming the API
      for (const { booking, actualDate } of matchingClasses) {
        try {
          const rescheduledBooking: Omit<Booking, 'id'> = {
            ...booking,
            date: actualDate, // Use the actual date in the range
            startTime: newStartTime,
            endTime: newEndTime,
            hallId: newHallId,
            isRescheduled: true,
            originalDate: booking.date, // Keep the original reference date
            originalStartTime: booking.startTime,
            originalEndTime: booking.endTime,
            rescheduledFrom: fromDate,
            rescheduledUntil: toDate,
            originalBookingId: booking.id,
            rescheduleReason: reason
          };
          
          // Save to storage
          const result: any = await api.createBooking(rescheduledBooking, accessToken);
          
          if (result.success) {
            newBookings.push({
              ...rescheduledBooking,
              id: result.bookingId
            });
            successCount++;
            console.log(`✅ Rescheduled ${booking.courseName} on ${actualDate} from ${booking.startTime} to ${newStartTime}`);
          } else {
            failCount++;
            console.warn(`⚠️ Failed to create booking for ${actualDate}`);
          }
          
          // Add a small delay between requests to avoid rate limiting
          await new Promise(resolve => setTimeout(resolve, 100));
          
        } catch (error) {
          failCount++;
          console.error(`❌ Error creating booking for ${actualDate}:`, error);
        }
      }
      
      // Update local state with successfully created bookings
      if (newBookings.length > 0) {
        setBookings([...bookings, ...newBookings]);
        
        // Add action to history for undo (save the newly created bookings)
        setActionHistory(prev => [...prev, { 
          type: 'reschedule', 
          data: { newBookings }, 
          timestamp: Date.now() 
        }]);
      }
      
      // Show appropriate message based on results
      if (successCount === matchingClasses.length) {
        toast.success(`Successfully rescheduled ${successCount} occurrence(s) of ${originalBooking.courseName}!`);
        console.log('✅ All rescheduled bookings created:', newBookings.length);
      } else if (successCount > 0) {
        toast.success(`Partially rescheduled: ${successCount} succeeded, ${failCount} failed`);
        console.log(`⚠️ Partial success: ${successCount}/${matchingClasses.length} bookings created`);
      } else {
        throw new Error('Failed to create any rescheduled bookings');
      }
      
    } catch (error: any) {
      console.error('Failed to reschedule booking:', error);
      toast.error(error.message || 'Failed to reschedule class. Please try again.');
    }
  };

  const handleDeleteBooking = async (bookingId: string) => {
    try {
      // Find the booking before deleting to save it in history
      const bookingToDelete = bookings.find(b => b.id === bookingId);
      
      // Get current session for access token
      let accessToken = '';
      try {
        const supabase = createClient();
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (!session?.access_token) {
          accessToken = 'local';
        } else {
          accessToken = session.access_token;
        }
      } catch (error) {
        accessToken = 'local';
      }

      // Delete from storage
      const result: any = await api.deleteBooking(bookingId, accessToken);
      
      if (result.success) {
        // Update local state by removing the booking
        setBookings(bookings.filter(b => b.id !== bookingId));
        
        // Show success message based on storage source
        if (result.source === 'localStorage') {
          toast.success('Extra class removed successfully! (Deleted locally)');
          console.log('💾 Booking deleted from localStorage');
        } else {
          toast.success('Extra class removed successfully!');
          console.log('✅ Booking deleted from database');
        }
        
        // Add action to history for undo (save the deleted booking)
        if (bookingToDelete) {
          setActionHistory([...actionHistory, { type: 'delete', data: bookingToDelete, timestamp: Date.now() }]);
        }
      }
    } catch (error: any) {
      console.error('Failed to delete booking:', error);
      toast.error(error.message || 'Failed to remove class. Please try again.');
    }
  };

  // Undo the last action
  const handleUndo = async () => {
    if (actionHistory.length === 0) {
      toast.info('No actions to undo');
      return;
    }

    const lastAction = actionHistory[actionHistory.length - 1];
    const newHistory = actionHistory.slice(0, -1);
    setActionHistory(newHistory);

    try {
      // Get current session for access token
      let accessToken = '';
      try {
        const supabase = createClient();
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (!session?.access_token) {
          accessToken = 'local';
        } else {
          accessToken = session.access_token;
        }
      } catch (error) {
        accessToken = 'local';
      }

      switch (lastAction.type) {
        case 'add':
          // Undo add: delete the booking
          const addedBooking = lastAction.data as Booking;
          await api.deleteBooking(addedBooking.id, accessToken);
          setBookings(bookings.filter(b => b.id !== addedBooking.id));
          toast.success('Booking addition undone');
          console.log('↩️ Undid booking addition:', addedBooking.id);
          break;

        case 'delete':
          // Undo delete: restore the booking
          const deletedBooking = lastAction.data as Booking;
          const restoreResult: any = await api.createBooking(deletedBooking, accessToken);
          if (restoreResult.success) {
            // Restore with potentially new ID from storage
            const restoredBooking = { ...deletedBooking, id: restoreResult.bookingId };
            setBookings([...bookings, restoredBooking]);
            toast.success('Booking deletion undone');
            console.log('↩️ Undid booking deletion:', restoredBooking.id);
          }
          break;

        case 'reschedule':
          // Undo reschedule: delete all the rescheduled bookings
          const rescheduleData = lastAction.data;
          const newBookings = rescheduleData.newBookings as Booking[];
          
          // Delete all rescheduled bookings
          for (const booking of newBookings) {
            await api.deleteBooking(booking.id, accessToken);
            await new Promise(resolve => setTimeout(resolve, 50)); // Small delay
          }
          
          // Remove from local state
          const bookingIdsToRemove = newBookings.map(b => b.id);
          setBookings(bookings.filter(b => !bookingIdsToRemove.includes(b.id)));
          toast.success(`Rescheduling undone (${newBookings.length} occurrence(s) removed)`);
          console.log('↩️ Undid rescheduling:', newBookings.length, 'bookings removed');
          break;

        default:
          toast.error('Cannot undo this action');
      }
    } catch (error: any) {
      console.error('Failed to undo action:', error);
      toast.error(error.message || 'Failed to undo action');
      // Restore the action to history if undo failed
      setActionHistory([...newHistory, lastAction]);
    }
  };

  // Get role-specific icon and label
  const getRoleInfo = (role: UserRole) => {
    switch (role) {
      case 'admin':
        return { icon: UserCog, label: 'Admin Dashboard' };
      case 'faculty':
        return { icon: Users, label: 'Faculty Dashboard' };
      case 'student':
        return { icon: GraduationCap, label: 'Student Dashboard' };
      default:
        return { icon: LayoutDashboard, label: 'Dashboard' };
    }
  };

  const roleInfo = getRoleInfo(currentRole);

  return (
    <ErrorBoundary>
    <>
    <Toaster />
    <div className="min-h-screen flex relative">
      {/* Background Image with Overlay */}
      <div 
        className="fixed inset-0 z-0"
        style={{
          backgroundImage: `url(${campusBackground})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundAttachment: 'fixed'
        }}
      >
        <div className="absolute inset-0 bg-white/90 backdrop-blur-[2px]" />
      </div>

      {/* Sidebar */}
      <aside 
        className={`
          fixed lg:sticky inset-y-0 left-0 z-50 lg:h-screen
          bg-white/95 backdrop-blur-md border-r border-gray-200 shadow-xl
          transition-all duration-300 
          ${isSidebarOpen ? 'w-72' : 'w-20'}
          ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        `}
      >
        <div className="h-full flex flex-col overflow-hidden">
          {/* Header */}
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3 flex-1 min-w-0">
                {lnmiitLogo ? (
                  <img 
                    src={lnmiitLogo} 
                    alt="LNMIIT" 
                    className={`${isSidebarOpen ? 'h-12' : 'h-10'} w-auto object-contain transition-all`}
                    onError={(e) => {
                      e.currentTarget.style.display = 'none';
                    }}
                  />
                ) : (
                  <div className={`${isSidebarOpen ? 'h-12 w-12' : 'h-10 w-10'} bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center shadow-md transition-all flex-shrink-0`}>
                    <LayoutDashboard className={`${isSidebarOpen ? 'h-7 w-7' : 'h-6 w-6'} text-white`} />
                  </div>
                )}
                {isSidebarOpen && (
                  <div className="min-w-0">
                    <h1 className="text-xl text-gray-900 truncate">CampusConnect</h1>
                    <p className="text-xs text-gray-500 truncate">LNMIIT Hall Management</p>
                  </div>
                )}
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setIsSidebarOpen(!isSidebarOpen);
                  setIsMobileMenuOpen(false);
                }}
                className="hidden lg:flex ml-2 flex-shrink-0"
              >
                {isSidebarOpen ? <ChevronLeft className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsMobileMenuOpen(false)}
                className="lg:hidden flex-shrink-0"
              >
                <X className="h-5 w-5" />
              </Button>
            </div>
          </div>

          {/* Campus Image */}
          {isSidebarOpen && (
            <div className="px-6 pt-4">
              <div className="rounded-xl overflow-hidden shadow-lg">
                <img 
                  src={campusImage} 
                  alt="LNMIIT Campus" 
                  className="w-full h-32 object-cover"
                />
              </div>
            </div>
          )}

          {/* Navigation */}
          <nav className="flex-1 p-6 space-y-3 overflow-y-auto">
            <div className="mb-6">
              {isSidebarOpen && (
                <p className="text-xs uppercase tracking-wider text-gray-400 px-3 mb-3">Dashboard</p>
              )}
              <div className={`w-full flex items-center gap-3 px-4 py-4 rounded-xl bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-lg hover:shadow-xl transition-shadow ${!isSidebarOpen && 'justify-center'}`}>
                <roleInfo.icon className="h-5 w-5 flex-shrink-0" />
                {isSidebarOpen && (
                  <span className="flex-1">{roleInfo.label}</span>
                )}
              </div>
            </div>

            {isSidebarOpen && <Separator />}

            <div className="mt-6">
              {isSidebarOpen && (
                <p className="text-xs uppercase tracking-wider text-gray-400 px-3 mb-3">Role</p>
              )}
              <div className={`px-3 ${!isSidebarOpen && 'flex justify-center'}`}>
                <Badge 
                  variant="outline"
                  className={`px-3 py-1.5 ${
                    currentRole === 'admin' 
                      ? 'border-purple-200 bg-purple-50 text-purple-700' 
                      : currentRole === 'faculty'
                      ? 'border-gray-200 bg-gray-50 text-gray-700'
                      : 'border-green-200 bg-green-50 text-green-700'
                  }`}
                >
                  {isSidebarOpen ? (
                    <>
                      {currentRole === 'admin' && 'Admin'}
                      {currentRole === 'faculty' && 'Faculty'}
                      {currentRole === 'student' && 'Student'}
                    </>
                  ) : (
                    <>
                      {currentRole === 'admin' && 'A'}
                      {currentRole === 'faculty' && 'F'}
                      {currentRole === 'student' && 'S'}
                    </>
                  )}
                </Badge>
              </div>
            </div>
          </nav>

          {/* User Profile */}
          <div className="p-6 border-t border-gray-100 bg-gray-50/50 space-y-3 flex-shrink-0">
            <div className={`flex items-center gap-3 ${!isSidebarOpen && 'justify-center'}`}>
              <Avatar className="h-11 w-11 flex-shrink-0">
                <AvatarFallback className={`text-white ${
                  currentRole === 'admin' 
                    ? 'bg-gradient-to-br from-purple-500 to-purple-600' 
                    : currentRole === 'faculty'
                    ? 'bg-gradient-to-br from-gray-700 to-gray-800'
                    : 'bg-gradient-to-br from-green-500 to-green-600'
                }`}>
                  {currentUserName.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              {isSidebarOpen && (
                <div className="flex-1 min-w-0">
                  <p className="text-sm truncate">{currentUserName}</p>
                  <p className="text-xs text-gray-500 truncate">
                    {currentRole === 'student' ? `${currentStudent.year} ${currentStudent.branch}-${currentStudent.batch}` : 
                     currentRole.charAt(0).toUpperCase() + currentRole.slice(1)}
                  </p>
                </div>
              )}
            </div>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={handleLogout}
              className={`w-full text-red-600 hover:text-red-700 hover:bg-red-50 justify-center ${isSidebarOpen ? 'justify-start' : 'justify-center px-2'}`}
              title="Logout"
            >
              <LogOut className="h-4 w-4 flex-shrink-0" />
              {isSidebarOpen && <span className="ml-2">Logout</span>}
            </Button>
          </div>
        </div>
      </aside>

      {/* Mobile Overlay */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Main Content */}
      <main className="flex-1 min-w-0 relative z-10 overflow-auto">
        {/* Mobile Header */}
        <div className="lg:hidden bg-white/95 backdrop-blur-md border-b border-gray-200 p-4 shadow-sm sticky top-0 z-20">
          <div className="flex items-center justify-between">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsMobileMenuOpen(true)}
            >
              <Menu className="h-6 w-6" />
            </Button>
            <div className="flex items-center gap-2">
              {lnmiitLogo ? (
                <img 
                  src={lnmiitLogo} 
                  alt="LNMIIT" 
                  className="h-9 w-auto"
                  onError={(e) => {
                    e.currentTarget.style.display = 'none';
                  }}
                />
              ) : (
                <div className="h-9 w-9 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
                  <LayoutDashboard className="h-5 w-5 text-white" />
                </div>
              )}
            </div>
            <div className="w-10" />
          </div>
        </div>

        {/* Dashboard Content */}
        <div className="p-6 lg:p-10 min-h-[calc(100vh-80px)] lg:min-h-screen">
          {currentRole === 'faculty' && (
            <FacultyDashboard 
              bookings={bookings} 
              onAddBooking={handleAddBooking} 
              facultyName={currentUserName} 
              onDeleteBooking={handleDeleteBooking}
              onRescheduleBooking={handleRescheduleBooking}
              onUndo={handleUndo}
              canUndo={actionHistory.length > 0}
            />
          )}
          {currentRole === 'student' && (
            <StudentDashboard bookings={bookings} student={currentStudent} />
          )}
          {currentRole === 'admin' && (
            <AdminDashboard bookings={bookings} halls={halls} onAddBookings={handleAddBookings} onRescheduleBooking={handleRescheduleBooking} onDeleteBooking={handleDeleteBooking} />
          )}
        </div>
      </main>
    </div>
    </>
    </ErrorBoundary>
  );
}

export default App;