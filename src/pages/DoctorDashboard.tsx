import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { getPatients, type Patient } from '@/lib/storage';
import { LogOut, Users, QrCode, Clock, User } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { QRCodeSVG } from 'qrcode.react';

const DoctorDashboard = () => {
  const { user, logout, isDoctor } = useAuth();
  const navigate = useNavigate();
  const [patients, setPatients] = useState<Patient[]>([]);
  const [showQR, setShowQR] = useState(false);

  useEffect(() => {
    if (!isDoctor) {
      navigate('/doctor/login');
      return;
    }
    loadPatients();
    
    // Refresh patient list every 10 seconds
    const interval = setInterval(loadPatients, 10000);
    return () => clearInterval(interval);
  }, [isDoctor, navigate]);

  const loadPatients = () => {
    const allPatients = getPatients();
    setPatients(allPatients.sort((a, b) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    ));
  };

  const waitingPatients = patients.filter(p => p.status === 'waiting');
  const registrationUrl = `${window.location.origin}/patient/register`;

  return (
    <div className="min-h-screen bg-secondary/30">
      <header className="bg-card border-b border-border">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Users className="h-6 w-6 text-primary" />
            <div>
              <h1 className="text-2xl font-bold text-foreground">Doctor Dashboard</h1>
              {user?.name && <p className="text-sm text-muted-foreground">{user.name}</p>}
            </div>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => setShowQR(true)}>
              <QrCode className="h-4 w-4 mr-2" />
              QR Code
            </Button>
            <Button variant="outline" onClick={() => { logout(); navigate('/doctor/login'); }}>
              <LogOut className="h-4 w-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
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
                    onClick={() => navigate(`/doctor/patient/${patient.id}`)}
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
    </div>
  );
};

export default DoctorDashboard;
