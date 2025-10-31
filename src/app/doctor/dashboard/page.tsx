"use client";
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { getPatients, type Patient } from '@/lib/storage';
import { LogOut, Users, QrCode, Clock, User, UserPlus, CheckCircle2 } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { QRCodeSVG } from 'qrcode.react';
import { ManualPatientEntry } from '@/components/ManualPatientEntry';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import Footer from '@/components/Footer';

export default function DoctorDashboard() {
  const { user, logout, isDoctor } = useAuth();
  const router = useRouter();
  const [patients, setPatients] = useState<Patient[]>([]);
  const [showQR, setShowQR] = useState(false);
  const [showManualEntry, setShowManualEntry] = useState(false);

  useEffect(() => {
    if (!isDoctor) {
      router.push('/doctor/login');
      return;
    }
    loadPatients();
    const interval = setInterval(loadPatients, 10000);
    return () => clearInterval(interval);
  }, [isDoctor, router]);

  const loadPatients = () => {
    const allPatients = getPatients();
    setPatients(allPatients.sort((a, b) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    ));
  };

  const waitingPatients = patients.filter(p => p.status === 'waiting');
  const completedPatients = patients.filter(p => p.status === 'completed');
  const registrationUrl = `${typeof window !== 'undefined' ? window.location.origin : ''}/patient/register`;

  return (
    <div className="min-h-screen bg-secondary/30">
      <header className="bg-card border-b border-border">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <img src="/devai-logo.png" alt="DevAI Labs" className="h-12" />
            <Users className="h-6 w-6 text-primary" />
            <div>
              <h1 className="text-2xl font-bold text-foreground">Doctor Dashboard</h1>
              {user?.name && <p className="text-sm text-muted-foreground">{user.name}</p>}
            </div>
          </div>
          <div className="flex gap-2">
            <Button onClick={() => setShowManualEntry(true)}>
              <UserPlus className="h-4 w-4 mr-2" />
              Add Patient
            </Button>
            <Button variant="outline" onClick={() => setShowQR(true)}>
              <QrCode className="h-4 w-4 mr-2" />
              QR Code
            </Button>
            <Button variant="outline" onClick={() => { logout(); router.push('/doctor/login'); }}>
              <LogOut className="h-4 w-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <Tabs defaultValue="waiting" className="w-full">
          <TabsList className="grid w-full max-w-md grid-cols-2 mx-auto mb-6">
            <TabsTrigger value="waiting">
              <Clock className="h-4 w-4 mr-2" />
              Waiting ({waitingPatients.length})
            </TabsTrigger>
            <TabsTrigger value="completed">
              <CheckCircle2 className="h-4 w-4 mr-2" />
              Assessed ({completedPatients.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="waiting">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>Waiting Patients ({waitingPatients.length})</span>
                  <Badge variant="secondary" className="text-base">
                    <Clock className="h-4 w-4 mr-1" />
                    Live
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {waitingPatients.length === 0 ? (
                  <div className="text-center py-12">
                    <Users className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground text-lg">No patients waiting</p>
                    <p className="text-sm text-muted-foreground mt-2">
                      Patients who register will appear here
                    </p>
                  </div>
                ) : (
                  <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {waitingPatients.map((patient) => (
                      <Card
                        key={patient.id}
                        className="cursor-pointer hover:shadow-lg transition-shadow"
                        onClick={() => router.push(`/doctor/patient/${patient.id}`)}
                      >
                        <CardContent className="pt-6">
                          <div className="flex items-start gap-3">
                            <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                              <User className="h-6 w-6 text-primary" />
                            </div>
                            <div className="flex-1">
                              <h3 className="font-semibold text-lg">{patient.name}</h3>
                              <p className="text-sm text-muted-foreground">
                                {patient.age} years • {patient.gender}
                              </p>
                              <p className="text-sm text-muted-foreground mt-1">
                                {patient.contact}
                              </p>
                              <div className="mt-3">
                                <p className="text-sm font-medium text-foreground">Symptoms:</p>
                                <p className="text-sm text-muted-foreground line-clamp-2">
                                  {patient.symptoms}
                                </p>
                              </div>
                              <Badge variant="outline" className="mt-3">
                                {new Date(patient.createdAt).toLocaleTimeString()}
                              </Badge>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="completed">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>Assessed Patients ({completedPatients.length})</span>
                  <Badge variant="secondary" className="text-base">
                    <CheckCircle2 className="h-4 w-4 mr-1" />
                    Completed
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {completedPatients.length === 0 ? (
                  <div className="text-center py-12">
                    <CheckCircle2 className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground text-lg">No assessed patients yet</p>
                    <p className="text-sm text-muted-foreground mt-2">
                      Completed assessments will appear here
                    </p>
                  </div>
                ) : (
                  <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {completedPatients.map((patient) => (
                      <Card
                        key={patient.id}
                        className="cursor-pointer hover:shadow-lg transition-shadow"
                        onClick={() => router.push(`/doctor/patient/${patient.id}`)}
                      >
                        <CardContent className="pt-6">
                          <div className="flex items-start gap-3">
                            <div className="h-12 w-12 rounded-full bg-green-500/10 flex items-center justify-center">
                              <CheckCircle2 className="h-6 w-6 text-green-600" />
                            </div>
                            <div className="flex-1">
                              <h3 className="font-semibold text-lg">{patient.name}</h3>
                              <p className="text-sm text-muted-foreground">
                                {patient.age} years • {patient.gender}
                              </p>
                              <p className="text-sm text-muted-foreground mt-1">
                                {patient.email}
                              </p>
                              <div className="mt-3">
                                <p className="text-sm font-medium text-foreground">Initial Symptoms:</p>
                                <p className="text-sm text-muted-foreground line-clamp-2">
                                  {patient.symptoms}
                                </p>
                              </div>
                              <Badge variant="outline" className="mt-3">
                                {new Date(patient.createdAt).toLocaleDateString()}
                              </Badge>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>

      <Dialog open={showQR} onOpenChange={setShowQR}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Patient Registration QR Code</DialogTitle>
          </DialogHeader>
          <div className="flex flex-col items-center gap-4 py-4">
            <div className="bg-white p-4 rounded-lg">
              <QRCodeSVG value={registrationUrl} size={256} />
            </div>
            <p className="text-sm text-muted-foreground text-center">
              Patients can scan this QR code to pre-register
            </p>
            <p className="text-xs text-muted-foreground text-center break-all">
              {registrationUrl}
            </p>
          </div>
        </DialogContent>
      </Dialog>

      <ManualPatientEntry 
        open={showManualEntry} 
        onOpenChange={setShowManualEntry}
        onPatientAdded={loadPatients}
      />

      <Footer />
    </div>
  );
}


