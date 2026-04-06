// This file contains the complete parsed timetable data from your college CSV
// This is used to generate the initialBookings array

export const timetableCSVData = `date,startTime,endTime,hallId,subject,faculty,batch,branch,type
# Monday Classes
2025-09-02,08:00,09:00,L1,"PPS/CP IC Y25 Repeaters","Ankit Jha, KM Poonam, Anukriti Bansal, Ankit Jain, Prateek Rathore",Y25,IC,Repeaters
2025-09-02,08:00,09:00,L2,"PPS A2 IC Y25 Repeaters","Ankit Jha, KM Poonam, Anukriti Bansal, Ankit Jain, Prateek Rathore",Y25,IC,Repeaters
2025-09-02,08:00,09:00,L3,"PPS A3 IC Y25 Repeaters","Ankit Jha, KM Poonam, Anukriti Bansal, Ankit Jain, Prateek Rathore",Y25,IC,Repeaters
2025-09-02,08:00,09:00,L7,DISPRO A1 PE,"Priyanka G",Y22,"CCE-ECE",PE
2025-09-02,08:00,09:00,L8,FNET A1 PE,"Vikas B",Y22,"CCE-CSE Integrated",PE
2025-09-02,08:00,09:00,L9,IPP A1 PE,"Joyeeta S",Y22,"CCE ECE Integrated",PE
2025-09-02,08:00,09:00,L10,JENFF A2 IC,"Sati S",Y23,"ECE Integrated",IC
2025-09-02,08:00,09:00,L11,ASM A1 PC,"Nabyendu D",Y24,"M.Sc. PHY",PC
2025-09-02,08:00,09:00,L16,OOP/AP A1 PC,"Varun S, Mukesh J, Rukhsar S",Y24,"1st 50% CSE Integrated",PC
2025-09-02,08:00,09:00,L17,WCOM A1 PC,"Nisum G",Y23,CCE,PC
2025-09-02,09:00,10:00,L1,"BE A1 IC Y25 Repeaters","Sandeep S",Y25,IC,Repeaters
2025-09-02,09:00,10:00,L2,"BE A2 IC Y25 Repeaters","Harshvardhan K",Y25,IC,Repeaters
2025-09-02,09:00,10:00,L3,"CLP A1 IC Y25+ Repeaters","R K Mishra",Y25,IC,Repeaters
2025-09-02,09:00,10:00,L4,FA A1 PC,"Bijender",Y24,"M.Sc. MTH",PC
2025-09-02,09:00,10:00,L7,ITC A1 PE,"S Debnath",Y22,"CCE ECE Integrated",PE
2025-09-02,09:00,10:00,L8,CSE A2 PC,"Rohit R",Y23,"2nd 50% of ECE",PC
2025-09-02,09:00,10:00,L9,AESD A1 PE,"Deepak N",Y22,"CCE ECE Integrated",PE
2025-09-02,09:00,10:00,L10,OL ID,"TBD",TBD,TBD,TBD
2025-09-02,09:00,10:00,L11,NPP A1 PC,"Pomita G",Y24,"M.Sc. PHY",PC
2025-09-02,09:00,10:00,L16,"DBMS/IDBMS A1 PC Y24 1st 50% CSE Integrated-LICAI","A Adhikari, CSETBD, Somya M",Y24,"1st 50% CSE Integrated-LICAI",PC
2025-09-02,09:00,10:00,L17,SWE A1 PC,"Ashish K Dwivedi, Imran A, Anubhav S",Y23,CCE,PC
2025-09-02,10:00,11:00,L1,"CLP A1 IC Y25 Repeaters","Amit N, Nabyendu D, Somnath B, Ashok G",Y25,IC,Repeaters
2025-09-02,10:00,11:00,L2,"CLP A2 IC Y25 Repeaters","Amit N, Nabyendu D, Somnath B, Ashok G",Y25,IC,Repeaters
2025-09-02,10:00,11:00,L3,"BE A3 IC Y25+ Repeaters","K Jena",Y25,IC,Repeaters
2025-09-02,10:00,11:00,L4,MATSTA A1 OE,"S K Gauttam",Y22,"All PE-Y24 M.Sc. MTH",OE
2025-09-02,10:00,11:00,L7,WCOM A1 PC,"Vaibhav K. Gupta, Divyang R",Y23,"1st 50% of ECE Integrated",PC
2025-09-02,10:00,11:00,L8,DSP A2 PC,"Joyeeta S",Y23,"2nd 50% of ECE",PC
2025-09-02,10:00,11:00,L9,POU A1 OE,"Anupam",Y22,All,OE
2025-09-02,10:00,11:00,L10,TOM A1 OE,"Vikram S",Y22,All,OE
2025-09-02,10:00,11:00,L11,ELDY- A1 PC,"Anjishnu S",Y24,"M.Sc. PHY",PC
2025-09-02,10:00,11:00,L16,"DAA A2 PC Y24 1st 50% CSE Integrated LICAI","Lal Upendra, Sudheer S, Aditya Sengar",Y24,"1st 50% CSE Integrated LICAI",PC
2025-09-02,10:00,11:00,L17,DSP A1 PC,"Gaurav V",Y23,CCE,PC
2025-09-02,11:00,12:00,L1,KS AI IC,"Ranga M",Y25,"All & LICAI",IC
2025-09-02,11:00,12:00,L2,KS A IC,"TBD",Y25,All,IC
2025-09-02,11:00,12:00,L3,KS PAI IC,"Ananu M",Y25,All,IC
2025-09-02,11:00,12:00,L4,NLA A1 OF,"TBD",Y22,"All Y24 M.Sc. MTH",OF
2025-09-02,11:00,12:00,L7,CSE A1 PC,"Bharat V",Y23,"1st 50% of ECE Integrated",PC
2025-09-02,11:00,12:00,L8,WCOM P A2 PC,"TBD",Y23,"2nd 50% of ECE",PC
2025-09-02,11:00,12:00,L9,"O",TBD,TBD,TBD,TBD
2025-09-02,11:00,12:00,L10,"O",TBD,TBD,TBD,TBD
2025-09-02,11:00,12:00,L11,CMP- A PC,"Subhayan B",Y24,"M.Sc. PHY",PC
2025-09-02,11:00,12:00,L16,COA A1 PC,"Preety S, Rahul S",Y24,"1st 50% CSE Integrated",PC
2025-09-02,11:00,12:00,L17,EEFE A1 IC,"S S Nehra, Swati S",Y25,CCE,IC
2025-09-02,12:00,13:00,L5,"O",TBD,TBD,TBD,TBD
2025-09-02,12:00,13:00,L6,RTOS A1 OE,"Abhishek S",Y22,All,OE
2025-09-02,12:00,13:00,L7,DSP A1 PC,"Rakhi B",Y23,"1st 50% of ECE Integrated",PC
2025-09-02,12:00,13:00,L19,"DAA A2 PC Y24 2nd 50% CSE Minor Core-ECE-ME","Lal Upendra, Sudheer S, Aditya Sengar",Y24,"2nd 50% CSE Minor Core-ECE-ME",PC
2025-09-02,12:00,13:00,L20,"DBMS/IDBMS A2 PC Y24 2nd 50% CSE","A Adhikari, CSETBD, Somya M",Y24,"2nd 50% CSE",PC
2025-09-02,13:00,14:00,L1,"PPS/CP B1 IC Y25 Repeaters","Ankit Jha, KM Poonam, Anukriti Bansal, Ankit Jain, Prateek Rathore",Y25,IC,Repeaters
2025-09-02,13:00,14:00,L2,"PPS B2 IC Y25 Repeaters","Ankit Jha, KM Poonam, Anukriti Bansal, Ankit Jain, Prateek Rathore",Y25,IC,Repeaters
2025-09-02,13:00,14:00,L3,"PPS B3 IC Y25 Late Admissions","CCETBD",Y25,IC,"Late Admissions"
2025-09-02,13:00,14:00,L4,FMSE B1 Elective,"Somnath H",Y25,PHD,Elective
2025-09-02,13:00,14:00,L5,FOP B1 PC,"Rakesh T",Y25,LICAI,PC
2025-09-02,13:00,14:00,L6,IOTET B1 PE,"Sunil K",Y25,"M.Tech (Gen)",PE
2025-09-02,13:00,14:00,L7,DILTH B1 Elective,"Harsh T",Y25,PHD,Elective
2025-09-02,13:00,14:00,L9,SC B1 PE,"Aloke D",Y23,"CSE Integrated+CCE",PE
2025-09-02,13:00,14:00,L10,MAS B1 PC,"Anirudh A",Y25,"M.Tech. ECE",PC
2025-09-02,13:00,14:00,L11,CP B1 PC,"Pratibha G",Y25,"M.Sc. MTC",PC
2025-09-02,13:00,14:00,L12,MP-1 B1 PC,"Anjishnu S",Y25,"M.Sc. PHY",PC
2025-09-02,13:00,14:00,L13,IEM B1 PC,"Vikram S",Y23,ME,PC
2025-09-02,13:00,14:00,L16,CPS B1 PE,"Saurabh K",Y22,"CCE+CSE+Integrated",PE
2025-09-02,13:00,14:00,L21,CSS/CS B1 PC,"Jayprakash K, CSETBD2",Y23,"1st 50% CSE",PC
2025-09-02,13:00,14:00,L17,DAA B1 PC,"Lal Upendra, Sudheer S, Aditya Sengar",Y24,CCE,PC
2025-09-02,13:00,14:00,L19,ZKP B1 PE,"Mohit G",Y22,"CCE+CSE-Integrated",PE
2025-09-02,14:00,15:00,L1,"BE B1 IC Y25+ Repeaters","Shailza G",Y25,IC,Repeaters
2025-09-02,14:00,15:00,L2,"BE B2 IC Y25 Repeaters","Gaurav C",Y25,IC,Repeaters
2025-09-02,14:00,15:00,L3,"BE B3 IC Y25 late admissions","Suvadeep C",Y25,IC,"Late Admissions"
2025-09-02,14:00,15:00,L4,MEET B1 PC,"Vikas S",Y21,"& Older Batches ME",PC
2025-09-02,14:00,15:00,L5,INTP B1 PC,"Sarada S",Y25,LICAI,PC
2025-09-02,14:00,15:00,L6,ADS B1 PC,"Nikunja K",Y25,"All M.Tech Y25 MS",PC
2025-09-02,14:00,15:00,L7,SAS B1 PC,"Sunilk S",Y24,"1st 50% of ECE Integrated",PC
2025-09-02,14:00,15:00,L8,S&S B2 PC,"Harsh Kumawat",Y24,"2nd 50% of ECE",PC
2025-09-02,14:00,15:00,L9,MICROI B1 PC,"Akash G",Y21,"& Older Batches ECE Integrated",PC
2025-09-02,14:00,15:00,L10,AWC B1 PC,"S Debnath, R. Gangopadhyay",Y25,"M.Tech. ECE",PC
2025-09-02,14:00,15:00,L11,LA B1 PC,"Ratan G",Y25,"M.Sc. MTC",PC
2025-09-02,14:00,15:00,L12,COMP B1 PC,"Ashok",Y25,"M.Sc. PHY",PC
2025-09-02,14:00,15:00,L13,OIA,"TBD",Y21,"& Older Batches CSE Integrated",TBD
2025-09-02,14:00,15:00,L16,CSS/CS B1 PC,"Jayprakash K, CSETBD2",Y23,"1st 50% CSE",PC
2025-09-02,14:00,15:00,L17,SAS PC,"Richa P",Y24,CCE,PC
2025-09-02,14:00,15:00,L19,EEFE B2 IC,"S S Nehra, Swati S",Y23,"2nd 50% CSE Integrated",IC
2025-09-02,15:00,16:00,L1,"CLP B1 IC Y25 Repeaters","Amit N, Nabyendu D, Somnath B, Ashok G",Y25,IC,Repeaters
2025-09-02,15:00,16:00,L2,"CLP B2 IC Y25 Repeaters","Amit N, Nabyendu D, Somnath B, Ashok G",Y25,IC,Repeaters
2025-09-02,15:00,16:00,L3,"CLP B3 IC Y25 late admissions","R R Mishra",Y25,IC,"Late Admissions"
2025-09-02,15:00,16:00,L4,TOPO A1 PC,"Ashish M",Y24,"M.Sc. MTH",PC
2025-09-02,15:00,16:00,L5,ICS B1 PC,"Amit K",Y25,LICAI,PC
2025-09-02,15:00,16:00,L6,FDS B1 PC,"Subrat D, Aloke D",Y25,"M Tech (AIML)",PC
2025-09-02,15:00,16:00,L7,MAM B1 PC,"Abhishek S",Y24,"1st 50% of ECE Integrated",PC
2025-09-02,15:00,16:00,L8,NAS B2 PC,"Gopinath S, Jeet G",Y24,"2nd 50% of ECE",PC
2025-09-02,15:00,16:00,L10,M-III B1 PC,"Pratibha G, Ajit P",Y21,"& Older Batches All",PC
2025-09-02,15:00,16:00,L11,DMS B1 PC,"Harsh T",Y25,"M.Sc. MTC",PC
2025-09-02,15:00,16:00,L12,CM B1 PC,"Rakesh T",Y25,"M.Sc. PHY",PC
2025-09-02,15:00,16:00,L13,HT B1 PC,"Praveen S",Y23,ME,PC
2025-09-02,15:00,16:00,L16,SWE B1 PC,"Ashish K Dwivedi, Imran A, Anubhav S",Y23,"1st 50% CSE",PC
2025-09-02,15:00,16:00,L17,DBMS/IDBMS B1 PC,"A Adhikari, CSETHD, Somya M",Y24,CCE,PC
2025-09-02,15:00,16:00,L18,"DSP Lab (Y23 ECECCE)",TBD,Y23,"ECECCE",Lab
2025-09-02,15:00,16:00,L19,AI H2 PC,"Rajendra P, Poulami D",Y23,"2nd 50% CSE Integrated",PC
2025-09-02,16:00,17:00,L1,ESHI IC,"RM",Y25,IC,IC
2025-09-02,16:00,17:00,L2,SBK All IC,"TBD",TBD,All,IC
2025-09-02,16:00,17:00,L4,"O",TBD,TBD,TBD,TBD
2025-09-02,16:00,17:00,L5,DVST B1 PC,"Ankit S",Y25,LICAI,PC
2025-09-02,16:00,17:00,L6,"O",TBD,TBD,TBD,TBD
2025-09-02,16:00,17:00,L7,DCS B1 PC,"Ritesh B",Y24,"1st 50% of ECE Integrated",PC
2025-09-02,16:00,17:00,L8,DCS B2 PC,"Akash G",Y24,"2nd 50% of ECE",PC
2025-09-02,16:00,17:00,L10,AGT B1 PE,"B S Panda",Y22,"CSE Integrated Y21 Integrated",PE
2025-09-02,16:00,17:00,L11,RANA B1 PC,"Dishant C",Y25,"M.Sc. MTC",PC
2025-09-02,16:00,17:00,L12,EL B1 PC,"G D Sharma",Y25,"M.Sc. PHY",PC
2025-09-02,16:00,17:00,L13,"O",TBD,TBD,TBD,TBD
2025-09-02,16:00,17:00,L16,EEFE B1 IC,"S S Nehra, Swati S",Y23,"1st 50% CSE-1st 50% ME",IC
2025-09-02,16:00,17:00,L22,COA B1 PC,"Priyanka G",Y24,CCE,PC
2025-09-02,16:00,17:00,L19,CSS/CS B1 PC,"Jayprakash K, CSETHD2",Y23,"2nd 50% CSE Integrated",IC
2025-09-02,17:00,18:00,L1,"TBD",TBD,TBD,TBD,TBD
2025-09-02,17:00,18:00,L15,AI A1 Spcl. Elective,"TBD",Y22,"CSE-Integrated",Elective
2025-09-02,17:00,18:00,L16,AI B1 PC,"Rajendra P, Poulami D",Y23,"CSE Minor Core-Y23 & Y22",PC
2025-09-02,17:00,18:00,L23,OOP/AP B1 PC,"Varun S, Mukesh J, S",Y24,CCE,PC
2025-09-02,17:00,18:00,L19,SWE B2 PC,"Ashish K. Dwivedi, Imran A, Anubhav S",Y23,"2nd 50% CSE Integrated",PC`;

// Function to parse CSV and generate booking entries
export function parseCSVToBookings(csvData: string) {
  const lines = csvData.split('\n');
  const bookings = [];
  let idCounter = 1;
  
  for (const line of lines) {
    // Skip empty lines and comments
    if (!line.trim() || line.trim().startsWith('#')) continue;
    if (line.startsWith('date,')) continue; // Skip header
    
    // Parse CSV line (handling quotes)
    const parts = line.match(/(".*?"|[^,]+)(?=\s*,|\s*$)/g);
    if (!parts || parts.length < 9) continue;
    
    const [date, startTime, endTime, hallId, subject, faculty, batch, branch, type] = parts.map(p => 
      p.replace(/^"(.*)"$/, '$1').trim()
    );
    
    if (date && hallId && subject) {
      bookings.push({
        id: `booking-${idCounter++}`,
        hallId: hallId as any,
        year: batch,
        branch: branch,
        courseName: subject,
        date: date,
        startTime: startTime,
        endTime: endTime,
        isExtraClass: false,
        facultyName: faculty,
        classType: type
      });
    }
  }
  
  return bookings;
}
