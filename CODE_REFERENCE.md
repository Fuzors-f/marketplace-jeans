# Code Reference - Warehouse Selection Feature

## Frontend: Products.js Key Changes

### 1. State Initialization
```javascript
// Warehouse management
const [warehouses, setWarehouses] = useState([]);
const [selectedWarehouses, setSelectedWarehouses] = useState([]);
```

### 2. Fetch Warehouses Function
```javascript
const fetchWarehouses = async () => {
  try {
    const response = await apiClient.get('/warehouses');
    setWarehouses(response.data.data || []);
  } catch (err) {
    console.error('Error fetching warehouses:', err);
  }
};
```

### 3. Toggle Handler
```javascript
const handleWarehouseToggle = (warehouseId) => {
  setSelectedWarehouses(prev => {
    if (prev.includes(warehouseId)) {
      return prev.filter(id => id !== warehouseId);
    } else {
      return [...prev, warehouseId];
    }
  });
};
```

### 4. Initialize Warehouses in useEffect
```javascript
useEffect(() => {
  fetchProducts();
  fetchCategories();
  fetchFittings();
  fetchSizes();
  fetchWarehouses(); // ← Added this
}, [currentPage]);
```

### 5. Stock Creation in handleSubmit
```javascript
// Create product variants
for (const sizeId of selectedSizes) {
  try {
    const variantRes = await apiClient.post(`/products/${newProductId}/variants`, {
      size_id: sizeId,
      sku_variant: `${formData.sku}-${sizeVariantCode}`,
      additional_price: 0,
      stock_quantity: 0
    });
    
    // Create stock entries for selected warehouses
    if (selectedWarehouses.length > 0) {
      const variantId = variantRes.data.data?.id || variantRes.data.data;
      for (const warehouseId of selectedWarehouses) {
        try {
          await apiClient.post('/stock/variant', {
            product_variant_id: variantId,
            warehouse_id: warehouseId,
            quantity: 0,
            min_stock: 5,
            cost_price: formData.master_cost_price || 0
          });
        } catch (stockErr) {
          console.error(`Error creating stock for warehouse ${warehouseId}:`, stockErr);
        }
      }
    }
  } catch (varErr) {
    console.error('Error creating variants:', varErr);
  }
}
```

### 6. Clear Selection in resetForm
```javascript
const resetForm = () => {
  setFormData({
    name: '',
    slug: '',
    category_id: '',
    fitting_id: '',
    description: '',
    short_description: '',
    base_price: '',
    master_cost_price: '',
    sku: '',
    weight: '',
    is_active: true,
    is_featured: false
  });
  setSelectedImages([]);
  setImagePreviews([]);
  setSelectedSizes([]);
  setSelectedWarehouses([]); // ← Added this
  setShowForm(false);
};
```

### 7. Warehouse Selection UI
```jsx
{/* Warehouse Selection */}
<div>
  <label className="block text-sm font-semibold mb-3">
    Pilih Gudang untuk Stok (Optional)
  </label>
  <p className="text-xs text-gray-600 mb-3">
    Pilih gudang tempat varian ini akan di-track untuk stok
  </p>
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
    {warehouses && warehouses.length > 0 ? (
      warehouses.map(warehouse => (
        <label 
          key={warehouse.id} 
          className="flex items-center cursor-pointer p-3 border rounded hover:bg-gray-50"
        >
          <input
            type="checkbox"
            checked={selectedWarehouses.includes(warehouse.id)}
            onChange={() => handleWarehouseToggle(warehouse.id)}
            className="mr-2 w-4 h-4 rounded"
          />
          <div>
            <span className="text-sm font-medium">{warehouse.name}</span>
            <p className="text-xs text-gray-500">
              {warehouse.location || 'Lokasi tidak tersedia'}
            </p>
          </div>
        </label>
      ))
    ) : (
      <p className="text-sm text-gray-500">Tidak ada gudang tersedia</p>
    )}
  </div>
  {selectedWarehouses.length > 0 && (
    <div className="mt-3 p-3 bg-green-50 rounded border border-green-200">
      <p className="text-sm text-green-800">
        ✓ Terpilih: <strong>{selectedWarehouses.length} gudang</strong> 
        akan dibuat stoknya
      </p>
    </div>
  )}
</div>
```

## Backend: Stock Controller

### Complete createVariantStock Function
```javascript
// Create initial stock for new product variant
exports.createVariantStock = async (req, res) => {
  const connection = await db.getConnection();
  
  try {
    await connection.beginTransaction();
    
    const { product_variant_id, warehouse_id, quantity = 0, min_stock = 5, cost_price = 0 } = req.body;
    const created_by = req.user.id;
    
    if (!product_variant_id || !warehouse_id) {
      return res.status(400).json({ 
        success: false, 
        message: 'Product variant ID dan warehouse ID harus diisi' 
      });
    }
    
    // Get variant details to get product, size, and fitting info
    const variantSql = `
      SELECT pv.product_id, pv.size_id, p.fitting_id 
      FROM product_variants pv
      JOIN products p ON pv.product_id = p.id
      WHERE pv.id = ?
    `;
    const [variantData] = await connection.query(variantSql, [product_variant_id]);
    
    if (variantData.length === 0) {
      await connection.rollback();
      return res.status(404).json({ 
        success: false, 
        message: 'Varian produk tidak ditemukan' 
      });
    }
    
    const { product_id, size_id, fitting_id } = variantData[0];
    
    // Check if stock already exists for this combination
    const [existingStock] = await connection.query(
      'SELECT id FROM stocks WHERE warehouse_id = ? AND product_id = ? AND size_id = ?',
      [warehouse_id, product_id, size_id]
    );
    
    if (existingStock.length > 0) {
      await connection.rollback();
      return res.status(400).json({ 
        success: false, 
        message: 'Stok untuk kombinasi gudang dan varian ini sudah ada' 
      });
    }
    
    // Insert initial stock
    const stockSql = `
      INSERT INTO stocks (warehouse_id, product_id, fitting_id, size_id, quantity, avg_cost_price, last_cost_price, min_stock)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `;
    const [stockResult] = await connection.query(stockSql, [
      warehouse_id, product_id, fitting_id || null, size_id, 
      quantity, cost_price, cost_price, min_stock
    ]);
    
    // Record stock movement if quantity > 0
    if (quantity > 0) {
      const movementSql = `
        INSERT INTO stock_movements (warehouse_id, product_id, fitting_id, size_id, movement_type,
          quantity_before, quantity_change, quantity_after, cost_price, notes, created_by)
        VALUES (?, ?, ?, ?, 'in', 0, ?, ?, ?, ?, ?)
      `;
      await connection.query(movementSql, [
        warehouse_id, product_id, fitting_id || null, size_id,
        quantity, quantity, cost_price, 'Stok awal dari pembuatan varian', created_by
      ]);
    }
    
    await connection.commit();
    
    res.status(201).json({
      success: true,
      message: 'Stok varian berhasil dibuat',
      data: { id: stockResult.insertId }
    });
  } catch (error) {
    await connection.rollback();
    console.error('Create variant stock error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Gagal membuat stok varian', 
      error: error.message 
    });
  } finally {
    connection.release();
  }
};
```

## Backend: Stock Routes

### Updated stockRoutes.js
```javascript
const express = require('express');
const router = express.Router();
const stockController = require('../controllers/stockController');
const { protect, authorize } = require('../middleware/auth');

// All stock routes require authentication
router.use(protect);

// Stock management
router.get('/', stockController.getStocks);
router.get('/summary', stockController.getStockSummary);
router.get('/movements', stockController.getStockMovements);
router.post('/opening', authorize('admin', 'admin_stok'), stockController.addOpeningStock);
router.post('/adjustment', authorize('admin', 'admin_stok'), stockController.adjustStock);
router.post('/variant', authorize('admin', 'admin_stok'), stockController.createVariantStock); // ← New

module.exports = router;
```

## API Endpoints Used

### GET /api/warehouses
**Purpose:** Fetch list of available warehouses
```javascript
const response = await apiClient.get('/warehouses');
// Returns array of warehouses with id, name, location
```

### POST /api/stock/variant
**Purpose:** Create stock entry for product variant in specific warehouse

**Request:**
```javascript
const response = await apiClient.post('/stock/variant', {
  product_variant_id: 123,      // Required
  warehouse_id: 5,              // Required
  quantity: 0,                  // Optional, default: 0
  min_stock: 5,                 // Optional, default: 5
  cost_price: 50000            // Optional, default: 0
});
```

**Response:**
```javascript
{
  success: true,
  message: 'Stok varian berhasil dibuat',
  data: { id: 456 }
}
```

## Database Queries Used

### Get Variant Details
```sql
SELECT pv.product_id, pv.size_id, p.fitting_id 
FROM product_variants pv
JOIN products p ON pv.product_id = p.id
WHERE pv.id = ?
```

### Check Duplicate Stock
```sql
SELECT id FROM stocks 
WHERE warehouse_id = ? AND product_id = ? AND size_id = ?
```

### Insert Stock Record
```sql
INSERT INTO stocks (warehouse_id, product_id, fitting_id, size_id, quantity, avg_cost_price, last_cost_price, min_stock)
VALUES (?, ?, ?, ?, ?, ?, ?, ?)
```

### Insert Stock Movement
```sql
INSERT INTO stock_movements (warehouse_id, product_id, fitting_id, size_id, movement_type,
  quantity_before, quantity_change, quantity_after, cost_price, notes, created_by)
VALUES (?, ?, ?, ?, 'in', 0, ?, ?, ?, ?, ?)
```

## Error Scenarios and Handling

### Missing Required Fields
```javascript
// Frontend prevents submit if product_variant_id or warehouse_id missing
// Backend validates on request and returns 400

{
  success: false,
  message: 'Product variant ID dan warehouse ID harus diisi'
}
```

### Variant Not Found
```javascript
{
  success: false,
  message: 'Varian produk tidak ditemukan'  // 404
}
```

### Duplicate Stock Entry
```javascript
{
  success: false,
  message: 'Stok untuk kombinasi gudang dan varian ini sudah ada'  // 400
}
```

### Database Error
```javascript
{
  success: false,
  message: 'Gagal membuat stok varian',
  error: 'error details'  // 500
}
```

## Integration Points

### 1. With Product Creation
```
POST /api/products → Product created → Get ID
  ↓
FOR each selected size:
  ↓
POST /api/products/{id}/variants → Variant created → Get ID
  ↓
FOR each selected warehouse:
  ↓
POST /api/stock/variant → Stock created → Complete
```

### 2. With Inventory System
```
Stock created via /stock/variant
  ↓
Entry appears in GET /api/inventory/stocks
  ↓
User can edit/delete via Inventory menu
  ↓
Stock movements tracked in stock_movements table
```

### 3. With Size Selection
```
User selects sizes (S, M, L)
User selects warehouses (Jakarta, Surabaya)
  ↓
System creates:
- 3 product_variants (one per size)
- 6 stocks (3 sizes × 2 warehouses)
- 6 stock_movements (if qty > 0)
```

## Testing Code Snippets

### Test Creating Warehouse Stock
```javascript
// Test request
const testData = {
  product_variant_id: 1,
  warehouse_id: 2,
  quantity: 0,
  min_stock: 5,
  cost_price: 80000
};

const response = await apiClient.post('/stock/variant', testData);
console.log('Stock created:', response.data.data.id);
```

### Test Creating Multiple Stocks
```javascript
// Simulate product creation with 3 sizes × 2 warehouses
const sizeIds = [1, 2, 3];  // S, M, L
const warehouseIds = [1, 2]; // Jakarta, Surabaya
const variantIds = [10, 11, 12]; // Created variants

let stockCount = 0;
for (const variantId of variantIds) {
  for (const warehouseId of warehouseIds) {
    const response = await apiClient.post('/stock/variant', {
      product_variant_id: variantId,
      warehouse_id: warehouseId,
      quantity: 0,
      min_stock: 5,
      cost_price: 80000
    });
    if (response.data.success) stockCount++;
  }
}
console.log(`Created ${stockCount} stock entries`);
// Expected: 6
```

### Verify Stocks in Inventory
```javascript
// Fetch all stocks for a product
const response = await apiClient.get('/inventory/stocks', {
  params: { product_id: 1 }
});

// Should show 6 entries (3 sizes × 2 warehouses)
console.log('Total stocks:', response.data.data.length);
response.data.data.forEach(stock => {
  console.log(`${stock.product_name} - ${stock.size_name} - ${stock.warehouse_name}: ${stock.quantity}`);
});
```

---

This reference guide provides all code snippets needed to understand and maintain the warehouse selection feature.
