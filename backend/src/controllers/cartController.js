const { query, transaction } = require('../config/database');

// @desc    Get user cart
// @route   GET /api/cart
// @access  Private / Public (guest with session)
exports.getCart = async (req, res) => {
  try {
    const userId = req.user ? req.user.id : null;
    const sessionId = req.headers['x-session-id'];

    if (!userId && !sessionId) {
      return res.status(400).json({
        success: false,
        message: 'User ID or Session ID required'
      });
    }

    // Get or create cart
    let cart;
    if (userId) {
      cart = await query('SELECT id FROM carts WHERE user_id = ?', [userId]);
    } else {
      cart = await query('SELECT id FROM carts WHERE session_id = ?', [sessionId]);
    }

    if (cart.length === 0) {
      return res.json({
        success: true,
        data: {
          items: [],
          total: 0
        }
      });
    }

    const cartId = cart[0].id;

    // Get cart items
    const items = await query(
      `SELECT 
        ci.id, ci.quantity, ci.price,
        pv.id as variant_id, pv.sku_variant, pv.additional_price, pv.stock_quantity,
        p.id as product_id, p.name as product_name, p.slug, p.base_price,
        s.name as size_name,
        (SELECT image_url FROM product_images WHERE product_id = p.id AND is_primary = true LIMIT 1) as image
      FROM cart_items ci
      JOIN product_variants pv ON ci.product_variant_id = pv.id
      JOIN products p ON pv.product_id = p.id
      JOIN sizes s ON pv.size_id = s.id
      WHERE ci.cart_id = ?`,
      [cartId]
    );

    // Calculate total
    const total = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);

    res.json({
      success: true,
      data: {
        items,
        total
      }
    });
  } catch (error) {
    console.error('Get cart error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching cart',
      error: error.message
    });
  }
};

// @desc    Add item to cart
// @route   POST /api/cart
// @access  Private / Public (guest with session)
exports.addToCart = async (req, res) => {
  try {
    const { product_variant_id, quantity = 1 } = req.body;
    const userId = req.user ? req.user.id : null;
    const sessionId = req.headers['x-session-id'];

    if (!product_variant_id) {
      return res.status(400).json({
        success: false,
        message: 'Product variant ID required'
      });
    }

    // Check variant availability
    const variants = await query(
      `SELECT pv.*, p.base_price 
       FROM product_variants pv
       JOIN products p ON pv.product_id = p.id
       WHERE pv.id = ? AND pv.is_active = true`,
      [product_variant_id]
    );

    if (variants.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Product variant not found'
      });
    }

    const variant = variants[0];

    if (variant.stock_quantity < quantity) {
      return res.status(400).json({
        success: false,
        message: 'Insufficient stock'
      });
    }

    const price = variant.base_price + variant.additional_price;

    await transaction(async (conn) => {
      // Get or create cart
      let cartId;
      if (userId) {
        const [cart] = await conn.execute(
          'SELECT id FROM carts WHERE user_id = ?',
          [userId]
        );
        
        if (cart.length === 0) {
          const [result] = await conn.execute(
            'INSERT INTO carts (user_id) VALUES (?)',
            [userId]
          );
          cartId = result.insertId;
        } else {
          cartId = cart[0].id;
        }
      } else {
        const [cart] = await conn.execute(
          'SELECT id FROM carts WHERE session_id = ?',
          [sessionId]
        );
        
        if (cart.length === 0) {
          const [result] = await conn.execute(
            'INSERT INTO carts (session_id) VALUES (?)',
            [sessionId]
          );
          cartId = result.insertId;
        } else {
          cartId = cart[0].id;
        }
      }

      // Check if item already in cart
      const [existingItem] = await conn.execute(
        'SELECT id, quantity FROM cart_items WHERE cart_id = ? AND product_variant_id = ?',
        [cartId, product_variant_id]
      );

      if (existingItem.length > 0) {
        // Update quantity
        const newQuantity = existingItem[0].quantity + quantity;
        await conn.execute(
          'UPDATE cart_items SET quantity = ?, price = ? WHERE id = ?',
          [newQuantity, price, existingItem[0].id]
        );
      } else {
        // Add new item
        await conn.execute(
          'INSERT INTO cart_items (cart_id, product_variant_id, quantity, price) VALUES (?, ?, ?, ?)',
          [cartId, product_variant_id, quantity, price]
        );
      }
    });

    res.status(201).json({
      success: true,
      message: 'Item added to cart'
    });
  } catch (error) {
    console.error('Add to cart error:', error);
    res.status(500).json({
      success: false,
      message: 'Error adding to cart',
      error: error.message
    });
  }
};

// @desc    Update cart item quantity
// @route   PUT /api/cart/:itemId
// @access  Private / Public (guest with session)
exports.updateCartItem = async (req, res) => {
  try {
    const { itemId } = req.params;
    const { quantity } = req.body;

    if (!quantity || quantity < 1) {
      return res.status(400).json({
        success: false,
        message: 'Valid quantity required'
      });
    }

    // Check stock
    const items = await query(
      `SELECT ci.*, pv.stock_quantity 
       FROM cart_items ci
       JOIN product_variants pv ON ci.product_variant_id = pv.id
       WHERE ci.id = ?`,
      [itemId]
    );

    if (items.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Cart item not found'
      });
    }

    if (items[0].stock_quantity < quantity) {
      return res.status(400).json({
        success: false,
        message: 'Insufficient stock'
      });
    }

    await query('UPDATE cart_items SET quantity = ? WHERE id = ?', [quantity, itemId]);

    res.json({
      success: true,
      message: 'Cart updated'
    });
  } catch (error) {
    console.error('Update cart error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating cart',
      error: error.message
    });
  }
};

// @desc    Remove item from cart
// @route   DELETE /api/cart/:itemId
// @access  Private / Public (guest with session)
exports.removeFromCart = async (req, res) => {
  try {
    const { itemId } = req.params;

    await query('DELETE FROM cart_items WHERE id = ?', [itemId]);

    res.json({
      success: true,
      message: 'Item removed from cart'
    });
  } catch (error) {
    console.error('Remove from cart error:', error);
    res.status(500).json({
      success: false,
      message: 'Error removing from cart',
      error: error.message
    });
  }
};

// @desc    Clear cart
// @route   DELETE /api/cart
// @access  Private / Public (guest with session)
exports.clearCart = async (req, res) => {
  try {
    const userId = req.user ? req.user.id : null;
    const sessionId = req.headers['x-session-id'];

    if (userId) {
      await query('DELETE ci FROM cart_items ci JOIN carts c ON ci.cart_id = c.id WHERE c.user_id = ?', [userId]);
    } else if (sessionId) {
      await query('DELETE ci FROM cart_items ci JOIN carts c ON ci.cart_id = c.id WHERE c.session_id = ?', [sessionId]);
    }

    res.json({
      success: true,
      message: 'Cart cleared'
    });
  } catch (error) {
    console.error('Clear cart error:', error);
    res.status(500).json({
      success: false,
      message: 'Error clearing cart',
      error: error.message
    });
  }
};
