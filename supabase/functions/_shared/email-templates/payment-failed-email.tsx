import {
  Body,
  Container,
  Head,
  Heading,
  Html,
  Link,
  Preview,
  Text,
  Button,
  Section,
  Hr,
} from 'npm:@react-email/components@0.0.22';
import * as React from 'npm:react@18.3.1';

interface PaymentFailedEmailProps {
  userName: string;
  amount: number;
  failureReason?: string;
}

export const PaymentFailedEmail = ({
  userName,
  amount,
  failureReason,
}: PaymentFailedEmailProps) => {
  return (
    <Html dir="rtl">
      <Head />
      <Preview>⚠️ בעיה בחיוב - נדרשת פעולה</Preview>
      <Body style={main}>
        <Container style={container}>
          <Heading style={h1}>⚠️ בעיה בחיוב</Heading>
          
          <Text style={text}>
            היי {userName},
          </Text>
          
          <Text style={text}>
            ניסינו לחייב את הכרטיס שלך אך התשלום נכשל.
          </Text>

          <Section style={errorBox}>
            <Text style={errorText}>
              💳 סכום: {amount} ₪
            </Text>
            {failureReason && (
              <Text style={errorSubtext}>
                ❌ סיבה: {failureReason}
              </Text>
            )}
          </Section>

          <Section style={buttonContainer}>
            <Button href="https://carsleadapp.com/payment" style={button}>
              👉 עדכן פרטי תשלום
            </Button>
          </Section>

          <Section style={warningBox}>
            <Text style={warningText}>
              ⚠️ חשוב!
            </Text>
            <Text style={warningSubtext}>
              אם לא תעדכן את פרטי התשלום תוך 48 שעות, הגישה למערכת תושבת.
            </Text>
          </Section>

          <Hr style={hr} />

          <Heading style={h2}>💡 סיבות נפוצות לכשל בתשלום:</Heading>
          
          <Text style={infoText}>
            • יתרה לא מספקת בכרטיס
          </Text>
          <Text style={infoText}>
            • כרטיס אשראי שפג תוקפו
          </Text>
          <Text style={infoText}>
            • פרטים שגויים בכרטיס
          </Text>
          <Text style={infoText}>
            • הגבלת חיובים מחברת האשראי
          </Text>

          <Hr style={hr} />

          <Text style={helpText}>
            צריך עזרה? אנחנו כאן בשבילך!
            <br />
            צור קשר עם התמיכה ונעזור לך לפתור את הבעיה.
          </Text>

          <Text style={footer}>
            בברכה,
            <br />
            צוות CarsLeadApp
          </Text>
        </Container>
      </Body>
    </Html>
  );
};

export default PaymentFailedEmail;

const main = {
  backgroundColor: '#f6f9fc',
  fontFamily: 'Arial, sans-serif',
};

const container = {
  backgroundColor: '#ffffff',
  margin: '0 auto',
  padding: '20px 0 48px',
  marginBottom: '64px',
  maxWidth: '600px',
};

const h1 = {
  color: '#dc2626',
  fontSize: '28px',
  fontWeight: 'bold',
  margin: '40px 0',
  padding: '0 40px',
  textAlign: 'center' as const,
};

const h2 = {
  color: '#333',
  fontSize: '18px',
  fontWeight: 'bold',
  margin: '30px 40px 20px',
};

const text = {
  color: '#333',
  fontSize: '16px',
  lineHeight: '26px',
  margin: '16px 40px',
};

const infoText = {
  color: '#555',
  fontSize: '15px',
  lineHeight: '24px',
  margin: '8px 40px',
};

const errorBox = {
  backgroundColor: '#fef2f2',
  border: '2px solid #ef4444',
  borderRadius: '12px',
  padding: '20px',
  margin: '30px 40px',
  textAlign: 'center' as const,
};

const errorText = {
  color: '#dc2626',
  fontSize: '18px',
  fontWeight: 'bold',
  margin: '0 0 10px 0',
};

const errorSubtext = {
  color: '#dc2626',
  fontSize: '14px',
  margin: '0',
};

const warningBox = {
  backgroundColor: '#fff7ed',
  border: '2px solid #f97316',
  borderRadius: '12px',
  padding: '20px',
  margin: '30px 40px',
  textAlign: 'center' as const,
};

const warningText = {
  color: '#ea580c',
  fontSize: '18px',
  fontWeight: 'bold',
  margin: '0 0 10px 0',
};

const warningSubtext = {
  color: '#ea580c',
  fontSize: '14px',
  margin: '0',
  lineHeight: '22px',
};

const buttonContainer = {
  textAlign: 'center' as const,
  margin: '30px 0',
};

const button = {
  backgroundColor: '#dc2626',
  borderRadius: '8px',
  color: '#fff',
  fontSize: '18px',
  fontWeight: 'bold',
  textDecoration: 'none',
  textAlign: 'center' as const,
  display: 'inline-block',
  padding: '14px 40px',
};

const hr = {
  borderColor: '#e6ebf1',
  margin: '30px 40px',
};

const helpText = {
  color: '#666',
  fontSize: '14px',
  lineHeight: '24px',
  margin: '20px 40px',
  textAlign: 'center' as const,
};

const footer = {
  color: '#8898aa',
  fontSize: '14px',
  lineHeight: '24px',
  margin: '30px 40px',
  textAlign: 'center' as const,
};
