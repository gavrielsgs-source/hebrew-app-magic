import { Check, X } from 'lucide-react';
import { useMemo } from 'react';

interface PasswordStrengthMeterProps {
  password: string;
}

interface PasswordRequirement {
  label: string;
  test: (password: string) => boolean;
}

export function PasswordStrengthMeter({ password }: PasswordStrengthMeterProps) {
  const requirements: PasswordRequirement[] = useMemo(() => [
    {
      label: 'לפחות 8 תווים',
      test: (pwd) => pwd.length >= 8,
    },
    {
      label: 'אות גדולה אחת לפחות (A-Z)',
      test: (pwd) => /[A-Z]/.test(pwd),
    },
    {
      label: 'אות קטנה אחת לפחות (a-z)',
      test: (pwd) => /[a-z]/.test(pwd),
    },
    {
      label: 'ספרה אחת לפחות (0-9)',
      test: (pwd) => /[0-9]/.test(pwd),
    },
    {
      label: 'תו מיוחד אחד לפחות (!@#$%^&*)',
      test: (pwd) => /[!@#$%^&*(),.?":{}|<>]/.test(pwd),
    },
  ], []);

  const passedRequirements = useMemo(() => {
    return requirements.filter(req => req.test(password)).length;
  }, [password, requirements]);

  const strength = useMemo(() => {
    if (passedRequirements === 0) return { level: 0, label: '', color: '' };
    if (passedRequirements <= 2) return { level: 1, label: 'חלשה', color: 'bg-destructive' };
    if (passedRequirements <= 4) return { level: 2, label: 'בינונית', color: 'bg-warning' };
    return { level: 3, label: 'חזקה', color: 'bg-success' };
  }, [passedRequirements]);

  if (!password) return null;

  return (
    <div className="space-y-3 p-4 bg-muted/50 rounded-lg border border-border">
      <div className="space-y-2">
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground font-medium">חוזק הסיסמה:</span>
          {strength.level > 0 && (
            <span className={`font-semibold ${
              strength.level === 1 ? 'text-destructive' : 
              strength.level === 2 ? 'text-warning' : 
              'text-success'
            }`}>
              {strength.label}
            </span>
          )}
        </div>
        
        <div className="flex gap-2 h-2">
          {[1, 2, 3].map((level) => (
            <div
              key={level}
              className={`flex-1 rounded-full transition-colors ${
                level <= strength.level ? strength.color : 'bg-border'
              }`}
            />
          ))}
        </div>
      </div>

      <div className="space-y-2">
        {requirements.map((requirement, index) => {
          const passed = requirement.test(password);
          return (
            <div key={index} className="flex items-center gap-2 text-sm">
              {passed ? (
                <Check className="h-4 w-4 text-success flex-shrink-0" />
              ) : (
                <X className="h-4 w-4 text-muted-foreground flex-shrink-0" />
              )}
              <span className={passed ? 'text-foreground' : 'text-muted-foreground'}>
                {requirement.label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
