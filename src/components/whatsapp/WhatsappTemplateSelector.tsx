
import React, { useState, useEffect } from 'react';
import { useSubscription } from '@/contexts/subscription-context';
import { whatsappTemplates, type WhatsappTemplate } from './whatsapp-templates';
import { WhatsappTemplateForm } from './WhatsappTemplateForm';
import { toast } from 'sonner';

interface WhatsappTemplateSelectorProps {
  selectedTemplateId: string;
  customizedTemplate: string;
  onTemplateChange: (templateId: string) => void;
  onCustomizedTemplateChange: (template: string) => void;
}

export function WhatsappTemplateSelector({
  selectedTemplateId,
  customizedTemplate,
  onTemplateChange,
  onCustomizedTemplateChange,
}: WhatsappTemplateSelectorProps) {
  const { subscription } = useSubscription();
  const [availableTemplates, setAvailableTemplates] = useState<WhatsappTemplate[]>([]);

  useEffect(() => {
    // הגבלת מספר התבניות לפי החבילה
    const templateLimit = subscription.templateLimit || 0;
    
    if (templateLimit === Infinity) {
      setAvailableTemplates(whatsappTemplates);
    } else {
      setAvailableTemplates(whatsappTemplates.slice(0, templateLimit));
    }

    console.log('🔍 [WhatsappTemplateSelector] Template limit:', templateLimit);
    console.log('🔍 [WhatsappTemplateSelector] Available templates:', templateLimit === Infinity ? whatsappTemplates.length : templateLimit);
  }, [subscription.templateLimit]);

  useEffect(() => {
    // אם התבנית הנבחרת לא זמינה יותר, בחר את הראשונה
    if (selectedTemplateId && !availableTemplates.find(t => t.id === selectedTemplateId)) {
      if (availableTemplates.length > 0) {
        onTemplateChange(availableTemplates[0].id);
        toast.info('התבנית שנבחרה לא זמינה בחבילה הנוכחית. עבר לתבנית ראשונה.');
      }
    }
  }, [availableTemplates, selectedTemplateId, onTemplateChange]);

  return (
    <div className="space-y-4">
      {subscription.templateLimit !== Infinity && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-sm">
          <p className="text-blue-800">
            זמינות עבורך {availableTemplates.length} תבניות מתוך {whatsappTemplates.length} בחבילת {subscription.tier}.
            {subscription.tier !== 'enterprise' && (
              <span className="block mt-1">
                שדרג לחבילה גבוהה יותר לגישה לכל התבניות.
              </span>
            )}
          </p>
        </div>
      )}
      
      <WhatsappTemplateForm
        templates={availableTemplates}
        selectedTemplateId={selectedTemplateId}
        customizedTemplate={customizedTemplate}
        onTemplateChange={onTemplateChange}
        onCustomizedTemplateChange={onCustomizedTemplateChange}
      />
    </div>
  );
}
