import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { getPatient, updatePatientStatus, addMedicalRecord, getPatientRecords, type Patient, type MedicalRecord } from '@/lib/storage';
import { ArrowLeft, Save, User, FileText, Clock, Stethoscope } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

const PatientDetail = () => {
  const { id } = useParams();
  const { user, isDoctor } = useAuth();
  const navigate = useNavigate();
  const [patient, setPatient] = useState<Patient | null>(null);
  const [records, setRecords] = useState<MedicalRecord[]>([]);
  const [formData, setFormData] = useState({
    diagnosis: '',
    testResults: '',
    notes: '',
    nextVisit: '',
  });

  useEffect(() => {
    if (!isDoctor || !id) {
      navigate('/doctor/dashboard');
      return;
    }
    
    const patientData = getPatient(id);
    if (!patientData) {
      navigate('/doctor/dashboard');
      return;
    }
    
    setPatient(patientData);
    setRecords(getPatientRecords(id));
  }, [id, isDoctor, navigate]);

  const handleSave = () => {
    if (!patient || !user) return;

    if (!formData.diagnosis) {
      toast({
        title: 'Error',
        description: 'Please enter a diagnosis',
        variant: 'destructive',
      });
      return;
    }

    addMedicalRecord({
      patientId: patient.id,
      doctorId: user.id,
      doctorName: user.name || user.username,
      diagnosis: formData.diagnosis,
      testResults: formData.testResults || undefined,
      notes: formData.notes || undefined,
      nextVisit: formData.nextVisit || undefined,
    });

    updatePatientStatus(patient.id, 'completed');
    
    toast({
      title: 'Success',
      description: 'Medical record saved successfully',
    });

    navigate('/doctor/dashboard');
  };

  if (!patient) return null;

  return (
    <div className="min-h-screen bg-secondary/30">
      <header className="bg-card border-b border-border">
        <div className="container mx-auto px-4 py-4">
          <Button variant="ghost" onClick={() => navigate('/doctor/dashboard')} className="mb-2">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Button>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Patient Info */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Patient Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="text-sm text-muted-foreground">Name</p>
                  <p className="font-semibold text-lg">{patient.name}</p>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Age</p>
                    <p className="font-medium">{patient.age} years</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Gender</p>
                    <p className="font-medium capitalize">{patient.gender}</p>
                  </div>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Contact</p>
                  <p className="font-medium">{patient.contact}</p>
                </div>
                <Separator />
                <div>
                  <p className="text-sm text-muted-foreground mb-2">Current Symptoms</p>
                  <p className="text-sm">{patient.symptoms}</p>
                </div>
                {patient.previousDiagnosis && (
                  <div>
                    <p className="text-sm text-muted-foreground mb-2">Previous Diagnosis</p>
                    <p className="text-sm">{patient.previousDiagnosis}</p>
                  </div>
                )}
                {patient.reports && (
                  <div>
                    <p className="text-sm text-muted-foreground mb-2">Reports</p>
                    <p className="text-sm">{patient.reports}</p>
                  </div>
                )}
                <div>
                  <p className="text-sm text-muted-foreground">Registration Time</p>
                  <p className="text-sm">{new Date(patient.createdAt).toLocaleString()}</p>
                </div>
              </CardContent>
            </Card>

            {/* Previous Records */}
            {records.length > 0 && (
              <Card className="mt-6">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="h-5 w-5" />
                    Previous Records
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {records.map((record) => (
                    <div key={record.id} className="p-3 bg-secondary/50 rounded-lg space-y-2">
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-medium">{record.doctorName}</p>
                        <Badge variant="outline" className="text-xs">
                          {new Date(record.createdAt).toLocaleDateString()}
                        </Badge>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Diagnosis</p>
                        <p className="text-sm">{record.diagnosis}</p>
                      </div>
                      {record.notes && (
                        <div>
                          <p className="text-xs text-muted-foreground">Notes</p>
                          <p className="text-sm">{record.notes}</p>
                        </div>
                      )}
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}
          </div>

          {/* Medical Record Form */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Stethoscope className="h-5 w-5" />
                  Medical Record Entry
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <Label htmlFor="diagnosis">Diagnosis *</Label>
                  <Textarea
                    id="diagnosis"
                    value={formData.diagnosis}
                    onChange={(e) => setFormData({ ...formData, diagnosis: e.target.value })}
                    placeholder="Enter diagnosis..."
                    rows={4}
                  />
                </div>

                <div>
                  <Label htmlFor="testResults">Test Results & Parameters</Label>
                  <Textarea
                    id="testResults"
                    value={formData.testResults}
                    onChange={(e) => setFormData({ ...formData, testResults: e.target.value })}
                    placeholder="Blood Sugar: 110 mg/dL&#10;BP: 120/80 mmHg&#10;..."
                    rows={6}
                  />
                </div>

                <div>
                  <Label htmlFor="notes">Additional Notes</Label>
                  <Textarea
                    id="notes"
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    placeholder="Prescription, instructions, observations..."
                    rows={4}
                  />
                </div>

                <div>
                  <Label htmlFor="nextVisit">Next Visit Date</Label>
                  <Input
                    id="nextVisit"
                    type="date"
                    value={formData.nextVisit}
                    onChange={(e) => setFormData({ ...formData, nextVisit: e.target.value })}
                  />
                </div>

                <Button onClick={handleSave} size="lg" className="w-full">
                  <Save className="h-4 w-4 mr-2" />
                  Save Medical Record
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
};

export default PatientDetail;
