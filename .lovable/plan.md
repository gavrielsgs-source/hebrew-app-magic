

## Problem Analysis

The analytics system is **not synced with actual sales data**. Here's why:

1. **Sales hook** queries `cars` table where `status = "sold"` and uses `car.price` for revenue -- but actual sales are recorded in `customer_vehicle_sales` with real `sale_price` and `sale_date`
2. **Conversion hook** counts leads with `status = "closed"` as sales -- but a closed lead doesn't necessarily mean a sale happened
3. **Revenue calculations** use the car's listing price, not the actual sale price from transactions
4. **No connection** to `customer_vehicle_purchases` (purchases), `customer_documents` (invoices/receipts), or `car_expenses` (expenses)

## Plan

### 1. Fix `use-sales-analytics.ts` (analytics folder)
- Query `customer_vehicle_sales` joined with `cars` instead of just filtering cars by status
- Use `sale_price` and `sale_date` for accurate revenue and timeline
- Also include purchase data from `customer_vehicle_purchases` for profit calculation
- Group by month using `sale_date` instead of `car.updated_at`

### 2. Fix `use-conversion-analytics.ts`
- Count actual sales from `customer_vehicle_sales` instead of leads with `status = "closed"`
- Calculate conversion rate as: (sales count / leads count) * 100
- Match sales to lead sources by joining through `car_id`

### 3. Fix `use-cars-analytics.ts`
- Include `purchase_cost` data for profit metrics
- Add total inventory value calculation

### 4. Update `use-combined-analytics.ts`
- Add financial summary: total revenue (from sales), total cost (purchases + expenses), gross profit
- Include document-based data from `customer_documents` (invoice amounts)
- Ensure `salesOverTime` uses real sale dates and prices

### 5. Update analytics UI components
- Display revenue based on actual `sale_price` from transactions
- Show profit margins (sale_price - purchase_cost - expenses)
- Predictions based on real transaction trends

### Data Sources Mapping
```text
Current (broken):          Fixed (correct):
cars.status="sold"    -->  customer_vehicle_sales (actual sales)
car.price             -->  sale_price (actual amount)
car.updated_at        -->  sale_date (actual date)
lead.status="closed"  -->  customer_vehicle_sales count
(missing)             -->  customer_vehicle_purchases (purchases)
(missing)             -->  car_expenses (expenses)
(missing)             -->  customer_documents (invoices)
```

This will ensure analytics reflect the real business data that flows through the document production and sales processes.

