import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from './ui/dialog';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Alert, AlertDescription } from './ui/alert';
import { Clock, MapPin, Users, AlertCircle } from 'lucide-react';

interface WaitingListEntry {
  id: string;
  facultyName: string;
  courseName: string;
  requestedAt: string;
}

interface WaitingListModalProps {
  isOpen: boolean;
  onClose: () => void;
  onJoinWaitingList: () => void;
  hallId: string;
  date: string;
  time: string;
  currentBooking?: {
    courseName: string;
    facultyName: string;
    branch: string;
    year: string;
  };
  waitingList: WaitingListEntry[];
}

export function WaitingListModal({
  isOpen,
  onClose,
  onJoinWaitingList,
  hallId,
  date,
  time,
  currentBooking,
  waitingList
}: WaitingListModalProps) {
  const handleJoinWaitingList = () => {
    onJoinWaitingList();
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Slot Already Booked</DialogTitle>
          <DialogDescription>
            This time slot is currently occupied. You can join the waiting list.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <Alert className="border-blue-200 bg-blue-50">
            <AlertCircle className="h-4 w-4 text-blue-600" />
            <AlertDescription className="text-blue-900">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  <span>{date} at {time}</span>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4" />
                  <span>Hall {hallId}</span>
                </div>
              </div>
            </AlertDescription>
          </Alert>

          {currentBooking && (
            <div className="p-4 bg-gray-50 rounded-lg space-y-2">
              <h4 className="text-sm">Current Booking:</h4>
              <div className="space-y-1">
                <p className="text-sm">
                  <span className="text-gray-600">Course:</span> {currentBooking.courseName}
                </p>
                <p className="text-sm">
                  <span className="text-gray-600">Faculty:</span> {currentBooking.facultyName}
                </p>
                <p className="text-sm">
                  <span className="text-gray-600">Batch:</span> {currentBooking.year} {currentBooking.branch}
                </p>
              </div>
            </div>
          )}

          {waitingList.length > 0 && (
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm text-gray-700">
                <Users className="h-4 w-4" />
                <span>Current Waiting List ({waitingList.length})</span>
              </div>
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {waitingList.map((entry, index) => (
                  <div key={entry.id} className="p-3 bg-gray-50 rounded-lg text-sm">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="flex items-center gap-2">
                          <Badge variant="outline">Position {index + 1}</Badge>
                          <span>{entry.facultyName}</span>
                        </div>
                        <p className="text-xs text-gray-600 mt-1">{entry.courseName}</p>
                      </div>
                      <span className="text-xs text-gray-500">
                        {new Date(entry.requestedAt).toLocaleTimeString()}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <h4 className="text-sm text-yellow-900 mb-2">How Waiting List Works:</h4>
            <ul className="text-xs text-yellow-800 space-y-1">
              <li>• You'll be added to the queue for this time slot</li>
              <li>• If the current booking is cancelled, you'll be notified</li>
              <li>• Priority is given in order of joining the waiting list</li>
              <li>• You can cancel your waiting list request anytime</li>
            </ul>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleJoinWaitingList} className="bg-blue-500 hover:bg-blue-600">
            Join Waiting List
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}