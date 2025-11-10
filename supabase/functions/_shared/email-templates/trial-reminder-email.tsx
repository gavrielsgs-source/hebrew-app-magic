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

interface TrialReminderEmailProps {
  userName: string;
  daysLeft: number;
  trialEndsAt: string;
  amount: number;
}

export const TrialReminderEmail = ({
  userName,
  daysLeft,
  trialEndsAt,
  amount,
}: TrialReminderEmailProps) => {
  const formattedDate = new Date(trialEndsAt).toLocaleDateString('he-IL', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return (
    <Html dir="rtl">
      <Head />
      <Preview>הניסיון שלך מסתיים בעוד {daysLeft} ימים ⏰</Preview>
      <Body style={main}>
        <Container style={container}>
          <Heading style={h1}>⏰ תזכורת חשובה</Heading>
          
          <Text style={text}>
            היי {userName},
          </Text>
          
          <Text style={text}>
            רק רצינו להזכיר - הניסיון החינמי שלך מסתיים בעוד {daysLeft} ימים.
          </Text>

          <Section style={highlightBox}>
            <Text style={highlightText}>
              הניסיון מסתיים בעוד {daysLeft} {daysLeft === 1 ? 'יום' : 'ימים'}
            </Text>
          </Section>

          <Heading style={h2}>📋 פרטים:</Heading>
          
          <Text style={infoText}>
            📅 תאריך חיוב: {formattedDate}
          </Text>
          <Text style={infoText}>
            💳 סכום: {amount} ₪
          </Text>
          <Text style={infoText}>
            ✅ נחייב אוטומטית את הכרטיס ששמרת
          </Text>

          <Section style={noticeBox}>
            <Text style={noticeText}>
              💡 אין צורך לעשות כלום!
            </Text>
            <Text style={noticeSubtext}>
              המערכת תמשיך לעבוד בצורה חלקה ללא הפרעה
            </Text>
          </Section>

          <Hr style={hr} />

          <Text style={helpText}>
            רוצה לבטל? ניתן לבטל את המנוי בכל עת מהגדרות החשבון.
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

export default TrialReminderEmail;

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
  color: '#333',
  fontSize: '28px',
  fontWeight: 'bold',
  margin: '40px 0',
  padding: '0 40px',
  textAlign: 'center' as const,
};

const h2 = {
  color: '#333',
  fontSize: '20px',
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

const highlightBox = {
  backgroundColor: '#fff4e6',
  border: '2px solid #f97316',
  borderRadius: '12px',
  padding: '20px',
  margin: '30px 40px',
  textAlign: 'center' as const,
};

const highlightText = {
  color: '#ea580c',
  fontSize: '20px',
  fontWeight: 'bold',
  margin: '0',
};

const noticeBox = {
  backgroundColor: '#f0fdf4',
  border: '2px solid #22c55e',
  borderRadius: '12px',
  padding: '20px',
  margin: '30px 40px',
  textAlign: 'center' as const,
};

const noticeText = {
  color: '#15803d',
  fontSize: '18px',
  fontWeight: 'bold',
  margin: '0 0 10px 0',
};

const noticeSubtext = {
  color: '#15803d',
  fontSize: '14px',
  margin: '0',
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
