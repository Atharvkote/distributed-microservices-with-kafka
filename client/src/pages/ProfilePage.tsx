import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { useAuthStore } from '@/store/authStore';
import { User, MapPin, Bell, Shield, Camera } from 'lucide-react';

const ProfilePage: React.FC = () => {
  const { user } = useAuthStore();

  return (
    <div className="max-w-4xl mx-auto px-4 md:px-6 py-8">
      {/* Profile header */}
      <div className="glass rounded-2xl border border-border/50 p-6 mb-8">
        <div className="flex items-center gap-6">
          <div className="relative group">
            <Avatar className="h-20 w-20 border-2 border-primary/30">
              <AvatarImage src={user?.avatar} />
              <AvatarFallback className="gradient-primary text-white text-xl">
                {user?.name?.split(' ').map((n) => n[0]).join('')}
              </AvatarFallback>
            </Avatar>
            <button className="absolute bottom-0 right-0 h-7 w-7 rounded-full gradient-primary flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
              <Camera className="h-3.5 w-3.5 text-white" />
            </button>
          </div>
          <div>
            <h1 className="text-2xl font-bold">{user?.name}</h1>
            <p className="text-muted-foreground text-sm">{user?.email}</p>
            <p className="text-xs text-primary mt-1 capitalize">{user?.role} Account</p>
          </div>
        </div>
      </div>

      <Tabs defaultValue="personal" className="space-y-6">
        <TabsList className="glass border border-border/50">
          <TabsTrigger value="personal"><User className="h-4 w-4 mr-2" /> Personal</TabsTrigger>
          <TabsTrigger value="address"><MapPin className="h-4 w-4 mr-2" /> Addresses</TabsTrigger>
          <TabsTrigger value="settings"><Bell className="h-4 w-4 mr-2" /> Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="personal">
          <Card className="glass border-border/50">
            <CardHeader><CardTitle className="text-lg">Personal Information</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>First Name</Label>
                  <Input defaultValue={user?.name?.split(' ')[0]} className="bg-accent/30 border-border/50" />
                </div>
                <div className="space-y-2">
                  <Label>Last Name</Label>
                  <Input defaultValue={user?.name?.split(' ')[1]} className="bg-accent/30 border-border/50" />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Email</Label>
                <Input defaultValue={user?.email} className="bg-accent/30 border-border/50" />
              </div>
              <div className="space-y-2">
                <Label>Phone</Label>
                <Input placeholder="+1 (555) 000-0000" className="bg-accent/30 border-border/50" />
              </div>
              <Button className="gradient-primary hover:neon-glow">Save Changes</Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="address">
          <Card className="glass border-border/50">
            <CardHeader><CardTitle className="text-lg">Saved Addresses</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="glass rounded-xl p-4 border border-primary/20 neon-glow">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="font-semibold text-sm">Home</p>
                    <p className="text-sm text-muted-foreground mt-1">123 Main Street, Apt 4B</p>
                    <p className="text-sm text-muted-foreground">New York, NY 10001</p>
                  </div>
                  <Badge className="gradient-primary border-0 text-[10px]">Default</Badge>
                </div>
              </div>
              <div className="glass rounded-xl p-4 border border-border/50">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="font-semibold text-sm">Office</p>
                    <p className="text-sm text-muted-foreground mt-1">456 Market Ave, Floor 12</p>
                    <p className="text-sm text-muted-foreground">San Francisco, CA 94105</p>
                  </div>
                  <Button variant="outline" size="sm" className="text-xs border-border/50">Set Default</Button>
                </div>
              </div>
              <Button variant="outline" className="border-primary/30 text-primary hover:bg-primary/10 w-full">
                + Add New Address
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="settings">
          <Card className="glass border-border/50">
            <CardHeader><CardTitle className="text-lg">Notification Settings</CardTitle></CardHeader>
            <CardContent className="space-y-6">
              {[
                { label: 'Order Updates', desc: 'Receive notifications about your order status' },
                { label: 'Promotions', desc: 'Get notified about sales and special offers' },
                { label: 'New Products', desc: 'Be the first to know about new arrivals' },
                { label: 'Newsletter', desc: 'Weekly digest of trending products' },
              ].map((item) => (
                <div key={item.label} className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium">{item.label}</p>
                    <p className="text-xs text-muted-foreground">{item.desc}</p>
                  </div>
                  <Switch />
                </div>
              ))}

              <Separator className="opacity-30" />

              <div>
                <h4 className="text-sm font-semibold flex items-center gap-2 mb-4">
                  <Shield className="h-4 w-4 text-primary" /> Security
                </h4>
                <Button variant="outline" className="border-border/50">Change Password</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ProfilePage;
