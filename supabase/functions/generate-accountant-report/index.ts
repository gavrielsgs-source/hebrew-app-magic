import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";
import { zipSync } from "https://esm.sh/fflate@0.8.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const VAT_RATE = 0.18;

interface Transaction {
  date: string;
  transaction_type: string;
  description: string;
  car_make?: string;
  car_model?: string;
  car_year?: number;
  customer_name?: string;
  supplier_name?: string;
  expense_type?: string;
  amount: number;
  vat_amount: number;
  total_with_vat: number;
  invoice_number?: string;
  document_id?: string;
  notes?: string;
  payment_method?: string;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? "",
      {
        global: {
          headers: { Authorization: req.headers.get("Authorization")! },
        },
      }
    );

    const {
      data: { user },
      error: authError,
    } = await supabaseClient.auth.getUser();

    if (authError || !user) {
      throw new Error("Unauthorized");
    }

    const { startDate, endDate } = await req.json();
    console.log(`📊 Generating report for user ${user.id} from ${startDate} to ${endDate}`);

    const transactions: Transaction[] = [];
    const validationErrors: any[] = [];
    const documentFiles: Record<string, Uint8Array> = {};

    // 1. Fetch Sales
    const { data: sales, error: salesError } = await supabaseClient
      .from("customer_vehicle_sales")
      .select(`*, car:cars(make, model, year, purchase_cost), customer:customers(full_name)`)
      .gte("sale_date", startDate)
      .lte("sale_date", endDate)
      .eq("cars.user_id", user.id);

    if (salesError) throw salesError;

    for (const sale of sales || []) {
      const salePrice = sale.sale_price || 0;
      const vatAmount = salePrice * VAT_RATE;

      if (!sale.car?.purchase_cost) {
        validationErrors.push({
          type: "missing_purchase_cost",
          message: `חסר מחיר רכישה לרכב ${sale.car?.make} ${sale.car?.model}`,
          carId: sale.car_id,
        });
      }

      transactions.push({
        date: sale.sale_date,
        transaction_type: "sale",
        description: `מכירת רכב ${sale.car?.make || ""} ${sale.car?.model || ""} ${sale.car?.year || ""}`,
        car_make: sale.car?.make,
        car_model: sale.car?.model,
        car_year: sale.car?.year,
        customer_name: sale.customer?.full_name,
        amount: salePrice,
        vat_amount: vatAmount,
        total_with_vat: salePrice + vatAmount,
      });
    }

    // 2. Fetch Purchases
    const { data: purchases, error: purchasesError } = await supabaseClient
      .from("customer_vehicle_purchases")
      .select(`*, car:cars(make, model, year, supplier_name), customer:customers(full_name)`)
      .gte("purchase_date", startDate)
      .lte("purchase_date", endDate)
      .eq("cars.user_id", user.id);

    if (purchasesError) throw purchasesError;

    for (const purchase of purchases || []) {
      const purchasePrice = purchase.purchase_price || 0;
      const vatAmount = purchasePrice * VAT_RATE;

      transactions.push({
        date: purchase.purchase_date,
        transaction_type: "purchase",
        description: `רכישת רכב ${purchase.car?.make || ""} ${purchase.car?.model || ""}`,
        car_make: purchase.car?.make,
        car_model: purchase.car?.model,
        customer_name: purchase.customer?.full_name,
        supplier_name: purchase.car?.supplier_name,
        amount: purchasePrice,
        vat_amount: vatAmount,
        total_with_vat: purchasePrice + vatAmount,
      });
    }

    // 3. Fetch Expenses
    const { data: expenses, error: expensesError } = await supabaseClient
      .from("car_expenses")
      .select(`*, car:cars(make, model, year)`)
      .gte("expense_date", startDate)
      .lte("expense_date", endDate)
      .eq("user_id", user.id);

    if (expensesError) throw expensesError;

    for (const expense of expenses || []) {
      const amount = expense.amount || 0;
      const vatRate = expense.vat_rate || 18;
      const vatAmount = expense.include_vat ? (amount * vatRate) / 100 : 0;

      if (!expense.document_url && !expense.invoice_number) {
        validationErrors.push({
          type: "missing_expense_document",
          message: `הוצאה "${expense.description}" ללא מסמך מצורף או מספר חשבונית`,
          transactionId: expense.id,
        });
      }

      transactions.push({
        date: expense.expense_date,
        transaction_type: "expense",
        description: `${expense.expense_type} - ${expense.description}`,
        car_make: expense.car?.make,
        car_model: expense.car?.model,
        expense_type: expense.expense_type,
        amount: amount,
        vat_amount: vatAmount,
        total_with_vat: amount + vatAmount,
        invoice_number: expense.invoice_number,
        notes: expense.description,
      });

      // Try to download document PDF
      if (expense.document_url) {
        try {
          const { data: fileData } = await supabaseClient.storage
            .from("documents")
            .download(expense.document_url);
          if (fileData) {
            const arrayBuffer = await fileData.arrayBuffer();
            const fileName = `expense_${expense.expense_date}_${expense.id.slice(0, 8)}.pdf`;
            documentFiles[`documents/${fileName}`] = new Uint8Array(arrayBuffer);
          }
        } catch (e) {
          console.warn(`Could not download expense document: ${expense.document_url}`, e);
        }
      }
    }

    // 4. Fetch Tax Invoices (full data now)
    const { data: invoices, error: invoicesError } = await supabaseClient
      .from("tax_invoices")
      .select("*")
      .gte("date", startDate)
      .lte("date", endDate)
      .eq("user_id", user.id);

    if (invoicesError) throw invoicesError;

    for (const invoice of invoices || []) {
      transactions.push({
        date: invoice.date,
        transaction_type: "tax_invoice",
        description: `חשבונית מס ${invoice.invoice_number} - ${invoice.customer_name}`,
        customer_name: invoice.customer_name,
        amount: invoice.subtotal || 0,
        vat_amount: invoice.vat_amount || 0,
        total_with_vat: invoice.total_amount || 0,
        invoice_number: invoice.invoice_number,
        notes: invoice.notes,
      });
    }

    // 5. Fetch Payments/Receipts
    const { data: payments, error: paymentsError } = await supabaseClient
      .from("customer_payments")
      .select(`*, customer:customers(full_name)`)
      .gte("payment_date", startDate)
      .lte("payment_date", endDate)
      .eq("user_id", user.id);

    if (paymentsError) throw paymentsError;

    const paymentMethodLabels: Record<string, string> = {
      cash: "מזומן",
      credit: "אשראי",
      transfer: "העברה",
      check: "שיק",
    };

    for (const payment of payments || []) {
      transactions.push({
        date: payment.payment_date,
        transaction_type: "payment",
        description: `קבלה - ${payment.customer?.full_name || "לקוח"} - ${paymentMethodLabels[payment.payment_method] || payment.payment_method}`,
        customer_name: payment.customer?.full_name,
        amount: payment.amount || 0,
        vat_amount: 0,
        total_with_vat: payment.amount || 0,
        notes: payment.notes,
        payment_method: payment.payment_method,
      });
    }

    // 6. Fetch Customer Documents (sales agreements) - download PDFs
    const { data: customerDocs, error: customerDocsError } = await supabaseClient
      .from("customer_documents")
      .select(`*, customer:customers(full_name)`)
      .gte("date", startDate)
      .lte("date", endDate)
      .eq("user_id", user.id);

    if (customerDocsError) throw customerDocsError;

    for (const doc of customerDocs || []) {
      if (doc.file_path) {
        try {
          const { data: fileData } = await supabaseClient.storage
            .from("customer-documents")
            .download(doc.file_path);
          if (fileData) {
            const arrayBuffer = await fileData.arrayBuffer();
            const ext = doc.file_path.split(".").pop() || "pdf";
            const fileName = `${doc.type}_${doc.document_number}_${doc.id.slice(0, 8)}.${ext}`;
            documentFiles[`documents/${fileName}`] = new Uint8Array(arrayBuffer);
          }
        } catch (e) {
          console.warn(`Could not download customer document: ${doc.file_path}`, e);
        }
      }
    }

    // Sort transactions by date
    transactions.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    // Calculate summaries
    const totalSales = transactions
      .filter((t) => t.transaction_type === "sale")
      .reduce((sum, t) => sum + t.amount, 0);
    const totalPurchases = transactions
      .filter((t) => t.transaction_type === "purchase")
      .reduce((sum, t) => sum + t.amount, 0);
    const totalExpenses = transactions
      .filter((t) => t.transaction_type === "expense")
      .reduce((sum, t) => sum + t.amount, 0);
    const totalPayments = (payments || []).reduce((sum, p) => sum + (p.amount || 0), 0);
    const totalVAT = transactions.reduce((sum, t) => sum + t.vat_amount, 0);
    const grossProfit = totalSales - totalPurchases;
    const netProfit = grossProfit - totalExpenses;

    // 7. Inventory Snapshot
    const { data: inventory, error: inventoryError } = await supabaseClient
      .from("cars")
      .select("id, make, model, year, chassis_number, license_number, purchase_cost, purchase_date, status, kilometers")
      .eq("user_id", user.id)
      .eq("status", "available");

    if (inventoryError) throw inventoryError;

    const inventoryValue = (inventory || []).reduce((sum, car) => sum + (car.purchase_cost || 0), 0);

    // 8. Customer Balances
    const { data: allCustomers, error: customersError } = await supabaseClient
      .from("customers")
      .select("id, full_name, id_number, phone")
      .eq("user_id", user.id);

    if (customersError) throw customersError;

    const balances: Array<{ customer_name: string; id_number: string; phone: string; total_purchases: number; total_paid: number; outstanding: number }> = [];

    for (const customer of allCustomers || []) {
      const { data: custPurchases } = await supabaseClient
        .from("customer_vehicle_purchases")
        .select("purchase_price")
        .eq("customer_id", customer.id);

      const { data: custPayments } = await supabaseClient
        .from("customer_payments")
        .select("amount")
        .eq("customer_id", customer.id);

      const totalPurch = (custPurchases || []).reduce((s, p) => s + (p.purchase_price || 0), 0);
      const totalPaid = (custPayments || []).reduce((s, p) => s + (p.amount || 0), 0);
      const outstanding = totalPurch - totalPaid;

      if (totalPurch > 0 || totalPaid > 0) {
        balances.push({
          customer_name: customer.full_name,
          id_number: customer.id_number || "",
          phone: customer.phone || "",
          total_purchases: totalPurch,
          total_paid: totalPaid,
          outstanding,
        });

        if (outstanding > 0) {
          validationErrors.push({
            type: "outstanding_balance",
            message: `ללקוח ${customer.full_name} יתרת חוב של ₪${outstanding.toLocaleString()}`,
            details: `סה"כ רכישות: ₪${totalPurch.toLocaleString()}, סה"כ שולם: ₪${totalPaid.toLocaleString()}`,
          });
        }
      }
    }

    const totalOutstanding = balances.reduce((s, b) => s + Math.max(0, b.outstanding), 0);

    const summary = {
      totalSales,
      totalPurchases,
      totalExpenses,
      totalPayments,
      grossProfit,
      totalVAT,
      netProfit,
      transactionCount: transactions.length,
      inventoryCount: (inventory || []).length,
      inventoryValue,
      totalOutstanding,
    };

    // === Generate CSV files ===
    const encoder = new TextEncoder();
    const BOM = "\uFEFF"; // UTF-8 BOM for Excel Hebrew support

    // transactions.csv
    const txnHeader = [
      "תאריך", "סוג עסקה", "תיאור", "יצרן רכב", "דגם רכב", "שנה",
      "לקוח/ספק", "סכום", 'מע"מ', 'סה"כ כולל מע"מ', "מס' חשבונית", "אמצעי תשלום", "הערות",
    ].join(",");

    const typeMap: Record<string, string> = {
      sale: "מכירה",
      purchase: "רכישה",
      expense: "הוצאה",
      tax_invoice: "חשבונית מס",
      payment: "קבלה",
    };

    const txnRows = transactions.map((t) =>
      [
        t.date,
        typeMap[t.transaction_type] || t.transaction_type,
        `"${t.description}"`,
        t.car_make || "",
        t.car_model || "",
        t.car_year || "",
        t.customer_name || t.supplier_name || "",
        t.amount.toFixed(2),
        t.vat_amount.toFixed(2),
        t.total_with_vat.toFixed(2),
        t.invoice_number || "",
        t.payment_method ? (paymentMethodLabels[t.payment_method] || t.payment_method) : "",
        `"${t.notes || ""}"`,
      ].join(",")
    );

    const transactionsCsv = BOM + [txnHeader, ...txnRows].join("\n");

    // inventory.csv
    const invHeader = ["מס' שלדה", "מס' רישוי", "יצרן", "דגם", "שנה", "ק\"מ", "עלות רכישה", "תאריך רכישה"].join(",");
    const invRows = (inventory || []).map((car) =>
      [
        car.chassis_number || "",
        car.license_number || "",
        car.make,
        car.model,
        car.year,
        car.kilometers || "",
        car.purchase_cost ? car.purchase_cost.toFixed(2) : "",
        car.purchase_date || "",
      ].join(",")
    );
    const inventoryCsv = BOM + [invHeader, ...invRows, "", `סה"כ ערך מלאי,,,,,,,${inventoryValue.toFixed(2)}`].join("\n");

    // balances.csv
    const balHeader = ["שם לקוח", "ת.ז./ח.פ.", "טלפון", "סה\"כ רכישות", "סה\"כ שולם", "יתרת חוב"].join(",");
    const balRows = balances.map((b) =>
      [
        `"${b.customer_name}"`,
        b.id_number,
        b.phone,
        b.total_purchases.toFixed(2),
        b.total_paid.toFixed(2),
        b.outstanding.toFixed(2),
      ].join(",")
    );
    const balancesCsv = BOM + [balHeader, ...balRows, "", `סה"כ יתרות חוב,,,,,${totalOutstanding.toFixed(2)}`].join("\n");

    // summary.csv
    const summaryCsv = BOM + [
      "סעיף,סכום",
      `סה"כ מכירות,${totalSales.toFixed(2)}`,
      `סה"כ רכישות,${totalPurchases.toFixed(2)}`,
      `סה"כ הוצאות,${totalExpenses.toFixed(2)}`,
      `סה"כ קבלות,${totalPayments.toFixed(2)}`,
      `רווח גולמי,${grossProfit.toFixed(2)}`,
      `רווח נקי,${netProfit.toFixed(2)}`,
      `סה"כ מע"מ,${totalVAT.toFixed(2)}`,
      `מספר עסקאות,${transactions.length}`,
      `ערך מלאי,${inventoryValue.toFixed(2)}`,
      `מספר רכבים במלאי,${(inventory || []).length}`,
      `סה"כ יתרות חוב לקוחות,${totalOutstanding.toFixed(2)}`,
    ].join("\n");

    // Build ZIP
    const files: Record<string, Uint8Array> = {
      "transactions.csv": encoder.encode(transactionsCsv),
      "inventory.csv": encoder.encode(inventoryCsv),
      "balances.csv": encoder.encode(balancesCsv),
      "summary.csv": encoder.encode(summaryCsv),
      ...documentFiles,
    };

    const zipped = zipSync(files);

    const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
    const filename = `accountant-report-${timestamp}.zip`;

    const { error: uploadError } = await supabaseClient.storage
      .from("documents")
      .upload(`reports/${user.id}/${filename}`, zipped, {
        contentType: "application/zip",
        upsert: true,
      });

    if (uploadError) throw uploadError;

    const {
      data: { publicUrl },
    } = supabaseClient.storage.from("documents").getPublicUrl(`reports/${user.id}/${filename}`);

    console.log(`✅ Report generated: ${publicUrl} | ${transactions.length} transactions, ${(inventory || []).length} inventory, ${balances.length} customers`);

    return new Response(
      JSON.stringify({
        success: true,
        reportUrl: publicUrl,
        summary,
        validationErrors,
        generatedAt: new Date().toISOString(),
        period: { start: startDate, end: endDate },
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error: any) {
    console.error("❌ Error generating report:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
