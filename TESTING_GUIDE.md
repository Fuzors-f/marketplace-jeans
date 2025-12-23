# QUICK TESTING GUIDE

## Pre-Testing Checklist

### 1. Database Setup
```bash
# Apply migrations
cd backend
npm run migrate

# Seed test data (or re-run for safety)
npm run seed
```

Expected Result: 3 warehouses + 160+ variants created with min_stock = 5

### 2. Backend Verification
```bash
# Start server
npm run dev
# Expected: Server running on http://localhost:5000
```

### 3. API Endpoint Testing (Postman)

#### Get Inventory with All Variants
```
GET http://localhost:5000/api/inventory/variants?page=1&limit=10
```
Response should include:
- variant_id, product_name, size_name, warehouse_name
- stock_quantity, min_stock, stock_status, cost_price
- pagination: total, page, limit, pages

#### Update Variant Stock
```
PUT http://localhost:5000/api/inventory/variants/1
Content-Type: application/json

{
  "stock_quantity": 100,
  "min_stock": 15,
  "cost_price": 150000
}
```
Expected: 200 OK with success message

#### Search and Filter
```
GET http://localhost:5000/api/inventory/variants?
  search=JEAN&
  warehouse_id=1&
  page=1&
  limit=10
```

---

## Frontend Testing

### 1. Inventory Page (/admin/inventory)

**Expected Display:**
- Product Name (with SKU)
- Size
- Warehouse
- Stock Quantity with Status Indicator
  - 🟢 Green: Safe
  - 🟡 Orange: Below Minimum
  - 🔴 Red: Out of Stock
- Min Stock value
- Cost Price
- Inventory Value (Stock × Cost)

**Test Inline Editing:**
1. Click "Edit" button on any row
2. Modify: Stock Quantity, Min Stock, Cost Price
3. Click ✓ to save
4. Verify data updated in table

**Test Filtering:**
1. Use filters: Warehouse, Category
2. Verify table shows only matching items
3. Use search box: search for product name or SKU
4. Verify pagination adjusts correctly

**Test Pagination:**
1. Change items per page (25, 50, 100)
2. Navigate between pages
3. Verify data loads correctly

### 2. Products Page (/admin/products)

**Expected Display - Product List:**
- Product name with category
- Fitting
- Price (with cost)
- Variant count (not total stock)
- Status (Active/Inactive)
- Actions: Manage Variants, Edit, Delete

**Test Variant Management Modal:**
1. Click "Varian" button on any product
2. Modal opens showing variant form and list

**Test Add Variant Form:**
Required Fields:
- Size (dropdown)
- Warehouse (dropdown)
- SKU Variant (text)

Optional Fields:
- Additional Price (number)
- Stock Quantity (number)
- Min Stock (number, default 5)
- Cost Price (number)

Test Cases:
1. ✅ Add variant without Size → Error "Size dan Warehouse harus dipilih"
2. ✅ Add variant without Warehouse → Error "Size dan Warehouse harus dipilih"
3. ✅ Add complete variant → Success message, variant appears in list

**Test Variant Display:**
Columns should show:
- Size
- Warehouse
- SKU
- Additional Price
- Stock (Quantity)
- Min Stock
- Cost Price
- Action: Delete button

### 3. Stock Status Calculation

**Verify Status Logic:**
```
IF stock_quantity = 0 → "Out of Stock" (🔴)
ELSE IF stock_quantity ≤ min_stock → "Below Minimum" (🟡)
ELSE → "Safe" (🟢)
```

Test with sample data:
- Min Stock = 10, Current = 5 → "Below Minimum"
- Min Stock = 10, Current = 15 → "Safe"
- Min Stock = 10, Current = 0 → "Out of Stock"

---

## Error Handling Tests

### 1. API Errors
Test with invalid variant_id:
```
PUT http://localhost:5000/api/inventory/variants/99999
```
Expected: 404 Not Found with message

### 2. Validation Errors
Test incomplete payload:
```
PUT http://localhost:5000/api/inventory/variants/1
{}
```
Expected: 400 Bad Request - "Please provide stock_quantity, cost_price, or min_stock"

### 3. Frontend Errors
- Test with empty warehouse list (should show empty option)
- Test rapid edits (should queue properly)
- Test search with special characters (should handle safely)

---

## Performance Tests

### 1. Pagination Load Time
- List 10 items: < 500ms
- List 50 items: < 1000ms
- List 100 items: < 1500ms

### 2. Search Performance
- Search with 3 characters: < 500ms
- Search with large result set: < 1000ms

### 3. Database Query Performance
- Inventory list with joins: < 200ms
- Variant list with filtering: < 300ms

---

## Data Validation Tests

### 1. Database Constraints
- ✅ Unique constraint on (product_id, size_id, warehouse_id)
- ✅ Foreign key enforces valid warehouse_id
- ✅ min_stock cannot be negative
- ✅ stock_quantity cannot be negative

### 2. API Validation
- ✅ warehouse_id required for new variant
- ✅ min_stock defaults to 5 if not provided
- ✅ cost_price accepts decimals
- ✅ stock_quantity must be integer

### 3. Frontend Validation
- ✅ Size and Warehouse dropdowns show correct options
- ✅ Cost Price accepts decimal input
- ✅ Min Stock accepts positive integers only

---

## Success Criteria

All tests pass when:
- ✅ Inventory page displays all variant data correctly
- ✅ Stock status indicators show correct color based on min_stock
- ✅ Inline editing updates data without page reload
- ✅ Pagination navigates between pages correctly
- ✅ Search filters work by product name and SKU
- ✅ Products page shows variant count correctly
- ✅ Variant form includes warehouse dropdown
- ✅ Min stock and cost price display/edit correctly
- ✅ No console errors
- ✅ API responses match expected format
- ✅ Database constraints enforced

---

## Troubleshooting

### Issue: Variants not showing in Inventory page
**Solution:**
1. Verify migration ran: `DESCRIBE product_variants` in MySQL
2. Verify seeder ran: Check if warehouses table has data
3. Check browser console for errors
4. Verify API endpoint returns data: Test with Postman

### Issue: Warehouse dropdown shows no options
**Solution:**
1. Verify warehouses created: `SELECT * FROM warehouses`
2. Check network tab: Verify GET /api/warehouses returns data
3. Clear browser cache and reload

### Issue: Stock status not updating
**Solution:**
1. Verify min_stock field exists in database
2. Refresh page to reload data from API
3. Check API response includes min_stock and stock_status

### Issue: Edit form shows old values
**Solution:**
1. Click Cancel and re-open edit
2. Check browser DevTools → Network → verify PUT request sent
3. Verify API response contains updated values

---

**Test Completion Date:** _______________
**Tester Name:** _______________
**All Tests Passed:** ☐ Yes  ☐ No

Notes:
_________________________________________________________________
_________________________________________________________________
