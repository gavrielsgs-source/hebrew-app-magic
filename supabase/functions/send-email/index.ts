import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@4.0.0";
import { renderAsync } from "npm:@react-email/components@0.0.22";
import React from "npm:react@18.3.1";

import { WelcomeEmail } from "../_shared/email-templates/welcome-email.tsx";
import { TrialReminderEmail } from "../_shared/email-templates/trial-reminder-email.tsx";
import { PaymentFailedEmail } from "../_shared/email-templates/payment-failed-email.tsx";
import { PaymentReceiptEmail } from "../_shared/email-templates/payment-receipt-email.tsx";
import { AccountantReportEmail } from "../_shared/email-templates/accountant-report-email.tsx";

const resend = new Resend(Deno.env.get("RESEND_API_KEY") as string);
const fromEmail = Deno.env.get("RESEND_FROM_EMAIL") || "CarsLeadApp <onboarding@carsleadapp.com>";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface EmailRequest {
  to: string;
  template: "welcome" | "trial-reminder" | "payment-failed" | "payment-receipt" | "accountant_report";
  data: {
    userName: string;
    magicLink?: string;
    trialEndsAt?: string;
    amount?: number;
    daysLeft?: number;
    failureReason?: string;
    invoiceNumber?: string;
    planName?: string;
    billingCycle?: string;
    paymentDate?: string;
    nextBillingDate?: string;
    invoiceUrl?: string;
    tutorialLink?: string;
    reportUrl?: string;
    period?: string;
    companyName?: string;
    summary?: any;
  };
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { to, template, data }: EmailRequest = await req.json();

    console.log(`📧 Sending ${template} email to ${to}`);

    let html: string;
    let subject: string;

    switch (template) {
      case "welcome":
        subject = "ברוכים הבאים ל-CarsLeadApp! 🎉";
        html = await renderAsync(
          React.createElement(WelcomeEmail, {
            userName: data.userName,
            magicLink: data.magicLink || "",
            trialEndsAt: data.trialEndsAt || "",
            amount: data.amount || 0,
            tutorialLink: data.tutorialLink || undefined,
          })
        );
        break;

      case "trial-reminder":
        subject = `הניסיון שלך מסתיים בעוד ${data.daysLeft} ימים ⏰`;
        html = await renderAsync(
          React.createElement(TrialReminderEmail, {
            userName: data.userName,
            daysLeft: data.daysLeft || 0,
            trialEndsAt: data.trialEndsAt || "",
            amount: data.amount || 0,
          })
        );
        break;

      case "payment-failed":
        subject = "⚠️ בעיה בחיוב - נדרשת פעולה";
        html = await renderAsync(
          React.createElement(PaymentFailedEmail, {
            userName: data.userName,
            amount: data.amount || 0,
            failureReason: data.failureReason,
          })
        );
        break;

      case "payment-receipt":
        subject = "אישור תשלום - CarsLeadApp 💳";
        html = await renderAsync(
          React.createElement(PaymentReceiptEmail, {
            userName: data.userName,
            invoiceNumber: data.invoiceNumber || "",
            amount: data.amount || 0,
            planName: data.planName || "",
            billingCycle: data.billingCycle || "monthly",
            paymentDate: data.paymentDate || "",
            nextBillingDate: data.nextBillingDate,
            invoiceUrl: data.invoiceUrl || "",
          })
        );
        break;

      default:
        throw new Error(`Unknown template: ${template}`);
    }

    const { error } = await resend.emails.send({
      from: fromEmail,
      to: [to],
      subject,
      html,
    });

    if (error) {
      console.error("❌ Error sending email:", error);
      throw error;
    }

    console.log(`✅ Email sent successfully to ${to}`);

    return new Response(
      JSON.stringify({ success: true, message: "Email sent successfully" }),
      {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  } catch (error: any) {
    console.error("❌ Error in send-email function:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
});
