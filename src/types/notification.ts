
export interface PushNotification {
  id: string;
  title: string;
  message: string;
  type: string;
  entity_type?: string;
  entity_id?: string;
  scheduled_for?: string;
  sent_at?: string;
  read_at?: string;
  created_at: string;
}

export interface NotificationPreferences {
  tasks: boolean;
  leads: boolean;
  reminders: boolean;
  meetings: boolean;
}
