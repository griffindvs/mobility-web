import React from 'react';

import { Container, Row, Col } from 'reactstrap'

import './index.css';

import FeatureList from '../FeatureList';
import Graph from '../Graph';

import { initializeApp } from 'firebase/app';
import { collection, addDoc, getFirestore, serverTimestamp } from 'firebase/firestore';
import firebaseConfig from "../../firebaseConfig.json";

class ModelContainer extends React.Component {
    constructor(props) {
        super(props);
        this.state = {

        };

        this.app = initializeApp(firebaseConfig);
        this.db = getFirestore(this.app);
    }

    componentDidMount() {

    }

    async handleSubmit() {
 
    }

    render() {
        return (
            <Container>
                <Container id="header">
                    <h1 className="title">Mobility ML</h1>
                    <h2 className="subtitle">Predict outcomes from neighborhood characteristics</h2>
                </Container>
                <Row className="mx-auto">
                    <Col sm="12" lg="7">
                        <FeatureList />
                    </Col>
                    <Col sm="12" lg="5">
                        <Graph />
                    </Col>
                </Row>
            </Container>
        );
    }
}

export default ModelContainer;