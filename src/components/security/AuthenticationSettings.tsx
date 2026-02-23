import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { Shield, Key, Smartphone, Clock } from 'lucide-react';

interface PasswordPolicy {
  minLength: number;
  requireUppercase: boolean;
  requireLowercase: boolean;
  requireNumbers: boolean;
  requireSpecialChars: boolean;
  passwordExpiry: number;
  passwordHistory: number;
}

interface MFASettings {
  enabled: boolean;
  methods: string[];
  mandatory: boolean;
  backupCodes: boolean;
}

interface SessionSettings {
  timeout: number;
  maxConcurrentSessions: number;
  rememberMe: boolean;
  deviceTracking: boolean;
}

const AuthenticationSettings: React.FC = () => {
  const [passwordPolicy, setPasswordPolicy] = useState<PasswordPolicy>({
    minLength: 8,
    requireUppercase: true,
    requireLowercase: true,
    requireNumbers: true,
    requireSpecialChars: true,
    passwordExpiry: 90,
    passwordHistory: 5
  });

  const [mfaSettings, setMfaSettings] = useState<MFASettings>({
    enabled: true,
    methods: ['TOTP', 'SMS', 'Email'],
    mandatory: false,
    backupCodes: true
  });

  const [sessionSettings, setSessionSettings] = useState<SessionSettings>({
    timeout: 30,
    maxConcurrentSessions: 3,
    rememberMe: true,
    deviceTracking: true
  });

  const [activeTab, setActiveTab] = useState('password');

  const mfaMethods = ['TOTP', 'SMS', 'Email', 'Hardware Token'];

  const handlePasswordPolicyChange = (field: keyof PasswordPolicy, value: any) => {
    setPasswordPolicy(prev => ({ ...prev, [field]: value }));
  };

  const handleMFAChange = (field: keyof MFASettings, value: any) => {
    setMfaSettings(prev => ({ ...prev, [field]: value }));
  };

  const handleSessionChange = (field: keyof SessionSettings, value: any) => {
    setSessionSettings(prev => ({ ...prev, [field]: value }));
  };

  const toggleMFAMethod = (method: string) => {
    setMfaSettings(prev => ({
      ...prev,
      methods: prev.methods.includes(method)
        ? prev.methods.filter(m => m !== method)
        : [...prev.methods, method]
    }));
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Authentication Settings</h2>
        <Button>
          <Shield className="w-4 h-4 mr-2" />
          Save Settings
        </Button>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="password">Password Policy</TabsTrigger>
          <TabsTrigger value="mfa">Multi-Factor Auth</TabsTrigger>
          <TabsTrigger value="session">Session Management</TabsTrigger>
        </TabsList>

        <TabsContent value="password">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Key className="w-5 h-5" />
                Password Policy Configuration
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="minLength">Minimum Password Length</Label>
                  <Input
                    id="minLength"
                    type="number"
                    value={passwordPolicy.minLength}
                    onChange={(e) => handlePasswordPolicyChange('minLength', parseInt(e.target.value))}
                    min="6"
                    max="32"
                  />
                </div>
                <div>
                  <Label htmlFor="passwordExpiry">Password Expiry (days)</Label>
                  <Input
                    id="passwordExpiry"
                    type="number"
                    value={passwordPolicy.passwordExpiry}
                    onChange={(e) => handlePasswordPolicyChange('passwordExpiry', parseInt(e.target.value))}
                    min="30"
                    max="365"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="passwordHistory">Password History (prevent reuse)</Label>
                <Input
                  id="passwordHistory"
                  type="number"
                  value={passwordPolicy.passwordHistory}
                  onChange={(e) => handlePasswordPolicyChange('passwordHistory', parseInt(e.target.value))}
                  min="0"
                  max="24"
                />
              </div>

              <Separator />

              <div className="space-y-4">
                <h4 className="font-medium">Password Complexity Requirements</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="requireUppercase">Require Uppercase Letters</Label>
                    <Switch
                      id="requireUppercase"
                      checked={passwordPolicy.requireUppercase}
                      onCheckedChange={(checked) => handlePasswordPolicyChange('requireUppercase', checked)}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label htmlFor="requireLowercase">Require Lowercase Letters</Label>
                    <Switch
                      id="requireLowercase"
                      checked={passwordPolicy.requireLowercase}
                      onCheckedChange={(checked) => handlePasswordPolicyChange('requireLowercase', checked)}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label htmlFor="requireNumbers">Require Numbers</Label>
                    <Switch
                      id="requireNumbers"
                      checked={passwordPolicy.requireNumbers}
                      onCheckedChange={(checked) => handlePasswordPolicyChange('requireNumbers', checked)}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label htmlFor="requireSpecialChars">Require Special Characters</Label>
                    <Switch
                      id="requireSpecialChars"
                      checked={passwordPolicy.requireSpecialChars}
                      onCheckedChange={(checked) => handlePasswordPolicyChange('requireSpecialChars', checked)}
                    />
                  </div>
                </div>
              </div>

              <div className="bg-blue-50 p-4 rounded-lg">
                <h5 className="font-medium text-blue-900 mb-2">Current Policy Summary</h5>
                <div className="text-sm text-blue-800">
                  <p>• Minimum {passwordPolicy.minLength} characters</p>
                  <p>• Password expires every {passwordPolicy.passwordExpiry} days</p>
                  <p>• Remember last {passwordPolicy.passwordHistory} passwords</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="mfa">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Smartphone className="w-5 h-5" />
                Multi-Factor Authentication
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="mfaEnabled">Enable Multi-Factor Authentication</Label>
                  <p className="text-sm text-gray-500">Require additional verification for user logins</p>
                </div>
                <Switch
                  id="mfaEnabled"
                  checked={mfaSettings.enabled}
                  onCheckedChange={(checked) => handleMFAChange('enabled', checked)}
                />
              </div>

              {mfaSettings.enabled && (
                <>
                  <Separator />
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="mfaMandatory">Mandatory for Admin Users</Label>
                      <p className="text-sm text-gray-500">Require MFA for all admin-level accounts</p>
                    </div>
                    <Switch
                      id="mfaMandatory"
                      checked={mfaSettings.mandatory}
                      onCheckedChange={(checked) => handleMFAChange('mandatory', checked)}
                    />
                  </div>

                  <div>
                    <Label>Available MFA Methods</Label>
                    <div className="grid grid-cols-2 gap-3 mt-2">
                      {mfaMethods.map(method => (
                        <div key={method} className="flex items-center justify-between p-3 border rounded-lg">
                          <span className="font-medium">{method}</span>
                          <Switch
                            checked={mfaSettings.methods.includes(method)}
                            onCheckedChange={() => toggleMFAMethod(method)}
                          />
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="backupCodes">Enable Backup Codes</Label>
                      <p className="text-sm text-gray-500">Allow users to generate backup codes for MFA</p>
                    </div>
                    <Switch
                      id="backupCodes"
                      checked={mfaSettings.backupCodes}
                      onCheckedChange={(checked) => handleMFAChange('backupCodes', checked)}
                    />
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="session">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="w-5 h-5" />
                Session Management
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="sessionTimeout">Session Timeout (minutes)</Label>
                  <Input
                    id="sessionTimeout"
                    type="number"
                    value={sessionSettings.timeout}
                    onChange={(e) => handleSessionChange('timeout', parseInt(e.target.value))}
                    min="5"
                    max="480"
                  />
                </div>
                <div>
                  <Label htmlFor="maxSessions">Max Concurrent Sessions</Label>
                  <Input
                    id="maxSessions"
                    type="number"
                    value={sessionSettings.maxConcurrentSessions}
                    onChange={(e) => handleSessionChange('maxConcurrentSessions', parseInt(e.target.value))}
                    min="1"
                    max="10"
                  />
                </div>
              </div>

              <Separator />

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="rememberMe">Allow "Remember Me"</Label>
                    <p className="text-sm text-gray-500">Let users stay logged in across browser sessions</p>
                  </div>
                  <Switch
                    id="rememberMe"
                    checked={sessionSettings.rememberMe}
                    onCheckedChange={(checked) => handleSessionChange('rememberMe', checked)}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="deviceTracking">Device Tracking</Label>
                    <p className="text-sm text-gray-500">Track and log user devices for security</p>
                  </div>
                  <Switch
                    id="deviceTracking"
                    checked={sessionSettings.deviceTracking}
                    onCheckedChange={(checked) => handleSessionChange('deviceTracking', checked)}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AuthenticationSettings;