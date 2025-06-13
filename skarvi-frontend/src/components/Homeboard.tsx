import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

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
  Space,
  Typography
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
  LineChartOutlined,
  MoneyCollectOutlined,
  ReadOutlined,
  MinusCircleOutlined
} from '@ant-design/icons';
import "./Dashboard.css";
import "./scrollablecss.css"
import { API_URL } from "../utils/utils";
const { Title, Text } = Typography;


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
    // You might want to use a more robust date formatting library like 'date-fns' for production
    const date = new Date(value);
    // Check if the date is valid
    if (isNaN(date.getTime())) {
      return value; // Return original if invalid
    }
    return date.toLocaleDateString("en-GB");
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
    url: `${API_URL}/physical_trades/api/quantity-position-summary`,
  },
  QuantityPositionDaily: {
    label: "Quantity Position Daily",
    url: `${API_URL}/physical_trades/api/quantity-position-daily`,
  },
  QPESummary: {
    label: "QPE Summary",
    url: `${API_URL}/physical_trades/api/qpe-summary`,
  },
  QPEDaily: {
    label: "QPE Daily",
    url: `${API_URL}/physical_trades/api/qpe-daily`,
  },
  VaRReport: {
    label: "VaR Report",
    url: `${API_URL}/physical_trades/api/var-report`,
  },
};

type TableConfigKey = keyof typeof tableConfigs;

const Dashboard = () => {
  const navigate = useNavigate();
  const tableKeys = Object.keys(tableConfigs) as TableConfigKey[];
  const [activeTableKey, setActiveTableKey] = useState<TableConfigKey | null>(null);
  const [columns, setColumns] = useState<any[]>([]);
  const [tableData, setTableData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);

  // Example hardcoded awaiting actions - In a real app, this would come from an API
  const awaitingActions = [
    {
      id: 1,
      icon: <FileTextOutlined />,
      title: "Review Trade Approval: #TRD-2025-00123",
      description: "Requires your authorization - 5 Mins ago",
      dueDate: null,
      type: "trade-approval",
    },
    {
      id: 2,
      icon: <DollarOutlined />,
      title: "Address Margin Call: Account ID 7890",
      description: "Urgent action required - Due Today!",
      dueDate: new Date().toISOString(), // Dynamically set to today for demo
      type: "margin-call",
    },
    {
      id: 3,
      icon: <CalendarOutlined />,
      title: "Upcoming Contract Expiry: Crude Oil Jul'25",
      description: "Review or roll over before 2025-07-20",
      dueDate: "2025-07-20T00:00:00Z",
      type: "contract-expiry",
    },
    {
      id: 4,
      icon: <UserOutlined />,
      title: "Complete KYC Profile Update",
      description: "Mandatory for continued trading - 3 days left",
      dueDate: "2025-06-15T00:00:00Z",
      type: "kyc-update",
    }
  ];

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

  const handleMetricCardClick = (metricName: string) => {
    message.info(`Clicked on ${metricName}`);
    // You can add navigation or more specific actions here
  };

  const handleActionClick = (action: any) => {
    message.info(`Clicked Awaiting Action: ${action.title}`);
    // Example: Navigate based on action type
    switch (action.type) {
      case 'trade-approval':
        navigate('/approvals'); // Assuming you have an /approvals route
        break;
      case 'margin-call':
        navigate('/accounts/margin'); // Example route for margin management
        break;
      case 'contract-expiry':
        navigate('/portfolio/contracts'); // Example route for contracts
        break;
      case 'kyc-update':
        navigate('/profile/kyc'); // Example route for KYC updates
        break;
      default:
        
        // Handle generic or unknown action types
        message.warning(`No specific route for action type: ${action.type}`);
    }
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

        <Row gutter={[24, 24]} className="section-row" style={{borderRadius:"30px"}}>
          <Col xs={24} lg={12} style={{borderRadius:"30px"}}>
            <div className="scrollable-col">
              <Card title="Awaiting Your Action" className="action-card" bordered={false}>
                {awaitingActions.length > 0 ? (
                  awaitingActions.map((action) => (
                    <div key={action.id} className="task-item" onClick={() => handleActionClick(action)}>
                      <Space>
                        {action.icon}
                        <div>
                          <Text strong>{action.title}</Text>
                          <br />
                          <Text type="secondary">{action.description}</Text>
                          {action.dueDate && (
                            <>
                              <br />
                              <Text className="due-date-text">
                                DUE {formatDate(action.dueDate)}
                              </Text>
                            </>
                          )}
                        </div>
                      </Space>
                    </div>
                  ))
                ) : (
                  <Empty description="No actions currently awaiting your attention." image={Empty.PRESENTED_IMAGE_SIMPLE} />
                )}
              </Card>
            </div>
          </Col>

          <Col xs={24} lg={12}>
            <div className="scrollable-col1">
              <Card title="Quick Tasks" className="quick-tasks-card" bordered={false}>
                <Space direction="vertical" style={{ width: '100%' }}>
                  <Button block className="quick-task-button" onClick={() => navigate('/physical-trades')}>
                    Physical Trade
                  </Button>
                  <Button block className="quick-task-button" onClick={() => navigate('/paper-trades')}>Paper Trade</Button>
                  <Button block className="quick-task-button">Give Feedback</Button>
                </Space>
              </Card>
            </div>
          </Col>
        </Row>


        {/* Existing Report Buttons Section - Now styled like Metric Cards */}
        <Row gutter={[24, 24]} className="section-row report-cards-row">
          <Col span={24} style={{ textAlign: 'center', marginBottom: '20px' }}>
            <Title level={4}>Detailed Financial Reports</Title>
          </Col>
          {tableKeys.map((key) => (
            <Col key={key} xs={24} sm={12} lg={8}>
              <Card
                className={`metric-card report-card ${activeTableKey === key ? 'active-report-card' : ''}`}
                bordered={false}
                onClick={() => showModal(key)}
              >
                <div className="metric-header" style={{ marginBottom: '5px' }}>
                  {key === 'QuantityPositionSummary' && <LineChartOutlined className="metric-icon" style={{ color: '#8a2be2' }} />}
                  {key === 'QuantityPositionDaily' && <CalendarOutlined className="metric-icon" style={{ color: '#00a86b' }} />}
                  {key === 'QPESummary' && <DollarOutlined className="metric-icon" style={{ color: '#ff69b4' }} />}
                  {key === 'QPEDaily' && <ClockCircleOutlined className="metric-icon" style={{ color: '#4169e1' }} />}
                  {key === 'VaRReport' && <FileTextOutlined className="metric-icon" style={{ color: '#dc143c' }} />}
                  <div className="trend-line-container">
                  </div>
                </div>
                <div className="report-card-content">
                  <Title level={4} className="report-card-title">{tableConfigs[key].label}</Title>
                  <Text className="report-card-description">
                    {key === 'QuantityPositionSummary' && 'Overview of asset quantities.'}
                    {key === 'QuantityPositionDaily' && 'Daily breakdown of asset quantities.'}
                    {key === 'QPESummary' && 'Summary of Quantity-Price Exposure.'}
                    {key === 'QPEDaily' && 'Daily Quantity-Price Exposure details.'}
                    {key === 'VaRReport' && 'Value at Risk assessment report.'}
                  </Text>
                  {/* <Text type="secondary" style={{ fontSize: '0.8em', marginTop: '10px', display: 'block' }}>Click to view details</Text> */}
                </div>
              </Card>
            </Col>
          ))}
        </Row>
      </div>

      <Modal
        title={activeTableKey ? tableConfigs[activeTableKey]?.label : "Table Data"}
        open={isModalVisible}
        onCancel={handleCancel}
        footer={null}
        width={1000}
        centered
        destroyOnClose={true}
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