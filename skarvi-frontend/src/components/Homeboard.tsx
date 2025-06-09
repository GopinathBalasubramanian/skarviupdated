import React, { useState, useEffect } from "react";
import axios from "axios";
import { Button, Card, Table, Spin, Empty, message, Row, Col } from "antd";
import "./Dashboard.css";

const API_URL = "http://127.0.0.1:8000/physical_trades";

const formatNumber = (value: number | undefined | null) => {
  return typeof value === 'number' && !isNaN(value)
    ? value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })
    : '-';
};

const formatDate = (value: string | undefined | null) => {
  if (!value) return '-';
  try {
    return new Date(value).toLocaleDateString('en-GB');
  } catch {
    return value;
  }
};

interface TableConfig {
  label: string;
  url: string;
  defaultColumns?: any[];
}

const tableConfigs: { [key: string]: TableConfig } = {
  QuantityPositionSummary: {
    label: "Quantity Position Summary",
    url: `${API_URL}/api/quantity-position-summary`,
  },
  QuantityPositionDaily: {
    label: "Quantity Position Daily",
    url: `${API_URL}/api/quantity-position-daily`,
  },
  QPESummary: {
    label: "QPE Summary",
    url: `${API_URL}/api/qpe-summary`,
  },
  QPEDaily: {
    label: "QPE Daily",
    url: `${API_URL}/api/qpe-daily`,
  },
  VaRReport: {
    label: "VaR Report",
    url: `${API_URL}/api/var-report`,
  },
};

type TableConfigKey = keyof typeof tableConfigs;

const Dashboard = () => {
  const tableKeys = Object.keys(tableConfigs) as TableConfigKey[];
  const [activeTableKey, setActiveTableKey] = useState<TableConfigKey | null>(null);
  const [columns, setColumns] = useState<any[]>([]);
  const [tableData, setTableData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!activeTableKey) return;

    const fetchData = async () => {
      const config = tableConfigs[activeTableKey];
      const token = localStorage.getItem("access_token");

      setLoading(true);
      setTableData([]);
      setColumns([]);

      try {
        const response = await axios.get(config.url, {
          headers: { Authorization: token ? `Bearer ${token}` : "" },
        });

        const data = response.data;
        setTableData(data);

        if (data.length > 0) {
          if (config.defaultColumns) {
            setColumns(config.defaultColumns);
          } else {
            const dynamicCols = Object.keys(data[0]).map((key) => {
              const col: any = {
                title: key.replace(/_/g, " ").toUpperCase(),
                dataIndex: key,
                key,
                ellipsis: true,
              };
              if (typeof data[0][key] === 'number') {
                col.render = formatNumber;
                col.align = 'right';
              } else if (key.toLowerCase().includes('date')) {
                col.render = formatDate;
              }
              return col;
            });
            setColumns(dynamicCols);
          }
        }
      } catch (error) {
        message.error(`Failed to load data for ${config.label}`);
        setTableData([]);
        setColumns([]);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [activeTableKey]);

  return (
    <div className="dashboard-container">
      <div className="dashboard-buttons-panel">
        <Row gutter={[16, 16]} justify="center">
          {tableKeys.map((key) => (
            <Col key={key} xs={24} sm={12} md={8}>
              <Button
                type={activeTableKey === key ? "primary" : "default"}
                onClick={() => setActiveTableKey(key)}
                className="dashboard-nav-button"
              >
                {tableConfigs[key].label}
              </Button>
            </Col>
          ))}
        </Row>
      </div>

      {activeTableKey && (
        <Card
          title={tableConfigs[activeTableKey]?.label}
          className="dashboard-card"
          style={{ marginTop: 24 }}
        >
          {loading ? (
            <div className="loading-spinner-container">
              <Spin tip="Loading..." size="large" />
            </div>
          ) : tableData.length === 0 ? (
            <Empty description="No data available." />
          ) : (
            <Table
              columns={columns}
              dataSource={tableData}
              rowKey={(record) => record.id || record.uuid || JSON.stringify(record)}
              scroll={{ x: 'max-content', y: 'calc(100vh - 380px)' }}
              pagination={{ pageSize: 12, showSizeChanger: false, position: ['bottomCenter'] }}
              bordered
              size="middle"
            />
          )}
        </Card>
      )}

      <footer className="dashboard-footer">
        <p>© 2024 Skarvi Systems Limited</p>
      </footer>
    </div>
  );
};

export default Dashboard;
