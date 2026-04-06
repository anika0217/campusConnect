import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Textarea } from './ui/textarea';
import { 
  Upload, 
  FileSpreadsheet, 
  Code, 
  PlusCircle, 
  Download,
  AlertCircle,
  CheckCircle2
} from 'lucide-react';
import { Alert, AlertDescription } from './ui/alert';
import { Booking } from '../types';
import { toast } from 'sonner';

interface TimetableImportProps {
  onImport: (bookings: Omit<Booking, 'id'>[]) => void;
}

export function TimetableImport({ onImport }: TimetableImportProps) {
  const [importMethod, setImportMethod] = useState<'csv' | 'json' | 'manual'>('manual');
  const [jsonData, setJsonData] = useState('');
  const [csvFile, setCsvFile] = useState<File | null>(null);
  const [parseError, setParseError] = useState<string | null>(null);
  const [parseSuccess, setParseSuccess] = useState<string | null>(null);

  // Manual entry state
  const [manualEntry, setManualEntry] = useState({
    date: '',
    startTime: '',
    endTime: '',
    hallId: '',
    subject: '',
    faculty: '',
    batch: 'Y23',
    branch: 'CSE',
    type: 'regular' as 'regular' | 'extra'
  });

  const timeSlots = [
    '08:30 AM - 09:25 AM',
    '09:25 AM - 10:20 AM',
    '10:40 AM - 11:35 AM',
    '11:35 AM - 12:30 PM',
    '01:30 PM - 02:25 PM',
    '02:25 PM - 03:20 PM',
    '03:30 PM - 04:25 PM',
    '04:25 PM - 05:20 PM'
  ];

  const halls = Array.from({ length: 19 }, (_, i) => `L${i + 1}`);
  const batches = ['Y22', 'Y23', 'Y24', 'Y25'];
  const branches = ['CSE', 'ECE', 'CCE', 'MECH'];

  // Helper function to convert 24-hour time to 12-hour format
  const convertTo12HourFormat = (time24: string): string => {
    const [hours, minutes] = time24.split(':');
    const h = parseInt(hours);
    const period = h >= 12 ? 'PM' : 'AM';
    const h12 = h === 0 ? 12 : h > 12 ? h - 12 : h;
    return `${h12.toString().padStart(2, '0')}:${minutes} ${period}`;
  };

  // Helper function to parse CSV with quoted values
  const parseCSVLine = (line: string): string[] => {
    const result: string[] = [];
    let current = '';
    let inQuotes = false;
    
    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      
      if (char === '"') {
        inQuotes = !inQuotes;
      } else if (char === ',' && !inQuotes) {
        result.push(current.trim());
        current = '';
      } else {
        current += char;
      }
    }
    result.push(current.trim());
    return result;
  };

  // Helper function to extract batch year (Y22, Y23, Y24, Y25)
  const extractBatch = (batchStr: string): string => {
    const match = batchStr.match(/Y2[2-5]/);
    return match ? match[0] : 'Y23'; // Default to Y23 if not found
  };

  // Helper function to map branch codes to full names
  const mapBranch = (branchStr: string): string => {
    const branchMap: { [key: string]: string } = {
      'CSE': 'CSE',
      'ECE': 'ECE',
      'CCE': 'CCE',
      'MECH': 'MECH',
      'ME': 'MECH',
      'IC': 'CSE', // Integrated courses → CSE
      'PC': 'CSE', // Program courses → CSE
      'PE': 'ECE', // Professional electives → ECE
      'OE': 'CCE', // Open electives → CCE
    };
    
    // Check if branch string contains any of our keys
    for (const [key, value] of Object.entries(branchMap)) {
      if (branchStr.toUpperCase().includes(key)) {
        return value;
      }
    }
    
    return 'CSE'; // Default to CSE
  };

  // Handle CSV Upload
  const handleCSVUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setCsvFile(file);
    setParseError(null);
    setParseSuccess(null);

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const csv = event.target?.result as string;
        const lines = csv.split('\n').filter(line => {
          const trimmed = line.trim();
          // Skip empty lines and comment lines (starting with #)
          return trimmed && !trimmed.startsWith('#');
        });
        
        if (lines.length === 0) {
          throw new Error('CSV file is empty or contains only comments');
        }

        const headers = parseCSVLine(lines[0]).map(h => h.replace(/"/g, '').trim());
        
        // Expected headers: date,startTime,endTime,hallId,subject,faculty,batch,branch,type
        const requiredHeaders = ['date', 'startTime', 'endTime', 'hallId', 'subject', 'faculty', 'batch', 'branch'];
        const missingHeaders = requiredHeaders.filter(h => !headers.includes(h));
        
        if (missingHeaders.length > 0) {
          throw new Error(`Missing required columns: ${missingHeaders.join(', ')}`);
        }

        const bookings: Omit<Booking, 'id'>[] = [];
        let skippedRows = 0;
        
        for (let i = 1; i < lines.length; i++) {
          try {
            const values = parseCSVLine(lines[i]).map(v => v.replace(/"/g, '').trim());
            const row: any = {};
            
            headers.forEach((header, index) => {
              row[header] = values[index] || '';
            });

            // Validate required fields
            if (!row.date || !row.startTime || !row.endTime || !row.hallId || !row.subject || !row.faculty || !row.batch || !row.branch) {
              console.warn(`Skipping row ${i + 1}: Missing required fields`);
              skippedRows++;
              continue;
            }

            // Skip TBD entries
            if (row.subject === 'TBD' || row.faculty === 'TBD' || row.hallId === 'TBD') {
              skippedRows++;
              continue;
            }

            // Convert time format if needed (from 24-hour HH:MM to 12-hour format)
            let startTime = row.startTime;
            let endTime = row.endTime;
            
            // Check if time is in 24-hour format (HH:MM)
            if (row.startTime.match(/^\d{2}:\d{2}$/)) {
              const startConverted = convertTo12HourFormat(row.startTime);
              const endConverted = convertTo12HourFormat(row.endTime);
              startTime = `${startConverted} - ${endConverted}`;
            }

            // Extract batch (Y22, Y23, Y24, Y25)
            const batch = extractBatch(row.batch);

            // Map branch to standard values
            const branch = mapBranch(row.branch);

            bookings.push({
              date: row.date,
              startTime: startTime,
              endTime: endTime,
              hallId: row.hallId,
              subject: row.subject,
              faculty: row.faculty,
              batch: batch,
              branch: branch,
              type: (row.type || 'regular') as 'regular' | 'extra',
              status: 'approved'
            });
          } catch (rowError) {
            console.warn(`Error parsing row ${i + 1}:`, rowError);
            skippedRows++;
          }
        }

        if (bookings.length === 0) {
          throw new Error(`No valid bookings found in CSV file. Skipped ${skippedRows} rows.`);
        }

        onImport(bookings);
        const message = `Successfully imported ${bookings.length} classes from CSV${skippedRows > 0 ? ` (skipped ${skippedRows} invalid rows)` : ''}`;
        setParseSuccess(message);
        toast.success(message);
      } catch (error: any) {
        setParseError(error.message);
        toast.error(`CSV Import Error: ${error.message}`);
      }
    };

    reader.readAsText(file);
  };

  // Handle JSON Import
  const handleJSONImport = () => {
    setParseError(null);
    setParseSuccess(null);

    try {
      const data = JSON.parse(jsonData);
      
      if (!Array.isArray(data)) {
        throw new Error('JSON must be an array of booking objects');
      }

      const bookings: Omit<Booking, 'id'>[] = data.map((item, index) => {
        // Validate required fields
        const requiredFields = ['date', 'startTime', 'endTime', 'hallId', 'subject', 'faculty', 'batch', 'branch'];
        const missingFields = requiredFields.filter(field => !item[field]);
        
        if (missingFields.length > 0) {
          throw new Error(`Row ${index + 1}: Missing fields: ${missingFields.join(', ')}`);
        }

        return {
          date: item.date,
          startTime: item.startTime,
          endTime: item.endTime,
          hallId: item.hallId,
          subject: item.subject,
          faculty: item.faculty,
          batch: item.batch,
          branch: item.branch,
          type: item.type || 'regular',
          status: 'approved'
        };
      });

      onImport(bookings);
      setParseSuccess(`Successfully imported ${bookings.length} classes from JSON`);
      toast.success(`Imported ${bookings.length} classes from JSON`);
      setJsonData('');
    } catch (error: any) {
      setParseError(error.message);
      toast.error(`JSON Import Error: ${error.message}`);
    }
  };

  // Handle Manual Entry
  const handleManualSubmit = () => {
    setParseError(null);
    setParseSuccess(null);

    // Validate fields
    if (!manualEntry.date || !manualEntry.startTime || !manualEntry.hallId || !manualEntry.subject || !manualEntry.faculty) {
      setParseError('Please fill in all required fields');
      return;
    }

    const booking: Omit<Booking, 'id'> = {
      date: manualEntry.date,
      startTime: manualEntry.startTime,
      endTime: manualEntry.endTime,
      hallId: manualEntry.hallId,
      subject: manualEntry.subject,
      faculty: manualEntry.faculty,
      batch: manualEntry.batch,
      branch: manualEntry.branch,
      type: manualEntry.type,
      status: 'approved'
    };

    onImport([booking]);
    setParseSuccess('Successfully added 1 class');
    toast.success('Class added successfully');
    
    // Reset form
    setManualEntry({
      date: '',
      startTime: '',
      endTime: '',
      hallId: '',
      subject: '',
      faculty: '',
      batch: 'Y23',
      branch: 'CSE',
      type: 'regular'
    });
  };

  // Download CSV Template
  const downloadCSVTemplate = () => {
    const headers = 'date,startTime,endTime,hallId,subject,faculty,batch,branch,type\n';
    const comment1 = '# CampusConnect Timetable Import Template\n';
    const comment2 = '# Time formats supported: "08:30 AM - 09:25 AM" OR "08:00" (24-hour)\n';
    const comment3 = '# Branch codes: CSE, ECE, CCE, MECH (also accepts IC, PE, PC, OE - auto-mapped)\n';
    const comment4 = '# Batch: Y22, Y23, Y24, Y25 (extra text like "Y23 Repeaters" is auto-cleaned)\n';
    const comment5 = '# Lines starting with # are ignored\n';
    const example = '2025-10-27,08:30 AM - 09:25 AM,09:25 AM,L1,Data Structures,Dr. John Smith,Y23,CSE,regular\n';
    const example2 = '2025-10-27,09:25 AM - 10:20 AM,10:20 AM,L2,Digital Logic,Dr. Jane Doe,Y23,ECE,regular\n';
    const example3 = '2025-10-27,08:00,09:00,L3,DBMS,Dr. Alice Brown,Y24,CCE,regular\n';
    
    const csvContent = comment1 + comment2 + comment3 + comment4 + comment5 + headers + example + example2 + example3;
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'timetable_template.csv';
    a.click();
    window.URL.revokeObjectURL(url);
    toast.success('Template downloaded');
  };

  // Download JSON Template
  const downloadJSONTemplate = () => {
    const template = [
      {
        date: '2025-10-27',
        startTime: '08:30 AM - 09:25 AM',
        endTime: '09:25 AM',
        hallId: 'L1',
        subject: 'Data Structures',
        faculty: 'Dr. John Smith',
        batch: 'Y23',
        branch: 'CSE',
        type: 'regular'
      },
      {
        date: '2025-10-27',
        startTime: '09:25 AM - 10:20 AM',
        endTime: '10:20 AM',
        hallId: 'L2',
        subject: 'Digital Logic',
        faculty: 'Dr. Jane Doe',
        batch: 'Y23',
        branch: 'ECE',
        type: 'regular'
      }
    ];

    const jsonContent = JSON.stringify(template, null, 2);
    const blob = new Blob([jsonContent], { type: 'application/json' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'timetable_template.json';
    a.click();
    window.URL.revokeObjectURL(url);
    toast.success('Template downloaded');
  };

  return (
    <Card className="bg-white/95 backdrop-blur-sm border-gray-200 shadow-lg">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Upload className="h-5 w-5" />
          Import Timetable
        </CardTitle>
        <CardDescription>
          Add classes to the timetable using CSV, JSON, or manual entry
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs value={importMethod} onValueChange={(v) => setImportMethod(v as any)}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="manual" className="flex items-center gap-2">
              <PlusCircle className="h-4 w-4" />
              Manual Entry
            </TabsTrigger>
            <TabsTrigger value="csv" className="flex items-center gap-2">
              <FileSpreadsheet className="h-4 w-4" />
              CSV Upload
            </TabsTrigger>
            <TabsTrigger value="json" className="flex items-center gap-2">
              <Code className="h-4 w-4" />
              JSON Import
            </TabsTrigger>
          </TabsList>

          {/* Manual Entry Tab */}
          <TabsContent value="manual" className="space-y-4 mt-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="date">Date *</Label>
                <Input
                  id="date"
                  type="date"
                  value={manualEntry.date}
                  onChange={(e) => setManualEntry({ ...manualEntry, date: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="timeSlot">Time Slot *</Label>
                <Select 
                  value={manualEntry.startTime} 
                  onValueChange={(value) => {
                    const endTime = value.split(' - ')[1];
                    setManualEntry({ ...manualEntry, startTime: value, endTime });
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select time slot" />
                  </SelectTrigger>
                  <SelectContent>
                    {timeSlots.map((slot) => (
                      <SelectItem key={slot} value={slot}>
                        {slot}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="hall">Hall *</Label>
                <Select value={manualEntry.hallId} onValueChange={(value) => setManualEntry({ ...manualEntry, hallId: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select hall" />
                  </SelectTrigger>
                  <SelectContent>
                    {halls.map((hall) => (
                      <SelectItem key={hall} value={hall}>
                        {hall}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="subject">Subject *</Label>
                <Input
                  id="subject"
                  value={manualEntry.subject}
                  onChange={(e) => setManualEntry({ ...manualEntry, subject: e.target.value })}
                  placeholder="e.g., Data Structures"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="faculty">Faculty Name *</Label>
                <Input
                  id="faculty"
                  value={manualEntry.faculty}
                  onChange={(e) => setManualEntry({ ...manualEntry, faculty: e.target.value })}
                  placeholder="e.g., Dr. John Smith"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="batch">Batch *</Label>
                <Select value={manualEntry.batch} onValueChange={(value) => setManualEntry({ ...manualEntry, batch: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {batches.map((batch) => (
                      <SelectItem key={batch} value={batch}>
                        {batch}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="branch">Branch *</Label>
                <Select value={manualEntry.branch} onValueChange={(value) => setManualEntry({ ...manualEntry, branch: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {branches.map((branch) => (
                      <SelectItem key={branch} value={branch}>
                        {branch}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="type">Class Type *</Label>
                <Select value={manualEntry.type} onValueChange={(value: 'regular' | 'extra') => setManualEntry({ ...manualEntry, type: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="regular">Regular Class</SelectItem>
                    <SelectItem value="extra">Extra Class</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <Button onClick={handleManualSubmit} className="w-full bg-gray-900 hover:bg-gray-800">
              <PlusCircle className="h-4 w-4 mr-2" />
              Add Class to Timetable
            </Button>
          </TabsContent>

          {/* CSV Upload Tab */}
          <TabsContent value="csv" className="space-y-4 mt-4">
            <div className="space-y-4">
              <div>
                <Label htmlFor="csvFile">Upload CSV File</Label>
                <Input
                  id="csvFile"
                  type="file"
                  accept=".csv"
                  onChange={handleCSVUpload}
                  className="mt-2"
                />
                <div className="mt-2 space-y-1">
                  <p className="text-xs text-gray-500">
                    ✅ Flexible time formats: "08:30 AM - 09:25 AM" or "08:00,09:00" (24-hour)
                  </p>
                  <p className="text-xs text-gray-500">
                    ✅ Auto-maps branches: IC/PC→CSE, PE→ECE, OE→CCE, ME→MECH
                  </p>
                  <p className="text-xs text-gray-500">
                    ✅ Auto-extracts batch: "Y23 Repeaters" → Y23
                  </p>
                  <p className="text-xs text-gray-500">
                    ✅ Comment lines (starting with #) are ignored
                  </p>
                </div>
              </div>

              <Button 
                variant="outline" 
                onClick={downloadCSVTemplate}
                className="w-full"
              >
                <Download className="h-4 w-4 mr-2" />
                Download CSV Template
              </Button>

              <Alert className="border-blue-200 bg-blue-50">
                <AlertCircle className="h-4 w-4 text-blue-600" />
                <AlertDescription className="text-blue-800">
                  <strong>Flexible CSV Format:</strong><br />
                  <code className="text-xs bg-white px-2 py-1 rounded mt-1 block overflow-x-auto">
                    # Comments allowed<br />
                    date,startTime,endTime,hallId,subject,faculty,batch,branch,type<br />
                    2025-10-27,08:00,09:00,L1,"Data Structures","Dr. Smith",Y23,CSE,regular<br />
                    2025-10-27,09:25 AM - 10:20 AM,10:20 AM,L2,DBMS,Dr. Jones,Y24 IC,PC,regular
                  </code>
                </AlertDescription>
              </Alert>
            </div>
          </TabsContent>

          {/* JSON Import Tab */}
          <TabsContent value="json" className="space-y-4 mt-4">
            <div className="space-y-4">
              <div>
                <Label htmlFor="jsonData">Paste JSON Data</Label>
                <Textarea
                  id="jsonData"
                  value={jsonData}
                  onChange={(e) => setJsonData(e.target.value)}
                  placeholder='[{"date": "2025-10-27", "startTime": "08:30 AM - 09:25 AM", ...}]'
                  rows={10}
                  className="mt-2 font-mono text-xs"
                />
              </div>

              <div className="flex gap-2">
                <Button 
                  onClick={handleJSONImport}
                  className="flex-1 bg-gray-900 hover:bg-gray-800"
                >
                  <Upload className="h-4 w-4 mr-2" />
                  Import JSON
                </Button>
                <Button 
                  variant="outline" 
                  onClick={downloadJSONTemplate}
                >
                  <Download className="h-4 w-4 mr-2" />
                  Download Template
                </Button>
              </div>

              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  <strong>JSON Format Example:</strong><br />
                  <code className="text-xs bg-gray-100 px-2 py-1 rounded mt-1 block overflow-x-auto">
                    {`[{"date": "2025-10-27", "startTime": "08:30 AM - 09:25 AM", "endTime": "09:25 AM", "hallId": "L1", "subject": "Data Structures", "faculty": "Dr. Smith", "batch": "Y23", "branch": "CSE", "type": "regular"}]`}
                  </code>
                </AlertDescription>
              </Alert>
            </div>
          </TabsContent>
        </Tabs>

        {/* Error/Success Messages */}
        {parseError && (
          <Alert variant="destructive" className="mt-4">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{parseError}</AlertDescription>
          </Alert>
        )}

        {parseSuccess && (
          <Alert className="mt-4 border-green-200 bg-green-50">
            <CheckCircle2 className="h-4 w-4 text-green-600" />
            <AlertDescription className="text-green-800">{parseSuccess}</AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  );
}
