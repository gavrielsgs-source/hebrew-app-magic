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

interface AccountantReportEmailProps {
  userName: string;
  reportUrl: string;
  period: string;
  companyName?: string;
  summary?: {
    totalSales: number;
    totalPurchases: number;
    totalExpenses: number;
    grossProfit: number;
    netProfit: number;
    totalVAT: number;
    transactionCount: number;
    inventoryCount: number;
    inventoryValue: number;
    totalOutstanding: number;
  };
}

export const AccountantReportEmail = ({
  userName,
  reportUrl,
  period,
  companyName,
  summary,
}: AccountantReportEmailProps) => {
  const fmt = (n: number) => n.toLocaleString('he-IL', { maximumFractionDigits: 0 });

  return (
    <Html dir="rtl">
      <Head />
      <Preview>דוח תקופתי לרואה חשבון - {period}</Preview>
      <Body style={main}>
        <Container style={container}>
          <Heading style={h1}>📊 דוח תקופתי לרואה חשבון</Heading>

          <Text style={text}>שלום,</Text>

          <Text style={text}>
            {userName} שלח/ה לך דוח תקופתי{companyName ? ` עבור ${companyName}` : ''} לתקופה: <strong>{period}</strong>.
          </Text>

          <Text style={text}>
            הדוח כולל קובץ ZIP עם: עסקאות, חשבוניות מס, קבלות, הוצאות, מצב מלאי, יתרות לקוחות ומסמכי PDF מצורפים.
          </Text>

          {summary && (
            <Section style={summaryBox}>
              <Text style={summaryTitle}>סיכום מהיר</Text>
              <Text style={summaryLine}>סה״כ מכירות: ₪{fmt(summary.totalSales)}</Text>
              <Text style={summaryLine}>סה״כ רכישות: ₪{fmt(summary.totalPurchases)}</Text>
              <Text style={summaryLine}>סה״כ הוצאות: ₪{fmt(summary.totalExpenses)}</Text>
              <Text style={summaryLine}>רווח גולמי: ₪{fmt(summary.grossProfit)}</Text>
              <Text style={summaryLine}>רווח נקי: ₪{fmt(summary.netProfit)}</Text>
              <Text style={summaryLine}>סה״כ מע״מ: ₪{fmt(summary.totalVAT)}</Text>
              <Text style={summaryLine}>{summary.transactionCount} עסקאות | {summary.inventoryCount} רכבים במלאי (₪{fmt(summary.inventoryValue)})</Text>
              {summary.totalOutstanding > 0 && (
                <Text style={{ ...summaryLine, color: '#dc2626' }}>
                  יתרות חוב פתוחות: ₪{fmt(summary.totalOutstanding)}
                </Text>
              )}
            </Section>
          )}

          <Section style={buttonContainer}>
            <Button href={reportUrl} style={button}>
              📥 הורד את הדוח
            </Button>
          </Section>

          <Text style={noteText}>
            הקישור תקף ל-7 ימים. לאחר מכן ניתן לבקש קישור חדש מהמערכת.
          </Text>

          <Hr style={hr} />

          <Text style={footer}>
            נשלח מ-CarsLeadApp
          </Text>
        </Container>
      </Body>
    </Html>
  );
};

export default AccountantReportEmail;

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
  fontSize: '26px',
  fontWeight: 'bold',
  margin: '40px 0 20px',
  padding: '0 40px',
  textAlign: 'center' as const,
};

const text = {
  color: '#333',
  fontSize: '16px',
  lineHeight: '26px',
  margin: '16px 40px',
};

const summaryBox = {
  backgroundColor: '#f0f9ff',
  border: '2px solid #0ea5e9',
  borderRadius: '12px',
  padding: '20px',
  margin: '30px 40px',
};

const summaryTitle = {
  color: '#0369a1',
  fontSize: '18px',
  fontWeight: 'bold',
  margin: '0 0 12px 0',
  textAlign: 'center' as const,
};

const summaryLine = {
  color: '#333',
  fontSize: '14px',
  lineHeight: '22px',
  margin: '4px 0',
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

const noteText = {
  color: '#888',
  fontSize: '13px',
  textAlign: 'center' as const,
  margin: '0 40px',
};

const hr = {
  borderColor: '#e6ebf1',
  margin: '30px 40px',
};

const footer = {
  color: '#8898aa',
  fontSize: '14px',
  textAlign: 'center' as const,
  margin: '20px 40px',
};
