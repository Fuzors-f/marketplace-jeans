# Warehouse Selection for Product Variants - Feature Complete

## Overview
Completed implementation allowing users to select warehouses when adding product variants. Stock entries are automatically created in the inventory for each selected warehouse.

## Features Implemented

### 1. Frontend (Products.js)
✅ **Warehouse Selection UI**
- Warehouse selection checkboxes after size selection
- Grid layout: 1 column (mobile), 2 columns (tablet), 3 columns (desktop)
- Shows warehouse name and location
- Visual feedback when warehouses are selected
- Optional selection (can create variants without selecting warehouses)
- Helper text: "Pilih gudang tempat varian ini akan di-track untuk stok"

✅ **State Management**
- `warehouses` - List of available warehouses
- `selectedWarehouses` - Array of selected warehouse IDs
- `handleWarehouseToggle(warehouseId)` - Toggle warehouse selection
- `fetchWarehouses()` - Load warehouses on component mount

✅ **Automatic Stock Creation**
- When creating variants, for each selected size:
  - Create product variant via `/api/products/:productId/variants`
  - For each selected warehouse:
    - POST to `/api/stock/variant` with:
      - `product_variant_id` - ID of created variant
      - `warehouse_id` - Selected warehouse ID
      - `quantity` - 0 (initial)
      - `min_stock` - 5 (default)
      - `cost_price` - From master_cost_price field

✅ **Form Reset**
- `selectedWarehouses` cleared when form resets
- All warehouse selections cleared after successful product creation

### 2. Backend (stockController.js & stockRoutes.js)

✅ **New Endpoint: POST /api/stock/variant**
- Route: `router.post('/variant', authorize('admin', 'admin_stok'), stockController.createVariantStock);`
- Authorization: admin or admin_stok role required
- 
✅ **Controller Function: createVariantStock()**
Input:
```json
{
  "product_variant_id": number,
  "warehouse_id": number,
  "quantity": number (default: 0),
  "min_stock": number (default: 5),
  "cost_price": number (default: 0)
}
```

Processing:
1. Validates product_variant_id and warehouse_id are provided
2. Queries product_variants table to get product_id, size_id, and fitting_id
3. Checks for duplicate stock entry (same warehouse + product + size)
4. Creates stock record in stocks table with:
   - warehouse_id
   - product_id
   - fitting_id (nullable)
   - size_id
   - quantity
   - avg_cost_price
   - last_cost_price
   - min_stock
5. If quantity > 0, creates stock_movements entry
6. Returns created stock ID

Error Handling:
- 400: Missing required fields or duplicate stock entry
- 404: Product variant not found
- 500: Database error

### 3. Inventory Integration
✅ **Automatic Inventory Population**
- Stock entries created via `/stock/variant` automatically appear in Inventory menu
- Entries accessible via GET `/api/inventory/stocks` endpoint
- Can be filtered by warehouse, product, size, etc.
- Supports inline editing of min_stock and cost_price
- Stock movements are tracked

## Workflow

### User Flow
1. Navigate to Products → Add Product
2. Fill product details (name, fitting, price, etc.)
3. Select sizes (e.g., S, M, L)
4. **Select warehouses** (e.g., Jakarta Warehouse, Surabaya Warehouse)
5. Click Save Product
6. System automatically creates:
   - 1 product record
   - 3 product_variants (S, M, L)
   - 6 stock entries (3 sizes × 2 warehouses)
7. Navigate to Inventory menu to see stock entries

### Stock Entry Structure
For a product with 3 sizes and 2 selected warehouses:
```
Stock Entry 1: Product | Size: S | Warehouse: Jakarta | Qty: 0
Stock Entry 2: Product | Size: M | Warehouse: Jakarta | Qty: 0
Stock Entry 3: Product | Size: L | Warehouse: Jakarta | Qty: 0
Stock Entry 4: Product | Size: S | Warehouse: Surabaya | Qty: 0
Stock Entry 5: Product | Size: M | Warehouse: Surabaya | Qty: 0
Stock Entry 6: Product | Size: L | Warehouse: Surabaya | Qty: 0
```

## Technical Details

### Database Schema
Uses existing `stocks` table:
```sql
CREATE TABLE stocks (
  id INT PRIMARY KEY AUTO_INCREMENT,
  warehouse_id INT NOT NULL,
  product_id INT NOT NULL,
  fitting_id INT,
  size_id INT NOT NULL,
  quantity INT DEFAULT 0,
  min_stock INT DEFAULT 5,
  avg_cost_price DECIMAL(10,2) DEFAULT 0,
  last_cost_price DECIMAL(10,2) DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY unique_stock (warehouse_id, product_id, size_id),
  FOREIGN KEY (warehouse_id) REFERENCES warehouses(id),
  FOREIGN KEY (product_id) REFERENCES products(id),
  FOREIGN KEY (fitting_id) REFERENCES fittings(id),
  FOREIGN KEY (size_id) REFERENCES sizes(id)
);
```

### Stock Movements Table
Tracks all stock changes:
```sql
CREATE TABLE stock_movements (
  id INT PRIMARY KEY AUTO_INCREMENT,
  warehouse_id INT NOT NULL,
  product_id INT NOT NULL,
  fitting_id INT,
  size_id INT NOT NULL,
  movement_type VARCHAR(50), -- 'in', 'out', 'adjustment'
  quantity_before INT,
  quantity_change INT,
  quantity_after INT,
  cost_price DECIMAL(10,2),
  notes TEXT,
  created_by INT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (warehouse_id) REFERENCES warehouses(id),
  FOREIGN KEY (product_id) REFERENCES products(id),
  FOREIGN KEY (created_by) REFERENCES users(id)
);
```

## Files Modified

### Frontend
- **src/pages/admin/Products.js**
  - Added `warehouses` state
  - Added `selectedWarehouses` state
  - Added `fetchWarehouses()` function
  - Added `handleWarehouseToggle()` function
  - Updated `useEffect` to fetch warehouses
  - Updated `handleSubmit()` to create stock entries
  - Updated `resetForm()` to clear selectedWarehouses
  - Added warehouse selection UI component

### Backend
- **src/controllers/stockController.js**
  - Added `createVariantStock()` function
  
- **src/routes/stockRoutes.js**
  - Added POST `/variant` route

## Testing Checklist

- [ ] Navigate to Products page
- [ ] Click "Add Product"
- [ ] Fill product details (name, fitting, price)
- [ ] Select multiple sizes
- [ ] Select multiple warehouses
- [ ] Click Save
- [ ] Verify product created successfully
- [ ] Navigate to Inventory menu
- [ ] Verify stock entries exist for all size/warehouse combinations
- [ ] Verify quantities are 0 and min_stock is 5
- [ ] Verify cost_price matches master_cost_price
- [ ] Try editing stock in inventory (inline edit min_stock/cost_price)
- [ ] Check stock movements for "Stok awal dari pembuatan varian" entries

## API Endpoints Used

### Frontend Calls
```javascript
POST /api/products - Create product
POST /api/products/:productId/variants - Create variant for each size
POST /api/stock/variant - Create stock entry for each warehouse
GET /api/warehouses - Fetch available warehouses
GET /api/sizes - Fetch available sizes
```

### Backend Flow
```
POST /api/stock/variant
├── Validate inputs
├── Get variant details (product_id, size_id, fitting_id)
├── Check for duplicate stock
├── INSERT into stocks table
├── INSERT into stock_movements (if qty > 0)
└── Return stock ID
```

## Optional Features (Future)

- Allow selecting cost_price per warehouse during variant creation
- Batch create warehouses if not all selected
- Clone stock settings from existing variants
- Import stock configuration from templates
- Warehouse-specific initial quantities instead of always 0

## Error Handling

The feature gracefully handles:
- Missing warehouse data (shows "Tidak ada gudang tersedia")
- Failed stock creation (logs error but doesn't fail product creation)
- Duplicate stock attempts (returns 400 error)
- Missing product variant (returns 404 error)

## Notes

- Warehouse selection is optional; products can be created without selecting warehouses
- Initial quantity for new stocks is always 0 (can be adjusted in Inventory)
- Min stock defaults to 5 (can be edited per warehouse in Inventory)
- Cost price defaults to master_cost_price from product form
- All operations require admin or admin_stok role
- Stock movements are tracked for audit purposes
