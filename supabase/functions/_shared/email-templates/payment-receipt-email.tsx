import {
  Body,
  Container,
  Head,
  Heading,
  Html,
  Link,
  Preview,
  Section,
  Text,
  Hr,
} from 'npm:@react-email/components@0.0.22';
import * as React from 'npm:react@18.3.1';

interface PaymentReceiptEmailProps {
  userName: string;
  invoiceNumber: string;
  amount: number;
  planName: string;
  billingCycle: string;
  paymentDate: string;
  nextBillingDate?: string;
  invoiceUrl: string;
}

export const PaymentReceiptEmail = ({
  userName,
  invoiceNumber,
  amount,
  planName,
  billingCycle,
  paymentDate,
  nextBillingDate,
  invoiceUrl,
}: PaymentReceiptEmailProps) => (
  <Html dir="rtl">
    <Head />
    <Preview>קבלה על תשלום - CarsLeadApp</Preview>
    <Body style={main}>
      <Container style={container}>
        <Heading style={h1}>תודה על התשלום! 🎉</Heading>
        
        <Text style={text}>
          שלום {userName},
        </Text>
        
        <Text style={text}>
          התשלום שלך התקבל בהצלחה. להלן פרטי העסקה:
        </Text>

        <Section style={receiptBox}>
          <table style={table}>
            <tr>
              <td style={labelCell}>מספר חשבונית:</td>
              <td style={valueCell}><strong>{invoiceNumber}</strong></td>
            </tr>
            <tr>
              <td style={labelCell}>חבילה:</td>
              <td style={valueCell}>{planName}</td>
            </tr>
            <tr>
              <td style={labelCell}>מחזור חיוב:</td>
              <td style={valueCell}>{billingCycle === 'monthly' ? 'חודשי' : 'שנתי'}</td>
            </tr>
            <tr>
              <td style={labelCell}>תאריך תשלום:</td>
              <td style={valueCell}>{paymentDate}</td>
            </tr>
            {nextBillingDate && (
              <tr>
                <td style={labelCell}>חיוב הבא:</td>
                <td style={valueCell}>{nextBillingDate}</td>
              </tr>
            )}
            <tr>
              <td style={labelCell} colSpan={2}><Hr style={hr} /></td>
            </tr>
            <tr>
              <td style={labelCell}>סה"כ:</td>
              <td style={{...valueCell, ...totalAmount}}>₪{amount.toFixed(2)}</td>
            </tr>
          </table>
        </Section>

        <Link
          href={invoiceUrl}
          style={button}
        >
          הורד חשבונית PDF
        </Link>

        <Text style={text}>
          תוכל למצוא את כל החשבוניות שלך בכל עת בעמוד "החשבוניות שלי" במערכת.
        </Text>

        <Hr style={hr} />

        <Text style={footerText}>
          זקוק לעזרה? צור קשר איתנו בכל עת
        </Text>

        <Text style={footer}>
          <Link
            href="https://carsleadapp.com"
            target="_blank"
            style={link}
          >
            CarsLeadApp
          </Link>
          <br />
          מערכת ניהול לידים לסוכני רכב
        </Text>
      </Container>
    </Body>
  </Html>
);

export default PaymentReceiptEmail;

const main = {
  backgroundColor: '#f6f9fc',
  fontFamily: 'Rubik, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
  padding: '20px',
};

const container = {
  backgroundColor: '#ffffff',
  margin: '0 auto',
  padding: '40px 20px',
  borderRadius: '8px',
  maxWidth: '600px',
};

const h1 = {
  color: '#2F3C7E',
  fontSize: '28px',
  fontWeight: 'bold',
  margin: '0 0 30px',
  textAlign: 'center' as const,
};

const text = {
  color: '#333',
  fontSize: '16px',
  lineHeight: '26px',
  margin: '16px 0',
};

const receiptBox = {
  backgroundColor: '#f8f9fa',
  border: '2px solid #e9ecef',
  borderRadius: '8px',
  padding: '24px',
  margin: '24px 0',
};

const table = {
  width: '100%',
  borderCollapse: 'collapse' as const,
};

const labelCell = {
  color: '#6c757d',
  fontSize: '14px',
  padding: '8px 0',
  textAlign: 'right' as const,
  width: '40%',
};

const valueCell = {
  color: '#333',
  fontSize: '16px',
  padding: '8px 0',
  textAlign: 'left' as const,
  width: '60%',
};

const totalAmount = {
  fontSize: '20px',
  fontWeight: 'bold' as const,
  color: '#4CAF50',
};

const button = {
  backgroundColor: '#2F3C7E',
  borderRadius: '8px',
  color: '#fff',
  display: 'inline-block',
  fontSize: '16px',
  fontWeight: 'bold' as const,
  textDecoration: 'none',
  textAlign: 'center' as const,
  padding: '14px 28px',
  margin: '24px 0',
  width: '100%',
  boxSizing: 'border-box' as const,
};

const hr = {
  border: 'none',
  borderTop: '1px solid #e9ecef',
  margin: '16px 0',
};

const footerText = {
  color: '#6c757d',
  fontSize: '14px',
  lineHeight: '22px',
  textAlign: 'center' as const,
  margin: '24px 0 16px',
};

const footer = {
  color: '#898989',
  fontSize: '12px',
  lineHeight: '20px',
  textAlign: 'center' as const,
  margin: '24px 0',
};

const link = {
  color: '#2F3C7E',
  textDecoration: 'underline',
};
