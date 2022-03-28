import { Row, Col, Card } from 'antd';
import React from 'react';
import logo from '../../logo.svg';

export default function HomePage() {
  return (
    <Row>
      <Col span={24}>
        <Card>
          <div className="App">
            <header className="App-header">
              <img src={logo} className="App-logo" alt="logo" />
              <p>
                Edit <code>src/App.tsx</code> and save to reload.
              </p>
              <a className="App-link" href="https://reactjs.org" target="_blank" rel="noopener noreferrer">
                Learn React
              </a>
            </header>
          </div>
        </Card>
      </Col>
    </Row>
  );
}
