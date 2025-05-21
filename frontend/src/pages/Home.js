import React from 'react';
import { Container, Row, Col, Card } from 'react-bootstrap';

const Home = () => {
  return (
    <Container className="mt-4">
      <Row>
        <Col>
          <Card className="text-center p-5">
            <Card.Body>
              <Card.Title as="h2">Chào mừng đến với Cinema App</Card.Title>
              <Card.Text>
                Hệ thống quản lý lịch chiếu phim
              </Card.Text>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default Home;