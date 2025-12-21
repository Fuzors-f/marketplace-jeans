import React, { useState, useEffect } from 'react';
import { Card, Table, Button, Select, DatePicker, Input, Row, Col, Statistic, Tag, Space, message } from 'antd';
import { SearchOutlined, FileExcelOutlined, ReloadOutlined, WarningOutlined } from '@ant-design/icons';
import { Link } from 'react-router-dom';
import api from '../../services/api';

const { RangePicker } = DatePicker;
const { Option } = Select;

const StockManagement = () => {
  const [stocks, setStocks] = useState([]);
  const [warehouses, setWarehouses] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState({
    warehouse_id: null,
    product_id: null,
    category_id: null,
    search: ''
  });
  const [summary, setSummary] = useState({
    total_products: 0,
    total_quantity: 0,
    total_inventory_value: 0,
    low_stock_items: 0
  });

  useEffect(() => {
    fetchWarehouses();
    fetchProducts();
    fetchInventoryOverview();
  }, []);

  useEffect(() => {
    fetchInventoryOverview();
  }, [filters]);

  const fetchWarehouses = async () => {
    try {
      const response = await api.get('/warehouses');
      if (response.data.success) {
        setWarehouses(response.data.data.filter(w => w.is_active));
      }
    } catch (error) {
      console.error('Failed to fetch warehouses:', error);
    }
  };

  const fetchProducts = async () => {
    try {
      const response = await api.get('/products?limit=1000');
      if (response.data.success) {
        setProducts(response.data.data);
      }
    } catch (error) {
      console.error('Failed to fetch products:', error);
    }
  };

  const fetchInventoryOverview = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      
      if (filters.warehouse_id) params.append('warehouse_id', filters.warehouse_id);
      if (filters.product_id) params.append('product_id', filters.product_id);
      if (filters.category_id) params.append('category_id', filters.category_id);

      const response = await api.get(`/inventory/overview?${params.toString()}`);
      if (response.data.success) {
        let inventoryData = response.data.data.inventory;

        // Apply search filter on frontend
        if (filters.search) {
          const searchTerm = filters.search.toLowerCase();
          inventoryData = inventoryData.filter(item => 
            item.product_name.toLowerCase().includes(searchTerm) ||
            item.sku_code?.toLowerCase().includes(searchTerm) ||
            item.warehouse_name.toLowerCase().includes(searchTerm)
          );
        }

        setStocks(inventoryData);
        setSummary(response.data.data.summary);
      }
    } catch (error) {
      message.error('Failed to fetch inventory data');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(value || 0);
  };

  const columns = [
    {
      title: 'Product',
      dataIndex: 'product_name',
      key: 'product_name',
      width: 200,
      render: (text, record) => (
        <div>
          <div style={{ fontWeight: 'bold' }}>{text}</div>
          <div style={{ fontSize: '12px', color: '#888' }}>{record.sku_code}</div>
          {record.category_name && (
            <Tag size="small" color="blue">{record.category_name}</Tag>
          )}
        </div>
      )
    },
    {
      title: 'Variant',
      key: 'variant',
      width: 150,
      render: (_, record) => (
        <div>
          {record.fitting_name && <div>Fit: {record.fitting_name}</div>}
          {record.size_name && <div>Size: {record.size_name}</div>}
        </div>
      )
    },
    {
      title: 'Warehouse',
      dataIndex: 'warehouse_name',
      key: 'warehouse_name',
      width: 120
    },
    {
      title: 'Stock',
      key: 'stock',
      width: 120,
      render: (_, record) => (
        <div>
          <div>
            <strong style={{ color: record.quantity <= record.min_stock_level ? '#ff4d4f' : '#000' }}>
              {record.quantity}
            </strong>
            {record.quantity <= record.min_stock_level && (
              <WarningOutlined style={{ color: '#ff4d4f', marginLeft: 4 }} />
            )}
          </div>
          <div style={{ fontSize: '12px', color: '#888' }}>
            Available: {record.available_quantity}
          </div>
          {record.reserved_quantity > 0 && (
            <div style={{ fontSize: '12px', color: '#fa8c16' }}>
              Reserved: {record.reserved_quantity}
            </div>
          )}
        </div>
      )
    },
    {
      title: 'Cost Price',
      dataIndex: 'avg_cost_price',
      key: 'avg_cost_price',
      width: 120,
      render: (value) => formatCurrency(value)
    },
    {
      title: 'Total Value',
      dataIndex: 'inventory_value',
      key: 'inventory_value',
      width: 120,
      render: (value) => formatCurrency(value)
    },
    {
      title: 'Last Updated',
      dataIndex: 'last_updated',
      key: 'last_updated',
      width: 120,
      render: (date) => date ? new Date(date).toLocaleDateString() : '-'
    },
    {
      title: 'Actions',
      key: 'actions',
      width: 100,
      render: (_, record) => (
        <Space direction="vertical" size="small">
          <Link to={`/admin/stock/movements?product_id=${record.product_id}&warehouse_id=${record.warehouse_id}`}>
            <Button type="link" size="small">View History</Button>
          </Link>
          <Link to={`/admin/stock/adjust?product_id=${record.product_id}&warehouse_id=${record.warehouse_id}`}>
            <Button type="link" size="small">Adjust</Button>
          </Link>
        </Space>
      )
    }
  ];

  return (
    <div style={{ padding: '0 24px' }}>
      <Row gutter={16} style={{ marginBottom: 24 }}>
        <Col span={6}>
          <Card>
            <Statistic
              title="Total Products"
              value={summary.total_products}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="Total Quantity"
              value={summary.total_quantity}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="Total Value"
              value={formatCurrency(summary.total_inventory_value)}
              valueStyle={{ color: '#fa8c16' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="Low Stock Items"
              value={summary.low_stock_items}
              valueStyle={{ color: summary.low_stock_items > 0 ? '#ff4d4f' : '#52c41a' }}
            />
          </Card>
        </Col>
      </Row>

      <Card 
        title="Stock Management"
        extra={
          <Space>
            <Button icon={<FileExcelOutlined />}>Export</Button>
            <Button icon={<ReloadOutlined />} onClick={fetchInventoryOverview}>
              Refresh
            </Button>
          </Space>
        }
      >
        <Row gutter={16} style={{ marginBottom: 16 }}>
          <Col span={6}>
            <Select
              placeholder="Select Warehouse"
              style={{ width: '100%' }}
              allowClear
              value={filters.warehouse_id}
              onChange={(value) => handleFilterChange('warehouse_id', value)}
            >
              {warehouses.map(warehouse => (
                <Option key={warehouse.id} value={warehouse.id}>
                  {warehouse.name}
                </Option>
              ))}
            </Select>
          </Col>
          <Col span={6}>
            <Select
              placeholder="Select Product"
              style={{ width: '100%' }}
              allowClear
              showSearch
              optionFilterProp="children"
              value={filters.product_id}
              onChange={(value) => handleFilterChange('product_id', value)}
            >
              {products.map(product => (
                <Option key={product.id} value={product.id}>
                  {product.name} ({product.sku_code})
                </Option>
              ))}
            </Select>
          </Col>
          <Col span={6}>
            <Input
              placeholder="Search products..."
              prefix={<SearchOutlined />}
              value={filters.search}
              onChange={(e) => handleFilterChange('search', e.target.value)}
              allowClear
            />
          </Col>
          <Col span={6}>
            <Space>
              <Link to="/admin/stock/opname">
                <Button type="primary">Stock Opname</Button>
              </Link>
              <Link to="/admin/stock/adjustment">
                <Button>Quick Adjust</Button>
              </Link>
            </Space>
          </Col>
        </Row>

        <Table
          columns={columns}
          dataSource={stocks}
          loading={loading}
          rowKey={(record) => `${record.warehouse_name}-${record.product_id}-${record.fitting_name}-${record.size_name}`}
          pagination={{
            pageSize: 20,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total, range) => `${range[0]}-${range[1]} of ${total} items`
          }}
          scroll={{ x: 1200 }}
          size="small"
          rowClassName={(record) => 
            record.quantity <= record.min_stock_level ? 'low-stock-row' : ''
          }
        />
      </Card>

      <style jsx>{`
        .low-stock-row {
          background-color: #fff2e8 !important;
        }
        .low-stock-row:hover {
          background-color: #ffe7ba !important;
        }
      `}</style>
    </div>
  );
};

export default StockManagement;