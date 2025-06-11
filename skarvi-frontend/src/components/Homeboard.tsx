import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom"; // Add this line
import {
  Button,
  Card,
  Table,
  Spin,
  Empty,
  message,
  Row,
  Col,
  Modal,
  Space, // Import Space for consistent spacing
  Typography // For text styling
} from "antd";
import { motion, AnimatePresence } from "framer-motion";
import {
  UserOutlined,
  ClockCircleOutlined,
  EnvironmentOutlined,
  DollarOutlined,
  ArrowDownOutlined,
  ArrowUpOutlined,
  CalendarOutlined,
  FileTextOutlined,
  LineChartOutlined, // For graph representation
  MoneyCollectOutlined, // For cash
  ReadOutlined, // For invested
  MinusCircleOutlined // For withdrawals
} from '@ant-design/icons';
import "./Dashboard.css"; // We will define styles here
// import "./Navbar.css"; // Not strictly needed for dashboard UI

const { Title, Text } = Typography;

const API_URL = "http://127.0.0.1:8000/physical_trades";

const formatNumber = (value: number | undefined | null) => {
  return typeof value === "number" && !isNaN(value)
    ? value.toLocaleString(undefined, {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      })
    : "-";
};

const formatDate = (value: string | undefined | null) => {
  if (!value) return "-";
  try {
    return new Date(value).toLocaleDateString("en-GB");
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
  const navigate = useNavigate(); // Add this line
  const tableKeys = Object.keys(tableConfigs) as TableConfigKey[];
  const [activeTableKey, setActiveTableKey] = useState<TableConfigKey | null>(null);
  const [columns, setColumns] = useState<any[]>([]);
  const [tableData, setTableData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);

  const showModal = (key: TableConfigKey) => {
    setActiveTableKey(key);
    setIsModalVisible(true);
  };

  const handleCancel = () => {
    setIsModalVisible(false);
    setActiveTableKey(null);
    setTableData([]);
    setColumns([]);
  };

  // Dummy function for metric card clicks
  const handleMetricCardClick = (metricName: string) => {
    message.info(`Clicked on ${metricName}`);
    // You can add navigation or more specific actions here
  };

  useEffect(() => {
    if (!activeTableKey || !isModalVisible) return;

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
            const dynamicCols = Object.keys(data[0])
              .filter((key) => key.toLowerCase() !== "id")
              .map((key) => {
                const col: any = {
                  title: key.replace(/_/g, " ").toUpperCase(),
                  dataIndex: key,
                  key,
                };
                if (typeof data[0][key] === "number") {
                  col.render = formatNumber;
                  col.align = "right";
                } else if (key.toLowerCase().includes("date")) {
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
  }, [activeTableKey, isModalVisible]);

  return (
    <div className="dashboard-container">
      {/* 1. Top Banner Section */}
      <div className="dashboard-header-banner">
        <Row align="middle" justify="space-between" className="banner-content">
          <Col>
            <Title level={2} className="greeting-text">Good Morning, Skarvian</Title>
          </Col>
          <Col>
            <Text className="location-weather"><EnvironmentOutlined /> San Francisco - 68° ☀️</Text>
          </Col>
        </Row>
      </div>

      {/* 2. Main Content Area Below Banner */}
      <div className="dashboard-main-content">
        {/* Awaiting Action & Quick Tasks Section */}
        <Row gutter={[24, 24]} className="section-row">
          <Col xs={24} lg={12}>
            <Card title="Awaiting Your Action" className="action-card" bordered={false}>
              <div className="task-item">
                <Space>
                  <FileTextOutlined className="task-icon" />
                  <div>
                    <Text strong>Submit Interview Feedback: Andrew Jeffers</Text>
                    <br />
                    <Text type="secondary">Your Tasks - 1 Minute ago</Text>
                  </div>
                </Space>
              </div>
              <div className="task-item">
                <Space>
                  <CalendarOutlined className="task-icon" />
                  <div>
                    <Text strong>Transition Back to Office</Text>
                    <br />
                    <Text type="secondary">Journey - 10 Required Steps</Text>
                    <br />
                    <Text className="due-date-text">NEXT STEP DUE 09/08/21</Text>
                  </div>
                </Space>
                </div>
              </Card>
          </Col>
          <Col xs={24} lg={12}>
            <Card title="Quick Tasks" className="quick-tasks-card" bordered={false}>
              <Space direction="vertical" style={{ width: '100%'}}>
                <Button block className="quick-task-button" onClick={() => navigate('/physical-trades')}>
                  Physical Trade
                </Button>        
                <Button block className="quick-task-button" onClick={() => navigate('/paper-trades')}>Paper Trade</Button>
                <Button block className="quick-task-button">Give Feedback</Button>
              </Space> {/* <--- Add this closing tag if it's missing in Homeboard.tsx */}
            </Card>
          </Col>
        </Row>

        {/* Existing Report Buttons Section - Now styled like Metric Cards */}
        <Row gutter={[24, 24]} className="section-row report-cards-row">
          <Col span={24} style={{ textAlign: 'center', marginBottom: '20px' }}>
            <Title level={4}>Detailed Financial Reports</Title>
          </Col>
          {tableKeys.map((key) => (
            <Col key={key} xs={24} sm={12} lg={8}> {/* Adjust Col sizes as needed */}
              <Card
                className={`metric-card report-card ${activeTableKey === key ? 'active-report-card' : ''}`}
                bordered={false}
                onClick={() => showModal(key)}
              >
                <div className="metric-header" style={{ marginBottom: '5px' }}>
                  {/* Choose an appropriate icon for each report type */}
                  {key === 'QuantityPositionSummary' && <LineChartOutlined className="metric-icon" style={{ color: '#8a2be2' }} />} {/* Purple */}
                  {key === 'QuantityPositionDaily' && <CalendarOutlined className="metric-icon" style={{ color: '#00a86b' }} />} {/* Green */}
                  {key === 'QPESummary' && <DollarOutlined className="metric-icon" style={{ color: '#ff69b4' }} />} {/* Hot Pink */}
                  {key === 'QPEDaily' && <ClockCircleOutlined className="metric-icon" style={{ color: '#4169e1' }} />} {/* Royal Blue */}
                  {key === 'VaRReport' && <FileTextOutlined className="metric-icon" style={{ color: '#dc143c' }} />} {/* Crimson */}
                  <div className="trend-line-container">
                    {/* Simplified trend line, can be customized per report */}
                    {/* Removed explicit gradients here, can be added per key if needed */}
                  </div>
                </div>
                <div className="report-card-content">
                  <Title level={4} className="report-card-title">{tableConfigs[key].label}</Title>
                  <Text className="report-card-description">
                    {/* Add a brief description for each report type */}
                    {key === 'QuantityPositionSummary' && 'Overview of asset quantities.'}
                    {key === 'QuantityPositionDaily' && 'Daily breakdown of asset quantities.'}
                    {key === 'QPESummary' && 'Summary of Quantity-Price Exposure.'}
                    {key === 'QPEDaily' && 'Daily Quantity-Price Exposure details.'}
                    {key === 'VaRReport' && 'Value at Risk assessment report.'}
                  </Text>
                  {/* Optional: Add a small data point if available, e.g., 'Last updated: Today' */}
                  <Text type="secondary" style={{ fontSize: '0.8em', marginTop: '10px', display: 'block' }}>Click to view details</Text>
                </div>
              </Card>
            </Col>
          ))}
        </Row>
      </div>

      {/* Modal for displaying table data (kept as is) */}
      <Modal
        title={activeTableKey ? tableConfigs[activeTableKey]?.label : "Table Data"}
        open={isModalVisible}
        onCancel={handleCancel}
        footer={null}
        width={1000}
        centered
        // destroyOnHidden={true}
      >
        <AnimatePresence mode="wait">
          {isModalVisible && (
            <motion.div
              key={activeTableKey}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.3 }}
            >
              <Card className="dashboard-card" bordered={false}>
                {loading ? (
                  <div className="loading-spinner-container">
                    <Spin tip="Loading..." size="large" />
                  </div>
                ) : tableData.length === 0 ? (
                  <Empty description="No data available." />
                ) : (
                  <div style={{ overflowX: "auto" }}>
                    <Table
                      columns={columns}
                      dataSource={tableData}
                      rowKey={(record, index) => record.id || record.uuid || `row-${index}`}
                      pagination={{ pageSize: 12, showSizeChanger: false, position: ["bottomCenter"] }}
                      bordered
                      size="middle"
                      scroll={{ x: "max-content", y: 300 }}
                    />
                  </div>
                )}
              </Card>
            </motion.div>
          )}
        </AnimatePresence>
      </Modal>
    </div>
  );
};

export default Dashboard;