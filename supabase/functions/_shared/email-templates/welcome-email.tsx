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

interface WelcomeEmailProps {
  userName: string;
  magicLink: string;
  trialEndsAt: string;
  amount: number;
  tutorialLink?: string;
}

export const WelcomeEmail = ({
  userName,
  magicLink,
  trialEndsAt,
  amount,
}: WelcomeEmailProps) => {
  const formattedDate = new Date(trialEndsAt).toLocaleDateString('he-IL', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return (
    <Html dir="rtl">
      <Head />
      <Preview>ברוכים הבאים ל-CarsLeadApp! 🎉</Preview>
      <Body style={main}>
        <Container style={container}>
          <Heading style={h1}>🚗 ברוכים הבאים ל-CarsLeadApp!</Heading>
          
          <Text style={text}>
            היי {userName},
          </Text>
          
          <Text style={text}>
            תודה רבה שהצטרפת למערכת ניהול הלידים המתקדמת שלנו! 🎉
          </Text>

          <Section style={highlightBox}>
            <Text style={highlightText}>
              🎁 קיבלת 14 ימי ניסיון חינם
            </Text>
            <Text style={highlightSubtext}>
              גישה מלאה לכל התכונות של המערכת!
            </Text>
          </Section>

          <Section style={buttonContainer}>
            <Button href={magicLink} style={button}>
              👉 היכנס למערכת עכשיו
            </Button>
          </Section>

          <Hr style={hr} />

          <Heading style={h2}>ℹ️ מידע חשוב:</Heading>
          
          <Text style={infoText}>
            ✓ הניסיון שלך מסתיים ב-{formattedDate}
          </Text>
          <Text style={infoText}>
            ✓ ביום האחרון נחייב אוטומטית {amount} ₪
          </Text>
          <Text style={infoText}>
            ✓ אין צורך לעשות שום דבר - המערכת תמשיך לעבוד בצורה חלקה
          </Text>
          <Text style={infoText}>
            ✓ רוצה לבטל? אפשר לעשות זאת בכל עת מהגדרות החשבון
          </Text>

          <Hr style={hr} />

          <Text style={helpText}>
            צריך עזרה או יש שאלות? אנחנו כאן בשבילך!
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

export default WelcomeEmail;

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
  backgroundColor: '#f0f9ff',
  border: '2px solid #0ea5e9',
  borderRadius: '12px',
  padding: '20px',
  margin: '30px 40px',
  textAlign: 'center' as const,
};

const highlightText = {
  color: '#0369a1',
  fontSize: '20px',
  fontWeight: 'bold',
  margin: '0 0 10px 0',
};

const highlightSubtext = {
  color: '#0369a1',
  fontSize: '14px',
  margin: '0',
};

const buttonContainer = {
  textAlign: 'center' as const,
  margin: '30px 0',
};

const button = {
  backgroundColor: '#0ea5e9',
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
