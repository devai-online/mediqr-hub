import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Stethoscope, ShieldCheck, QrCode } from 'lucide-react';
import devaiLogo from '@/assets/devai-logo.png';

const Index = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-secondary/20 to-accent/20">
      <div className="container mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <img src={devaiLogo} alt="DevAI Labs" className="h-16 mx-auto mb-6" />
          <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
            MediQR Hub
          </h1>
          <p className="text-xl text-muted-foreground">
            Modern Doctor-Patient Dashboard System
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader className="text-center">
              <div className="flex justify-center mb-4">
                <ShieldCheck className="h-12 w-12 text-primary" />
              </div>
              <CardTitle>Admin Portal</CardTitle>
              <CardDescription>Manage doctor accounts</CardDescription>
            </CardHeader>
            <CardContent>
              <Button onClick={() => navigate('/admin/login')} className="w-full">
                Admin Login
              </Button>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader className="text-center">
              <div className="flex justify-center mb-4">
                <Stethoscope className="h-12 w-12 text-primary" />
              </div>
              <CardTitle>Doctor Portal</CardTitle>
              <CardDescription>Access patient dashboard</CardDescription>
            </CardHeader>
            <CardContent>
              <Button onClick={() => navigate('/doctor/login')} className="w-full">
                Doctor Login
              </Button>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader className="text-center">
              <div className="flex justify-center mb-4">
                <QrCode className="h-12 w-12 text-primary" />
              </div>
              <CardTitle>Patient Portal</CardTitle>
              <CardDescription>Pre-register for visit</CardDescription>
            </CardHeader>
            <CardContent>
              <Button onClick={() => navigate('/patient/register')} className="w-full">
                Register Now
              </Button>
            </CardContent>
          </Card>
        </div>

        <div className="mt-12 text-center">
          <p className="text-sm text-muted-foreground">
            Default admin credentials: admin / admin123
          </p>
          <p className="text-xs text-muted-foreground mt-4">
            Powered by DevAI Labs
          </p>
        </div>
      </div>
    </div>
  );
};

export default Index;
