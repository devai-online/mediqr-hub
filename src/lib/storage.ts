export interface Doctor {
  id: string;
  name: string;
  username: string;
  password: string;
  specialty?: string;
  createdAt: string;
}

export interface Patient {
  id: string;
  name: string;
  age: number;
  gender: 'male' | 'female' | 'other';
  contact: string;
  symptoms: string;
  previousDiagnosis?: string;
  reports?: string;
  status: 'waiting' | 'completed';
  createdAt: string;
}

export interface MedicalRecord {
  id: string;
  patientId: string;
  doctorId: string;
  doctorName: string;
  diagnosis: string;
  testResults?: string;
  notes?: string;
  nextVisit?: string;
  createdAt: string;
}

// Doctors
export const getDoctors = (): Doctor[] => {
  return JSON.parse(localStorage.getItem('doctors') || '[]');
};

export const addDoctor = (doctor: Omit<Doctor, 'id' | 'createdAt'>): Doctor => {
  const doctors = getDoctors();
  const newDoctor: Doctor = {
    ...doctor,
    id: crypto.randomUUID(),
    createdAt: new Date().toISOString(),
  };
  doctors.push(newDoctor);
  localStorage.setItem('doctors', JSON.stringify(doctors));
  return newDoctor;
};

export const deleteDoctor = (id: string): void => {
  const doctors = getDoctors().filter(d => d.id !== id);
  localStorage.setItem('doctors', JSON.stringify(doctors));
};

// Patients
export const getPatients = (): Patient[] => {
  return JSON.parse(localStorage.getItem('patients') || '[]');
};

export const addPatient = (patient: Omit<Patient, 'id' | 'status' | 'createdAt'>): Patient => {
  const patients = getPatients();
  const newPatient: Patient = {
    ...patient,
    id: crypto.randomUUID(),
    status: 'waiting',
    createdAt: new Date().toISOString(),
  };
  patients.push(newPatient);
  localStorage.setItem('patients', JSON.stringify(patients));
  return newPatient;
};

export const getPatient = (id: string): Patient | undefined => {
  return getPatients().find(p => p.id === id);
};

export const updatePatientStatus = (id: string, status: 'waiting' | 'completed'): void => {
  const patients = getPatients();
  const index = patients.findIndex(p => p.id === id);
  if (index !== -1) {
    patients[index].status = status;
    localStorage.setItem('patients', JSON.stringify(patients));
  }
};

// Medical Records
export const getMedicalRecords = (): MedicalRecord[] => {
  return JSON.parse(localStorage.getItem('medicalRecords') || '[]');
};

export const getPatientRecords = (patientId: string): MedicalRecord[] => {
  return getMedicalRecords().filter(r => r.patientId === patientId);
};

export const addMedicalRecord = (record: Omit<MedicalRecord, 'id' | 'createdAt'>): MedicalRecord => {
  const records = getMedicalRecords();
  const newRecord: MedicalRecord = {
    ...record,
    id: crypto.randomUUID(),
    createdAt: new Date().toISOString(),
  };
  records.push(newRecord);
  localStorage.setItem('medicalRecords', JSON.stringify(records));
  return newRecord;
};
