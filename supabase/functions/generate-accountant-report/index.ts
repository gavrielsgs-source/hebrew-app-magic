import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";
import { zipSync, strToU8 } from "https://deno.land/x/zipjs@v2.7.29/index.js";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

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

    // Get authenticated user
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
    const documentIds: string[] = [];

    // 1. Fetch Sales (customer_vehicle_sales + cars + customers)
    const { data: sales, error: salesError } = await supabaseClient
      .from("customer_vehicle_sales")
      .select(`
        *,
        car:cars(make, model, year, purchase_cost),
        customer:customers(full_name)
      `)
      .gte("sale_date", startDate)
      .lte("sale_date", endDate)
      .eq("cars.user_id", user.id);

    if (salesError) throw salesError;

    for (const sale of sales || []) {
      const salePrice = sale.sale_price || 0;
      const purchaseCost = sale.car?.purchase_cost || 0;
      const vatAmount = salePrice * 0.17;

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
        description: `מכירת רכב ${sale.car?.make} ${sale.car?.model} ${sale.car?.year}`,
        car_make: sale.car?.make,
        car_model: sale.car?.model,
        car_year: sale.car?.year,
        customer_name: sale.customer?.full_name,
        amount: salePrice,
        vat_amount: vatAmount,
        total_with_vat: salePrice + vatAmount,
      });
    }

    // 2. Fetch Purchases (customer_vehicle_purchases + cars)
    const { data: purchases, error: purchasesError } = await supabaseClient
      .from("customer_vehicle_purchases")
      .select(`
        *,
        car:cars(make, model, year, supplier_name),
        customer:customers(full_name)
      `)
      .gte("purchase_date", startDate)
      .lte("purchase_date", endDate)
      .eq("cars.user_id", user.id);

    if (purchasesError) throw purchasesError;

    for (const purchase of purchases || []) {
      const purchasePrice = purchase.purchase_price || 0;
      const vatAmount = purchasePrice * 0.17;

      transactions.push({
        date: purchase.purchase_date,
        transaction_type: "purchase",
        description: `רכישת רכב ${purchase.car?.make} ${purchase.car?.model}`,
        car_make: purchase.car?.make,
        car_model: purchase.car?.model,
        customer_name: purchase.customer?.full_name,
        supplier_name: purchase.car?.supplier_name,
        amount: purchasePrice,
        vat_amount: vatAmount,
        total_with_vat: purchasePrice + vatAmount,
      });
    }

    // 3. Fetch Expenses (car_expenses + cars)
    const { data: expenses, error: expensesError } = await supabaseClient
      .from("car_expenses")
      .select(`
        *,
        car:cars(make, model, year)
      `)
      .gte("expense_date", startDate)
      .lte("expense_date", endDate)
      .eq("user_id", user.id);

    if (expensesError) throw expensesError;

    for (const expense of expenses || []) {
      const amount = expense.amount || 0;
      const vatRate = expense.vat_rate || 17;
      const vatAmount = expense.include_vat ? (amount * vatRate) / 100 : 0;

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

      // Collect document for ZIP if exists
      if (expense.document_url) {
        documentIds.push(expense.id);
      }
    }

    // 4. Fetch Tax Invoices
    const { data: invoices, error: invoicesError } = await supabaseClient
      .from("tax_invoices")
      .select("*")
      .gte("date", startDate)
      .lte("date", endDate)
      .eq("user_id", user.id);

    if (invoicesError) throw invoicesError;

    // Add invoice document IDs for collection
    for (const invoice of invoices || []) {
      documentIds.push(invoice.id);
    }

    // Sort transactions by date
    transactions.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    // Calculate summary
    const totalSales = transactions
      .filter((t) => t.transaction_type === "sale")
      .reduce((sum, t) => sum + t.amount, 0);

    const totalPurchases = transactions
      .filter((t) => t.transaction_type === "purchase")
      .reduce((sum, t) => sum + t.amount, 0);

    const totalExpenses = transactions
      .filter((t) => t.transaction_type === "expense")
      .reduce((sum, t) => sum + t.amount, 0);

    const totalVAT = transactions.reduce((sum, t) => sum + t.vat_amount, 0);

    const grossProfit = totalSales - totalPurchases;
    const netProfit = grossProfit - totalExpenses;

    const summary = {
      totalSales,
      totalPurchases,
      totalExpenses,
      grossProfit,
      totalVAT,
      netProfit,
      transactionCount: transactions.length,
    };

    // Generate CSV
    const csvHeader = [
      "תאריך",
      "סוג עסקה",
      "תיאור",
      "יצרן רכב",
      "דגם רכב",
      "שנה",
      "לקוח/ספק",
      "סכום",
      "מע\"מ",
      "סה\"כ כולל מע\"מ",
      "מס' חשבונית",
      "הערות",
    ].join(",");

    const csvRows = transactions.map((t) => {
      const typeMap: Record<string, string> = {
        sale: "מכירה",
        purchase: "רכישה",
        expense: "הוצאה",
      };
      return [
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
        `"${t.notes || ""}"`,
      ].join(",");
    });

    const csvSummary = [
      "",
      "",
      "סיכום",
      "",
      "",
      "",
      "",
      "",
      "",
      "",
      "",
      "",
      "",
      "סה\"כ מכירות",
      totalSales.toFixed(2),
      "",
      "סה\"כ רכישות",
      totalPurchases.toFixed(2),
      "",
      "סה\"כ הוצאות",
      totalExpenses.toFixed(2),
      "",
      "רווח גולמי",
      grossProfit.toFixed(2),
      "",
      "רווח נקי",
      netProfit.toFixed(2),
      "",
      "סה\"כ מע\"מ",
      totalVAT.toFixed(2),
    ];

    const csv = [csvHeader, ...csvRows, ...csvSummary].join("\n");

    // Generate timestamp for filename
    const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
    const filename = `accountant-report-${timestamp}.zip`;

    // Create ZIP with CSV
    const files: Record<string, Uint8Array> = {
      "report.csv": strToU8(csv),
    };

    // Fetch document PDFs from storage (if needed in future)
    // For now, just create ZIP with CSV

    const zipped = zipSync(files);

    // Upload to storage
    const { data: uploadData, error: uploadError } = await supabaseClient.storage
      .from("documents")
      .upload(`reports/${user.id}/${filename}`, zipped, {
        contentType: "application/zip",
        upsert: true,
      });

    if (uploadError) throw uploadError;

    // Get public URL
    const {
      data: { publicUrl },
    } = supabaseClient.storage.from("documents").getPublicUrl(`reports/${user.id}/${filename}`);

    console.log(`✅ Report generated successfully: ${publicUrl}`);

    return new Response(
      JSON.stringify({
        success: true,
        reportUrl: publicUrl,
        summary,
        validationErrors,
        generatedAt: new Date().toISOString(),
        period: {
          start: startDate,
          end: endDate,
        },
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error: any) {
    console.error("❌ Error generating report:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
