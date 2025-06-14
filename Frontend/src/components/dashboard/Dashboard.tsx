
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { DeviceCard } from '@/components/devices/DeviceCard';
import { AddDeviceModal } from '@/components/devices/AddDeviceModal';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { useAuth } from '@/contexts/AuthContext';
import { apiService } from '@/services/api';
import { Device } from '@/types/auth';
import { useToast } from '@/hooks/use-toast';
import { Plus, LogOut, Zap, Cpu, Activity } from 'lucide-react';

export function Dashboard() {
  const [devices, setDevices] = useState<Device[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddDevice, setShowAddDevice] = useState(false);
  const { user, logout } = useAuth();
  const { toast } = useToast();

  const fetchDevices = async () => {
    try {
      const deviceList = await apiService.getDevices();
      setDevices(deviceList);
    } catch (error) {
      toast({
        title: "Failed to load devices",
        description: error instanceof Error ? error.message : "Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDevices();
  }, []);

  const handleLogout = () => {
    logout();
    toast({
      title: "Logged out",
      description: "You have been successfully logged out.",
    });
  };

  const onlineDevices = devices.filter(device => device.state === 'ON').length;
  const totalDevices = devices.length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Header */}
      <header className="border-b border-white/10 bg-black/20 backdrop-blur-md">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-2 rounded-lg bg-primary/10 border border-primary/20">
                <Zap className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h1 className="text-xl font-bold">IoT Control Hub</h1>
                <p className="text-sm text-muted-foreground">Welcome back, {user?.username}</p>
              </div>
            </div>
            <Button 
              onClick={handleLogout}
              variant="outline"
              size="sm"
              className="border-white/10 hover:bg-white/5"
            >
              <LogOut className="mr-2 h-4 w-4" />
              Logout
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="glass-card border-white/10">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Devices</CardTitle>
              <Cpu className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalDevices}</div>
              <p className="text-xs text-muted-foreground">Registered IoT devices</p>
            </CardContent>
          </Card>
          
          <Card className="glass-card border-white/10">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Online Devices</CardTitle>
              <Activity className="h-4 w-4 text-green-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-400">{onlineDevices}</div>
              <p className="text-xs text-muted-foreground">Currently active</p>
            </CardContent>
          </Card>
          
          <Card className="glass-card border-white/10">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Network Status</CardTitle>
              <div className="h-3 w-3 bg-green-400 rounded-full animate-pulse" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">Online</div>
              <p className="text-xs text-muted-foreground">All systems operational</p>
            </CardContent>
          </Card>
        </div>

        {/* Devices Section */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold">Your Devices</h2>
              <p className="text-muted-foreground">Manage and control your IoT devices</p>
            </div>
            <Button 
              onClick={() => setShowAddDevice(true)}
              className="bg-gradient-to-r from-primary to-purple-600 hover:from-primary/90 hover:to-purple-600/90"
            >
              <Plus className="mr-2 h-4 w-4" />
              Register Device
            </Button>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="text-center space-y-4">
                <LoadingSpinner size="lg" />
                <p className="text-muted-foreground">Loading your devices...</p>
              </div>
            </div>
          ) : devices.length === 0 ? (
            <Card className="glass-card border-white/10">
              <CardContent className="py-12">
                <div className="text-center space-y-4">
                  <div className="p-4 rounded-full bg-muted/20 w-fit mx-auto">
                    <Cpu className="h-8 w-8 text-muted-foreground" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold">No devices registered</h3>
                    <p className="text-muted-foreground">
                      Scan the QR code on your Arduino device to get started
                    </p>
                  </div>
                  <Button 
                    onClick={() => setShowAddDevice(true)}
                    className="bg-gradient-to-r from-primary to-purple-600"
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    Register Your First Device
                  </Button>
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {devices.map((device) => (
                <DeviceCard 
                  key={device._id} 
                  device={device} 
                  onDeviceUpdate={fetchDevices}
                />
              ))}
            </div>
          )}
        </div>
      </main>

      <AddDeviceModal
        open={showAddDevice}
        onOpenChange={setShowAddDevice}
        onDeviceAdded={fetchDevices}
      />
    </div>
  );
}
