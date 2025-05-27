import React, { useState, useEffect } from "react";
import {
  Container,
  Form,
  Row,
  Col,
  Button,
  Spinner,
  Alert,
} from "react-bootstrap";
import { useLocation, useNavigate } from "react-router-dom";
import { API_URL } from "../utils/utils";

interface FormData {
  id?: string;
  tran_ref_no: string;
  quantity_mt: string;
  broker_name: string;
  transaction_type: string;
  fixed_price: string;
  charges_unit: string;
  counterparty: string;
  pricing_period_from: string;
  broker_charges: string;
  group_name: string;
  traded_by?: string;
  pricing_basis2: string;
  traded_on: string;
  quantitybbl: string;
  quantity: string;
  pricing_period_to: string;
  due_date: string;
  email_id: string;
}

const AddNewTrade: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const tradeData = location.state?.tradeData as FormData | undefined;

  const [formData, setFormData] = useState<FormData>({
    id: "",
    tran_ref_no: "",
    quantity_mt: "",
    broker_name: "",
    transaction_type: "",
    fixed_price: "",
    charges_unit: "",
    counterparty: "",
    pricing_period_from: "",
    broker_charges: "",
    group_name: "",
    traded_by: "",
    pricing_basis2: "",
    traded_on: "",
    quantitybbl: "",
    quantity: "", // 'quantity' is also part of your interface, but not used in the initial state or input fields
    pricing_period_to: "",
    due_date: "",
    email_id: "",
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  // Set form data if editing
  useEffect(() => {
    if (tradeData) {
      setFormData((prev) => ({
        ...prev,
        ...tradeData,
        // Ensure numeric fields are correctly handled when coming from tradeData
        // Convert numbers back to strings for input fields if they are stored as numbers in tradeData
        // Or ensure your backend always sends them as strings.
        // For 'quantitybbl', if it's coming as a number, convert to string for the input field.
        quantitybbl: String(tradeData.quantitybbl || ""),
        quantity_mt: String(tradeData.quantity_mt || ""),
        fixed_price: String(tradeData.fixed_price || ""),
        broker_charges: String(tradeData.broker_charges || ""),
        due_date: String(tradeData.due_date || ""),
        traded_by: String(tradeData.traded_by ?? ""), // 🔧 Force string conversion of ID
        // Add other numeric fields here if necessary
      }));
    }
    // eslint-disable-next-line
  }, [tradeData]);

  useEffect(() => {
    // If this is a copy operation, ensure id is blank so it creates a new trade
    if (location.state?.isCopy) {
      setFormData((prev) => ({
        ...prev,
        id: "",
      }));
    }
    // eslint-disable-next-line
  }, [location.state?.isCopy]);

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const users = [
    { id: "1", name: "Manolis Mihaletos" },
    { id: "2", name: "Odysseas Pegkos" },
    { id: "3", name: "George Pateros" },
    { id: "4", name: "Michalis Tziovas" },
    { id: "5", name: "Savitri" },
  ];

  const validateForm = () => {
    const requiredFields = [
      "tran_ref_no",
      "transaction_type",
      "fixed_price", // Make sure this is validated as a number if it's required to be a number
      "pricing_period_from",
      "pricing_period_to",
      "traded_on",
    ];
    for (let field of requiredFields) {
      if (!formData[field as keyof FormData]) {
        return `Please fill in the required field: ${field}`;
      }
    }

    // Additional validation for numeric fields if they are optional but need to be numbers if provided
    const numericFields = [
      "quantity_mt",
      "fixed_price",
      "broker_charges",
      "quantitybbl",
      "due_date",
    ];
    for (const field of numericFields) {
      const value = formData[field as keyof FormData];
      if (value !== "" && isNaN(Number(value))) {
        return `Please enter a valid number for ${field}`;
      }
    }

    return null;
  };

  // Helper function to convert empty strings to null for numeric fields
  const convertEmptyStringsToNull = (data: FormData) => {
    const newData: any = { ...data };
    const numericFields = [
      "quantity_mt",
      "fixed_price",
      "broker_charges",
      "quantitybbl",
      "quantity", // if 'quantity' is also a number field
      "due_date",
    ];

    numericFields.forEach((field) => {
      if (newData[field] === "") {
        newData[field] = null; // Or 0, depending on backend expectation for missing numeric values
      }
    });

    // Ensure date fields are formatted correctly if necessary, or sent as is if backend handles it
    // For example, if your backend expects YYYY-MM-DD for empty dates, you might send null or ""
    const dateFields = [
      "pricing_period_from",
      "pricing_period_to",
      "traded_on",
      "due_date",
    ];
    dateFields.forEach((field) => {
      if (newData[field] === "") {
        newData[field] = null; // Or "" if your backend expects empty string for empty dates
      }
    });

    return newData;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);

    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      return;
    }

    setIsSubmitting(true);
    let accessToken = localStorage.getItem("access_token");
    const refreshToken = localStorage.getItem("refresh_token");
    const isUpdate = !!formData.id;
    const url = isUpdate
      ? `${API_URL}/paper_trades/hedging/${formData.id}`
      : `${API_URL}/paper_trades/hedging/`;

    // Process payload to convert empty strings for numeric fields
    const payload = {
      ...formData,
      traded_by: formData.traded_by ? Number(formData.traded_by) : null,
    };
    if (!isUpdate) delete payload.id;
    // Remove 'quantitybbl' if 'quantity' is the primary field the backend expects
    // Based on your interface, you have both `quantitybbl` and `quantity`.
    // If your backend only expects one, you might need to map them or remove the redundant one.
    // For now, let's assume `quantitybbl` is the one you intend to send.
    // However, your useEffect suggests `quantitybbl` might sometimes come from `tradeData.quantity`,
    // so consider if these two fields are truly distinct or one is a fallback.
    // If 'quantity' is just a placeholder and 'quantitybbl' is always what you send, you can
    // remove `delete payload.quantity;` from the initial state if you never intend to use it.
    // If `quantity` is meant to be an alias or alternative, you might need to set one based on the other.
    // Given the error is on `quantitybbl`, we focus on that.

    const makeRequest = async (token: string | null) => {
      return await fetch(url, {
        method: isUpdate ? "PUT" : "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });
    };

    try {
      let response = await makeRequest(accessToken);
      if (response.status === 401 && refreshToken) {
        const refreshResponse = await fetch(`${API_URL}/api/token/refresh/`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${accessToken}`,
          },
          body: JSON.stringify({ refresh: refreshToken }),
        });

        if (refreshResponse.ok) {
          const refreshData = await refreshResponse.json();
          accessToken = refreshData.access;
          if (typeof accessToken === "string") {
            localStorage.setItem("access_token", accessToken);
            response = await makeRequest(accessToken);
          } else {
            throw new Error("Invalid access token received.");
          }
        } else {
          // If refresh token fails, clear tokens and navigate to login
          localStorage.removeItem("access_token");
          localStorage.removeItem("refresh_token");
          navigate("/login"); // Assuming you have a login route
          throw new Error("Failed to refresh token. Please log in again.");
        }
      }
      const data = await response.json();

      if (!response.ok) {
        // More detailed error handling from the backend response
        const errorMessage =
          data.non_field_errors?.[0] || data.detail || JSON.stringify(data);
        throw new Error(
          errorMessage || `Failed to ${isUpdate ? "update" : "create"} trade`
        );
      }

      setSuccess(true);

      if (!isUpdate) {
        // Reset form for new entry, ensuring quantitybbl and others are reset to empty string
        setFormData({
          id: "",
          tran_ref_no: "",
          quantity_mt: "",
          broker_name: "",
          transaction_type: "",
          fixed_price: "",
          charges_unit: "",
          counterparty: "",
          pricing_period_from: "",
          broker_charges: "",
          group_name: "",
          traded_by: "",
          pricing_basis2: "",
          traded_on: "",
          quantitybbl: "", // Reset to empty string
          quantity: "", // Reset to empty string
          pricing_period_to: "",
          due_date: "",
          email_id: "",
        });
      } else {
        // After update, navigate back to the table to see updated values
        navigate(-1); // or navigate('/papertrades') if you have a named route
      }
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "An unknown error occurred"
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        height: "auto",
        position: "relative",
        backgroundColor: "#f5f5f5",
      }}
    >
      <div
        style={{
          backgroundColor: "#e9ecef",
          padding: "20px 0",
          marginBottom: "40px",
          boxShadow: "0 4px 4px rgba(0,0,0,0.1)",
        }}
      >
        <h2
          style={{
            textAlign: "center",
            color: "#2c3e50",
            fontWeight: "bold",
            margin: 0,
          }}
        >
          {formData.id ? "Edit Trade" : "Paper Transaction"}
        </h2>
      </div>

      <Container
        style={{
          flex: 1,
          padding: "0 15px 70px",
          maxWidth: "100%",
          overflow: "hidden",
        }}
      >
        {success && (
          <Alert
            variant="success"
            onClose={() => setSuccess(false)}
            dismissible
          >
            Trade {formData.id ? "updated" : "created"} successfully!
          </Alert>
        )}
        {error && (
          <Alert variant="danger" onClose={() => setError(null)} dismissible>
            {error}
          </Alert>
        )}

        <Form onSubmit={handleSubmit} style={{ padding: "0 15px" }}>
          <Row>
            {/* Column 1 */}
            <Col md={3}>
              <Form.Group controlId="tran_ref_no">
                <Form.Label>Transaction Reference</Form.Label>
                <Form.Control
                  type="text"
                  name="tran_ref_no"
                  value={formData.tran_ref_no}
                  onChange={handleChange}
                  required
                />
              </Form.Group>
              <Form.Group controlId="quantityMT">
                <Form.Label className="mt-3">quantity MT</Form.Label>
                <Form.Control
                  type="number"
                  name="quantity_mt"
                  value={formData.quantity_mt}
                  onChange={handleChange}
                  min="0"
                  step="0.01"
                />
              </Form.Group>
              <Form.Group controlId="fixed_price">
                <Form.Label className="mt-3">Fixed Price</Form.Label>
                <Form.Control
                  type="number"
                  name="fixed_price"
                  value={formData.fixed_price}
                  onChange={handleChange}
                  min="0"
                  step="0.01"
                  required
                />
              </Form.Group>
              <Form.Group controlId="pricingQuotation">
                <Form.Label className="mt-3">Pricing Quotation</Form.Label>
                <Form.Control
                  type="text"
                  name="pricing_basis2"
                  value={formData.pricing_basis2}
                  onChange={handleChange}
                />
              </Form.Group>
              <Form.Group controlId="tradedOn">
                <Form.Label className="mt-3">Trade Created on</Form.Label>
                <Form.Control
                  type="date"
                  name="traded_on"
                  value={formData.traded_on}
                  onChange={handleChange}
                  required
                />
              </Form.Group>
            </Col>

            {/* Column 2 */}
            <Col md={3}>
              <Form.Group controlId="brokerName">
                <Form.Label>Broker name</Form.Label>
                <Form.Control
                  type="text"
                  name="broker_name"
                  value={formData.broker_name}
                  onChange={handleChange}
                />
              </Form.Group>
              <Form.Group controlId="transaction_type">
                <Form.Label className="mt-3">Bought/Sold</Form.Label>
                <Form.Select
                  name="transaction_type"
                  value={formData.transaction_type}
                  onChange={handleChange}
                  required
                >
                  <option value="">Select</option>
                  <option value="Bought">Bought</option>
                  <option value="Sold">Sold</option>
                </Form.Select>
              </Form.Group>
              <Form.Group controlId="pricing_period_from">
                <Form.Label className="mt-3">Pricing Period From</Form.Label>
                <div className="flex-grow-1">
                  <Form.Control
                    type="date"
                    name="pricing_period_from"
                    value={formData.pricing_period_from}
                    onChange={handleChange}
                    required
                  />
                </div>
              </Form.Group>
              <Form.Group controlId="quantitybbl">
                <Form.Label className="mt-3">Quantity BBL</Form.Label>
                <Form.Control
                  type="number"
                  name="quantitybbl"
                  value={formData.quantitybbl}
                  onChange={handleChange}
                  min="0"
                />
              </Form.Group>
            </Col>

            {/* Column 3 */}
            <Col md={3}>
              <Form.Group controlId="brokerChargesUnit">
                <Form.Label>Broker Charges Unit</Form.Label>
                <Form.Select
                  name="charges_unit"
                  value={formData.charges_unit}
                  onChange={handleChange}
                >
                  <option value="">Select</option>
                  <option value="USD/MT">USD/MT</option>
                  <option value="USD/BBL">USD/BBL</option>
                </Form.Select>
              </Form.Group>
              <Form.Group controlId="Counterparty">
                <Form.Label className="mt-3">Counterparty</Form.Label>
                <Form.Control
                  type="text"
                  name="counterparty"
                  value={formData.counterparty}
                  onChange={handleChange}
                />
              </Form.Group>
              <Form.Group controlId="pricing_period_to">
                <Form.Label className="mt-3">Pricing Period To</Form.Label>
                <Form.Control
                  type="date"
                  name="pricing_period_to"
                  value={formData.pricing_period_to}
                  onChange={handleChange}
                  required
                />
              </Form.Group>
              <Form.Group controlId="emailID">
                <Form.Label className="mt-3">Email ID</Form.Label>
                <Form.Control
                  type="email"
                  name="email_id"
                  value={formData.email_id}
                  onChange={handleChange}
                />
              </Form.Group>
            </Col>

            {/* Column 4 */}
            <Col md={3}>
              <Form.Group controlId="brokerCharges">
                <Form.Label>Broker Charges</Form.Label>
                <Form.Control
                  type="text" // Keep as text to allow flexible input, but convert to number for backend
                  name="broker_charges"
                  value={formData.broker_charges}
                  onChange={handleChange}
                />
              </Form.Group>

              <Form.Group controlId="groupName">
                <Form.Label className="mt-3">Group Name</Form.Label>
                <Form.Select
                  name="group_name"
                  value={formData.group_name}
                  onChange={handleChange}
                  required
                >
                  <option value="">Select</option>
                  <option value="Crude">Crude</option>
                  <option value="Fuel Oil">Fuel Oil</option>
                  <option value="Gas Oil">Gas Oil</option>
                  <option value="Gasoline">Gasoline</option>
                  <option value="Jet">Jet</option>
                </Form.Select>
              </Form.Group>
              <Form.Group controlId="tradedBy">
                <Form.Label className="mt-3">Traded By</Form.Label>
                <Form.Select
                  name="traded_by"
                  value={formData.traded_by}
                  onChange={handleChange}
                  required
                >
                  <option value="">Select</option>
                  {users.map((user) => (
                    <option key={user.id} value={user.id}>
                      {user.name}
                    </option>
                  ))}
                </Form.Select>
              </Form.Group>
              <Form.Group controlId="due_date">
                <Form.Label className="mt-3">Due date (in days)</Form.Label>
                <Form.Control
                  type="number"
                  name="due_date"
                  value={formData.due_date}
                  onChange={handleChange}
                  min="0"
                />
              </Form.Group>
            </Col>
          </Row>

          {/* Second Row - Empty, can be removed if not used */}
          <Row>
            <Col md={3}>
              {/* <Form.Group controlId="tradedOn">
                <Form.Label className="mt-3">Trade Created on</Form.Label>
                <Form.Control
                  type="date"
                  name="traded_on"
                  value={formData.traded_on}
                  onChange={handleChange}
                  required
                />
              </Form.Group> */}
            </Col>
            <Col md={3}></Col>
            <Col md={3}></Col>
          </Row>

          <div className="text-center mt-4">
            <Button
              variant="primary"
              type="submit"
              disabled={isSubmitting}
              style={{ minWidth: "150px", backgroundColor: "#1F325C" }}
            >
              {isSubmitting ? (
                <>
                  <Spinner
                    as="span"
                    animation="border"
                    size="sm"
                    role="status"
                    aria-hidden="true"
                    className="me-2"
                  />
                  {formData.id ? "Updating..." : "Submitting..."}
                </>
              ) : formData.id ? (
                "Update"
              ) : (
                "Submit"
              )}
            </Button>
          </div>
        </Form>
      </Container>

      <footer
        style={{
          position: "fixed",
          bottom: "0",
          left: "0",
          right: "0",
          backgroundColor: "#e9ecef",
          padding: "20px 0",
          textAlign: "center",
          borderTop: "2px solid #dee2e6",
          zIndex: 1000,
        }}
      >
        <p className="text-muted mb-0">Copyright © 2024 by Skarvi Systems</p>
      </footer>
    </div>
  );
};

export default AddNewTrade;
