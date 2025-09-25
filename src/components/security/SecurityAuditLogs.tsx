import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useRealAdminCheck } from '@/hooks/use-real-admin-check';

interface SecurityAuditLog {
  id: string;
  user_id: string | null;
  action_type: string;
  resource_type: string;
  resource_id: string | null;
  ip_address: string | null;
  user_agent: string | null;
  success: boolean;
  error_message: string | null;
  metadata: any;
  created_at: string;
}

export function SecurityAuditLogs() {
  const { isAdmin } = useRealAdminCheck();
  const [logs, setLogs] = useState<SecurityAuditLog[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isAdmin) return;
    
    fetchSecurityLogs();
  }, [isAdmin]);

  const fetchSecurityLogs = async () => {
    try {
      const { data, error } = await supabase
        .from('security_audit_logs')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(100);

      if (error) throw error;
      setLogs((data as SecurityAuditLog[]) || []);
    } catch (error) {
      console.error('Error fetching security logs:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!isAdmin) {
    return (
      <Card>
        <CardContent className="text-center py-8">
          <p className="text-muted-foreground">אין הרשאה לצפות בלוגי אבטחה</p>
        </CardContent>
      </Card>
    );
  }

  if (loading) {
    return (
      <Card>
        <CardContent className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-2 text-muted-foreground">טוען לוגי אבטחה...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>לוגי אבטחה</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {logs.length === 0 ? (
            <p className="text-muted-foreground text-center">אין אירועי אבטחה</p>
          ) : (
            logs.map((log) => (
              <div key={log.id} className="border rounded-lg p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Badge variant={log.success ? 'default' : 'destructive'}>
                      {log.action_type}
                    </Badge>
                    <span className="text-sm text-muted-foreground">
                      {log.resource_type}
                    </span>
                  </div>
                  <span className="text-xs text-muted-foreground">
                    {new Date(log.created_at).toLocaleString('he-IL')}
                  </span>
                </div>
                
                {log.error_message && (
                  <div className="text-sm text-destructive">
                    {log.error_message}
                  </div>
                )}
                
                <div className="text-xs text-muted-foreground">
                  <div>משתמש: {log.user_id || 'לא ידוע'}</div>
                  {log.ip_address && <div>IP: {log.ip_address}</div>}
                </div>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
}