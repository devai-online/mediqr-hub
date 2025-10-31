"use client";
import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Checkbox } from '@/components/ui/checkbox';
import { getPatient, updatePatientStatus, addMedicalRecord, getPatientRecords, type Patient, type MedicalRecord } from '@/lib/storage';
import { ArrowLeft, Save, User, FileText, Activity, FlaskConical, Stethoscope, Mail } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

export default function PatientDetail() {
  const params = useParams();
  const id = params?.id as string | undefined;
  const { user, isDoctor } = useAuth();
  const router = useRouter();
  const [patient, setPatient] = useState<Patient | null>(null);
  const [records, setRecords] = useState<MedicalRecord[]>([]);
  const [formData, setFormData] = useState({
    bloodPressure: '',
    heartRate: '',
    respiratoryRate: '',
    bodyTemperature: '',
    oxygenSaturation: '',
    weight: '',
    height: '',
    bmi: '',
    bloodGroup: '',
    allergies: '',
    smokingAlcohol: '',
    currentMedications: '',
    historyDiabetes: false,
    historyDiabetesDuration: '',
    historyHypertension: false,
    historyHypertensionDuration: '',
    historyHeartDisease: false,
    historyHeartDiseaseDuration: '',
    historyStroke: false,
    historyStrokeDuration: '',
    historyCancer: false,
    historyCancerDuration: '',
    historyTB: false,
    historyTBDuration: '',
    historyAsthma: false,
    historyAsthmaDuration: '',
    historyBloodTransfusion: false,
    historyBloodTransfusionDuration: '',
    historyThyroid: false,
    historyThyroidDuration: '',
    pastSurgery: '',
    gpePallor: false,
    gpeIcterus: false,
    gpeCyanosis: false,
    gpeClubbing: false,
    gpeEdema: false,
    gpeLymphadenopathy: false,
    chiefComplaint: '',
    symptomDuration: '',
    associatedSymptoms: '',
    onsetType: '',
    physicalExamination: '',
    systemicExamination: '',
    provisionalDiagnosis: '',
    bloodTests: '',
    urineTests: '',
    imaging: '',
    cardiac: '',
    otherTests: '',
    finalDiagnosis: '',
    icdCode: '',
    medications: '',
    dietAdvice: '',
    procedures: '',
    followUpDate: '',
    referral: '',
    doctorNotes: '',
  });

  useEffect(() => {
    if (!isDoctor || !id) {
      router.push('/doctor/dashboard');
      return;
    }
    const patientData = getPatient(id);
    if (!patientData) {
      router.push('/doctor/dashboard');
      return;
    }
    setPatient(patientData);
    setRecords(getPatientRecords(id));
  }, [id, isDoctor, router]);

  useEffect(() => {
    if (formData.weight && formData.height) {
      const weightKg = parseFloat(formData.weight);
      const heightM = parseFloat(formData.height) / 100;
      if (weightKg > 0 && heightM > 0) {
        const bmi = (weightKg / (heightM * heightM)).toFixed(1);
        setFormData(prev => ({ ...prev, bmi }));
      }
    }
  }, [formData.weight, formData.height]);

  const generateEmailBody = () => {
    if (!patient) return '';
    let body = `Dear ${patient.name},\n\n`;
    body += `Here is your medical record from your visit on ${new Date().toLocaleDateString()}.\n\n`;
    body += `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`;
    body += `PATIENT INFORMATION\n`;
    body += `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`;
    body += `Name: ${patient.name}\n`;
    body += `Age: ${patient.age} years\n`;
    body += `Gender: ${patient.gender}\n\n`;
    if (formData.finalDiagnosis) {
      body += `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`;
      body += `DIAGNOSIS\n`;
      body += `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`;
      body += `${formData.finalDiagnosis}\n\n`;
    }
    if (formData.medications) {
      body += `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`;
      body += `MEDICATIONS\n`;
      body += `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`;
      body += `${formData.medications}\n\n`;
    }
    if (formData.dietAdvice) {
      body += `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`;
      body += `DIET & LIFESTYLE ADVICE\n`;
      body += `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`;
      body += `${formData.dietAdvice}\n\n`;
    }
    if (formData.followUpDate) {
      body += `Next Follow-up: ${new Date(formData.followUpDate).toLocaleDateString()}\n\n`;
    }
    body += `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`;
    body += `Doctor: ${user?.name || user?.username}\n`;
    body += `\nPlease contact us if you have any questions.\n\n`;
    body += `Best regards,\nMedical Team`;
    return encodeURIComponent(body);
  };

  const handleSendEmail = () => {
    if (!patient || !formData.finalDiagnosis) {
      toast({
        title: 'Cannot Send Email',
        description: 'Please complete the diagnosis first',
        variant: 'destructive',
      });
      return;
    }
    const subject = encodeURIComponent(`Medical Record - ${patient.name} - ${new Date().toLocaleDateString()}`);
    const body = generateEmailBody();
    window.location.href = `mailto:${patient.email}?subject=${subject}&body=${body}`;
  };

  const handleSave = () => {
    if (!patient || !user) return;
    if (!formData.finalDiagnosis) {
      toast({
        title: 'Error',
        description: 'Please enter a final diagnosis',
        variant: 'destructive',
      });
      return;
    }
    addMedicalRecord({
      patientId: patient.id,
      doctorId: user.id,
      doctorName: user.name || user.username,
      ...formData,
    });
    updatePatientStatus(patient.id, 'completed');
    toast({
      title: 'Success',
      description: 'Medical record saved successfully',
    });
    setTimeout(() => {
      if (window.confirm('Would you like to send this record to the patient via email?')) {
        handleSendEmail();
      }
    }, 500);
    router.push('/doctor/dashboard');
  };

  if (!patient) return null;

  return (
    <div className="min-h-screen bg-secondary/30">
      <header className="bg-card border-b border-border sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Button variant="ghost" onClick={() => router.push('/doctor/dashboard')}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Dashboard
            </Button>
            <div className="flex gap-2">
              <Button variant="outline" onClick={handleSendEmail} disabled={!formData.finalDiagnosis}>
                <Mail className="h-4 w-4 mr-2" />
                Send via Email
              </Button>
              <Button onClick={handleSave}>
                <Save className="h-4 w-4 mr-2" />
                Save Record
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-4 gap-6">
          <div className="lg:col-span-1">
            <Card className="sticky top-24">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <User className="h-5 w-5" />
                  Patient Info
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <p className="text-sm text-muted-foreground">Name</p>
                  <p className="font-semibold">{patient.name}</p>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <p className="text-xs text-muted-foreground">Age</p>
                    <p className="font-medium">{patient.age}y</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Gender</p>
                    <p className="font-medium capitalize">{patient.gender}</p>
                  </div>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Contact</p>
                  <p className="text-sm">{patient.contact}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Email</p>
                  <p className="text-sm break-all">{patient.email}</p>
                </div>
                <Separator />
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Symptoms</p>
                  <p className="text-sm">{patient.symptoms}</p>
                </div>
                {patient.previousDiagnosis && (
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Previous Diagnosis</p>
                    <p className="text-sm">{patient.previousDiagnosis}</p>
                  </div>
                )}
                <div>
                  <p className="text-xs text-muted-foreground">Registration</p>
                  <p className="text-xs">{new Date(patient.createdAt).toLocaleString()}</p>
                </div>
                {records.length > 0 && (
                  <>
                    <Separator />
                    <div>
                      <p className="text-sm font-semibold mb-2 flex items-center gap-1">
                        <FileText className="h-4 w-4" />
                        Previous Records ({records.length})
                      </p>
                      <div className="space-y-2 max-h-64 overflow-y-auto">
                        {records.map((record) => (
                          <div key={record.id} className="p-2 bg-secondary/50 rounded text-xs space-y-1">
                            <div className="flex justify-between items-start">
                              <p className="font-medium">{record.doctorName}</p>
                              <Badge variant="outline" className="text-[10px] h-5">
                                {new Date(record.createdAt).toLocaleDateString()}
                              </Badge>
                            </div>
                            <p className="text-muted-foreground">{record.finalDiagnosis}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          </div>

          <div className="lg:col-span-3">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Stethoscope className="h-5 w-5" />
                  Medical Record Entry
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue="vitals" className="w-full">
                  <TabsList className="grid w-full grid-cols-5">
                    <TabsTrigger value="vitals">
                      <Activity className="h-4 w-4 mr-2" />
                      Vitals
                    </TabsTrigger>
                    <TabsTrigger value="history">
                      <FileText className="h-4 w-4 mr-2" />
                      History
                    </TabsTrigger>
                    <TabsTrigger value="clinical">
                      <Stethoscope className="h-4 w-4 mr-2" />
                      Clinical
                    </TabsTrigger>
                    <TabsTrigger value="tests">
                      <FlaskConical className="h-4 w-4 mr-2" />
                      Tests
                    </TabsTrigger>
                    <TabsTrigger value="diagnosis">
                      <FileText className="h-4 w-4 mr-2" />
                      Diagnosis
                    </TabsTrigger>
                  </TabsList>

                  <TabsContent value="vitals" className="space-y-6 mt-6">
                    <div>
                      <h3 className="text-lg font-semibold mb-4">Vital Signs</h3>
                      <div className="grid md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="bloodPressure">Blood Pressure (mmHg)</Label>
                          <Input
                            id="bloodPressure"
                            placeholder="120/80"
                            value={formData.bloodPressure}
                            onChange={(e) => setFormData({ ...formData, bloodPressure: e.target.value })}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="heartRate">Heart Rate (bpm)</Label>
                          <Input
                            id="heartRate"
                            placeholder="72"
                            value={formData.heartRate}
                            onChange={(e) => setFormData({ ...formData, heartRate: e.target.value })}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="respiratoryRate">Respiratory Rate (breaths/min)</Label>
                          <Input
                            id="respiratoryRate"
                            placeholder="16"
                            value={formData.respiratoryRate}
                            onChange={(e) => setFormData({ ...formData, respiratoryRate: e.target.value })}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="bodyTemperature">Temperature (°C/°F)</Label>
                          <Input
                            id="bodyTemperature"
                            placeholder="98.6°F / 37°C"
                            value={formData.bodyTemperature}
                            onChange={(e) => setFormData({ ...formData, bodyTemperature: e.target.value })}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="oxygenSaturation">Oxygen Saturation (SpO₂ %)</Label>
                          <Input
                            id="oxygenSaturation"
                            placeholder="98"
                            value={formData.oxygenSaturation}
                            onChange={(e) => setFormData({ ...formData, oxygenSaturation: e.target.value })}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="bloodGroup">Blood Group</Label>
                          <Select value={formData.bloodGroup} onValueChange={(value) => setFormData({ ...formData, bloodGroup: value })}>
                            <SelectTrigger>
                              <SelectValue placeholder="Select blood group" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="A+">A+</SelectItem>
                              <SelectItem value="A-">A-</SelectItem>
                              <SelectItem value="B+">B+</SelectItem>
                              <SelectItem value="B-">B-</SelectItem>
                              <SelectItem value="AB+">AB+</SelectItem>
                              <SelectItem value="AB-">AB-</SelectItem>
                              <SelectItem value="O+">O+</SelectItem>
                              <SelectItem value="O-">O-</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    </div>

                    <Separator />

                    <div>
                      <h3 className="text-lg font-semibold mb-4">Physical Parameters</h3>
                      <div className="grid md:grid-cols-3 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="weight">Weight (kg)</Label>
                          <Input
                            id="weight"
                            placeholder="70"
                            value={formData.weight}
                            onChange={(e) => setFormData({ ...formData, weight: e.target.value })}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="height">Height (cm)</Label>
                          <Input
                            id="height"
                            placeholder="170"
                            value={formData.height}
                            onChange={(e) => setFormData({ ...formData, height: e.target.value })}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="bmi">BMI (auto-calculated)</Label>
                          <Input
                            id="bmi"
                            placeholder="Auto"
                            value={formData.bmi}
                            readOnly
                            className="bg-secondary/50"
                          />
                        </div>
                      </div>
                    </div>

                    <Separator />

                    <div>
                      <h3 className="text-lg font-semibold mb-4">General Health</h3>
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <Label htmlFor="allergies">Allergies (if any)</Label>
                          <Input
                            id="allergies"
                            placeholder="e.g., Penicillin, Peanuts"
                            value={formData.allergies}
                            onChange={(e) => setFormData({ ...formData, allergies: e.target.value })}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="smokingAlcohol">Smoking/Alcohol History</Label>
                          <Input
                            id="smokingAlcohol"
                            placeholder="e.g., Non-smoker, Social drinker"
                            value={formData.smokingAlcohol}
                            onChange={(e) => setFormData({ ...formData, smokingAlcohol: e.target.value })}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="currentMedications">Current Medications</Label>
                          <Textarea
                            id="currentMedications"
                            placeholder="List current medications"
                            value={formData.currentMedications}
                            onChange={(e) => setFormData({ ...formData, currentMedications: e.target.value })}
                            rows={2}
                          />
                        </div>
                      </div>
                    </div>
                  </TabsContent>

                  <TabsContent value="history" className="space-y-6 mt-6">
                    <div>
                      <h3 className="text-lg font-semibold mb-4">Past Medical History</h3>
                      <div className="grid md:grid-cols-2 gap-4">
                        {[
                          { key: 'Diabetes', stateKey: 'historyDiabetes', durationKey: 'historyDiabetesDuration' },
                          { key: 'Hypertension', stateKey: 'historyHypertension', durationKey: 'historyHypertensionDuration' },
                          { key: 'Heart Disease', stateKey: 'historyHeartDisease', durationKey: 'historyHeartDiseaseDuration' },
                          { key: 'Stroke', stateKey: 'historyStroke', durationKey: 'historyStrokeDuration' },
                          { key: 'Cancer', stateKey: 'historyCancer', durationKey: 'historyCancerDuration' },
                          { key: 'TB', stateKey: 'historyTB', durationKey: 'historyTBDuration' },
                          { key: 'Asthma', stateKey: 'historyAsthma', durationKey: 'historyAsthmaDuration' },
                          { key: 'Blood Transfusion', stateKey: 'historyBloodTransfusion', durationKey: 'historyBloodTransfusionDuration' },
                          { key: 'Thyroid', stateKey: 'historyThyroid', durationKey: 'historyThyroidDuration' },
                        ].map((item) => (
                          <div key={item.key} className="space-y-2 p-3 border rounded-lg">
                            <div className="flex items-center space-x-2">
                              <Checkbox
                                id={item.stateKey}
                                checked={(formData as any)[item.stateKey] as boolean}
                                onCheckedChange={(checked) => setFormData({ ...formData, [item.stateKey]: checked as boolean })}
                              />
                              <Label htmlFor={item.stateKey} className="font-medium cursor-pointer">{item.key}</Label>
                            </div>
                            {(formData as any)[item.stateKey] && (
                              <Input
                                placeholder="Duration (e.g., 5 years, since 2015)"
                                value={(formData as any)[item.durationKey] as string}
                                onChange={(e) => setFormData({ ...formData, [item.durationKey]: e.target.value })}
                                className="ml-6"
                              />
                            )}
                          </div>
                        ))}
                      </div>
                    </div>

                    <Separator />

                    <div>
                      <h3 className="text-lg font-semibold mb-4">Past Surgery</h3>
                      <div className="space-y-2">
                        <Label htmlFor="pastSurgery">Surgical History</Label>
                        <Textarea
                          id="pastSurgery"
                          placeholder="List any past surgeries with dates"
                          value={formData.pastSurgery}
                          onChange={(e) => setFormData({ ...formData, pastSurgery: e.target.value })}
                          rows={4}
                        />
                      </div>
                    </div>
                  </TabsContent>

                  <TabsContent value="clinical" className="space-y-6 mt-6">
                    <div>
                      <h3 className="text-lg font-semibold mb-4">General Physical Examination (GPE)</h3>
                      <div className="grid md:grid-cols-3 gap-4">
                        {[
                          { key: 'Pallor', stateKey: 'gpePallor' },
                          { key: 'Icterus', stateKey: 'gpeIcterus' },
                          { key: 'Cyanosis', stateKey: 'gpeCyanosis' },
                          { key: 'Clubbing', stateKey: 'gpeClubbing' },
                          { key: 'Edema', stateKey: 'gpeEdema' },
                          { key: 'Lymphadenopathy', stateKey: 'gpeLymphadenopathy' },
                        ].map((item) => (
                          <div key={item.key} className="flex items-center space-x-2 p-3 border rounded-lg">
                            <Checkbox
                              id={item.stateKey}
                              checked={(formData as any)[item.stateKey] as boolean}
                              onCheckedChange={(checked) => setFormData({ ...formData, [item.stateKey]: checked as boolean })}
                            />
                            <Label htmlFor={item.stateKey} className="font-medium cursor-pointer">{item.key}</Label>
                          </div>
                        ))}
                      </div>
                    </div>

                    <Separator />

                    <div>
                      <h3 className="text-lg font-semibold mb-4">Symptoms</h3>
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <Label htmlFor="chiefComplaint">Chief Complaint *</Label>
                          <Textarea
                            id="chiefComplaint"
                            placeholder="Main reason for visit"
                            value={formData.chiefComplaint}
                            onChange={(e) => setFormData({ ...formData, chiefComplaint: e.target.value })}
                            rows={3}
                          />
                        </div>
                        <div className="grid md:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="symptomDuration">Duration</Label>
                            <Input
                              id="symptomDuration"
                              placeholder="e.g., 3 days, 2 weeks"
                              value={formData.symptomDuration}
                              onChange={(e) => setFormData({ ...formData, symptomDuration: e.target.value })}
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="onsetType">Onset Type</Label>
                            <Select value={formData.onsetType} onValueChange={(value) => setFormData({ ...formData, onsetType: value })}>
                              <SelectTrigger>
                                <SelectValue placeholder="Select onset type" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="acute">Acute</SelectItem>
                                <SelectItem value="chronic">Chronic</SelectItem>
                                <SelectItem value="gradual">Gradual</SelectItem>
                                <SelectItem value="sudden">Sudden</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="associatedSymptoms">Associated Symptoms</Label>
                          <Textarea
                            id="associatedSymptoms"
                            placeholder="Other symptoms observed"
                            value={formData.associatedSymptoms}
                            onChange={(e) => setFormData({ ...formData, associatedSymptoms: e.target.value })}
                            rows={2}
                          />
                        </div>
                      </div>
                    </div>

                    <Separator />

                    <div>
                      <h3 className="text-lg font-semibold mb-4">Physical Examination</h3>
                      <div className="space-y-2">
                        <Label htmlFor="physicalExamination">Examination Findings</Label>
                        <Textarea
                          id="physicalExamination"
                          placeholder="General Appearance, Skin, Cardiovascular, Respiratory, Abdominal, Nervous System, etc."
                          value={formData.physicalExamination}
                          onChange={(e) => setFormData({ ...formData, physicalExamination: e.target.value })}
                          rows={8}
                        />
                      </div>
                    </div>

                    <Separator />

                    <div>
                      <h3 className="text-lg font-semibold mb-4">Systemic Examination</h3>
                      <div className="space-y-2">
                        <Label htmlFor="systemicExamination">System-wise Examination</Label>
                        <Textarea
                          id="systemicExamination"
                          placeholder="CVS, RS, CNS, GIT, etc."
                          value={formData.systemicExamination}
                          onChange={(e) => setFormData({ ...formData, systemicExamination: e.target.value })}
                          rows={6}
                        />
                      </div>
                    </div>

                    <Separator />

                    <div>
                      <h3 className="text-lg font-semibold mb-4">Provisional Diagnosis</h3>
                      <div className="space-y-2">
                        <Label htmlFor="provisionalDiagnosis">Initial Assessment</Label>
                        <Textarea
                          id="provisionalDiagnosis"
                          placeholder="Doctor's initial assessment / suspected condition"
                          value={formData.provisionalDiagnosis}
                          onChange={(e) => setFormData({ ...formData, provisionalDiagnosis: e.target.value })}
                          rows={3}
                        />
                      </div>
                    </div>
                  </TabsContent>

                  <TabsContent value="tests" className="space-y-6 mt-6">
                    <div>
                      <h3 className="text-lg font-semibold mb-4">Laboratory Tests</h3>
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <Label htmlFor="bloodTests">Blood Tests</Label>
                          <Textarea
                            id="bloodTests"
                            placeholder="Hemoglobin, RBC, WBC, Platelets, Blood Sugar, HbA1c, Cholesterol, LFT, etc."
                            value={formData.bloodTests}
                            onChange={(e) => setFormData({ ...formData, bloodTests: e.target.value })}
                            rows={5}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="urineTests">Urine Tests</Label>
                          <Textarea
                            id="urineTests"
                            placeholder="pH, Protein, Sugar, Ketones, RBC, WBC"
                            value={formData.urineTests}
                            onChange={(e) => setFormData({ ...formData, urineTests: e.target.value })}
                            rows={3}
                          />
                        </div>
                      </div>
                    </div>

                    <Separator />

                    <div>
                      <h3 className="text-lg font-semibold mb-4">Imaging & Cardiac</h3>
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <Label htmlFor="imaging">Imaging Results</Label>
                          <Textarea
                            id="imaging"
                            placeholder="X-Ray, Ultrasound, MRI, CT Scan findings"
                            value={formData.imaging}
                            onChange={(e) => setFormData({ ...formData, imaging: e.target.value })}
                            rows={4}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="cardiac">Cardiac Tests</Label>
                          <Textarea
                            id="cardiac"
                            placeholder="ECG Findings, Echocardiogram Report"
                            value={formData.cardiac}
                            onChange={(e) => setFormData({ ...formData, cardiac: e.target.value })}
                            rows={3}
                          />
                        </div>
                      </div>
                    </div>

                    <Separator />

                    <div>
                      <h3 className="text-lg font-semibold mb-4">Other Tests</h3>
                      <div className="space-y-2">
                        <Label htmlFor="otherTests">Additional Tests</Label>
                        <Textarea
                          id="otherTests"
                          placeholder="Stool Test, Culture Test, Serology, Biopsy, etc."
                          value={formData.otherTests}
                          onChange={(e) => setFormData({ ...formData, otherTests: e.target.value })}
                          rows={4}
                        />
                      </div>
                    </div>
                  </TabsContent>

                  <TabsContent value="diagnosis" className="space-y-6 mt-6">
                    <div>
                      <h3 className="text-lg font-semibold mb-4">Final Diagnosis</h3>
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <Label htmlFor="finalDiagnosis">Confirmed Diagnosis *</Label>
                          <Textarea
                            id="finalDiagnosis"
                            placeholder="Enter final diagnosis (required)"
                            value={formData.finalDiagnosis}
                            onChange={(e) => setFormData({ ...formData, finalDiagnosis: e.target.value })}
                            rows={3}
                            className="border-primary/50"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="icdCode">ICD Code (optional)</Label>
                          <Input
                            id="icdCode"
                            placeholder="e.g., J00, E11.9"
                            value={formData.icdCode}
                            onChange={(e) => setFormData({ ...formData, icdCode: e.target.value })}
                          />
                        </div>
                      </div>
                    </div>

                    <Separator />

                    <div>
                      <h3 className="text-lg font-semibold mb-4">Treatment Plan</h3>
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <Label htmlFor="medications">Medications & Prescription</Label>
                          <Textarea
                            id="medications"
                            placeholder={"Medicine Name - Dosage - Frequency - Duration\ne.g., Amoxicillin 500mg - 1 tablet - 3 times daily - 7 days"}
                            value={formData.medications}
                            onChange={(e) => setFormData({ ...formData, medications: e.target.value })}
                            rows={6}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="dietAdvice">Diet & Lifestyle Recommendations</Label>
                          <Textarea
                            id="dietAdvice"
                            placeholder="Diet advice, exercise recommendations, lifestyle modifications"
                            value={formData.dietAdvice}
                            onChange={(e) => setFormData({ ...formData, dietAdvice: e.target.value })}
                            rows={4}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="procedures">Procedures Performed</Label>
                          <Textarea
                            id="procedures"
                            placeholder="Any procedures performed during visit"
                            value={formData.procedures}
                            onChange={(e) => setFormData({ ...formData, procedures: e.target.value })}
                            rows={3}
                          />
                        </div>
                      </div>
                    </div>

                    <Separator />

                    <div>
                      <h3 className="text-lg font-semibold mb-4">Follow-up</h3>
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <Label htmlFor="followUpDate">Next Visit Date</Label>
                          <Input
                            id="followUpDate"
                            type="date"
                            value={formData.followUpDate}
                            onChange={(e) => setFormData({ ...formData, followUpDate: e.target.value })}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="referral">Referral To (Specialist/Lab)</Label>
                          <Input
                            id="referral"
                            placeholder="e.g., Cardiologist, Orthopedic Specialist"
                            value={formData.referral}
                            onChange={(e) => setFormData({ ...formData, referral: e.target.value })}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="doctorNotes">Doctor's Notes</Label>
                          <Textarea
                            id="doctorNotes"
                            placeholder="Additional observations, recommendations, or notes for future reference"
                            value={formData.doctorNotes}
                            onChange={(e) => setFormData({ ...formData, doctorNotes: e.target.value })}
                            rows={4}
                          />
                        </div>
                      </div>
                    </div>

                    <div className="pt-4">
                      <Button onClick={handleSave} size="lg" className="w-full">
                        <Save className="h-5 w-5 mr-2" />
                        Save Medical Record
                      </Button>
                    </div>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}


