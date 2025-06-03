import React from "react";
import { Container, Row, Col, Card, Button, Breadcrumb  } from "react-bootstrap";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCirclePlus, faPenToSquare } from '@fortawesome/free-solid-svg-icons';
import "./Physicaltrades.css";
import { useNavigate } from "react-router-dom";

const PhysicalTrades: React.FC = () => {
  const navigate = useNavigate();

  return (
    <Container className="physical-trades-container" style={{ marginTop: "-12px" }}>
        {/* Breadcrumb Navigation */}
        <Breadcrumb className="mt-3">
        <Breadcrumb.Item active>Trades</Breadcrumb.Item> {/* Link to Trades */}
        <Breadcrumb.Item href="/physical-trades">Physical Trades</Breadcrumb.Item> {/* Current Page */}
      </Breadcrumb>
      <Row className="physical-trades-grid g-4">
        
        {/* Add Trade */}
        <Col xs={12} sm={6} md={4} lg={4}>
          <Card className="physical-trades-card">
            <Card.Body>
              <FontAwesomeIcon icon={faCirclePlus} className="physical-trades-icon" />
              <h3 className="physical-trades-card-title">Add Trade</h3>
              <p className="physical-trades-card-text">Create a new physical trade entry</p>
              <Button className="physical-trades-launch-button" onClick={() => navigate("/add-physical-trade")}>
                Launch
              </Button>
            </Card.Body>
          </Card>
        </Col>

        {/* Edit Trade (Odysseas) */}
        <Col xs={12} sm={6} md={4} lg={4}>
          <Card className="physical-trades-card">
            <Card.Body>
              <FontAwesomeIcon icon={faPenToSquare} className="physical-trades-icon" />
              <h3 className="physical-trades-card-title">Edit Trade</h3>
              <p className="physical-trades-card-text">Modify existing trade details</p>
              <Button className="physical-trades-launch-button" onClick={() => navigate("/edit-physical-trade")}>
                Launch
              </Button>
            </Card.Body>
          </Card>
        </Col>
        {/* Edit Trade (Odysseas) */}
        {/* <Col xs={12} sm={6} md={4} lg={4}>
          <Card className="physical-trades-card">
            <Card.Body>
              <FontAwesomeIcon icon={faPenToSquare} className="physical-trades-icon" />
              <h3 className="physical-trades-card-title">Edit Trade (Clean)</h3>
              <p className="physical-trades-card-text">Modify existing trade details</p>
              <Button className="physical-trades-launch-button" onClick={() => navigate("/Development")}>
                Launch
              </Button>
            </Card.Body>
          </Card>
        </Col> */}
      </Row>
    </Container>
  );
};

export default PhysicalTrades;
