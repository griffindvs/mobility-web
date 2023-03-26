import React, { useState, useEffect } from 'react';

import { Row, Col, Card, Input } from 'reactstrap'
import RangeSlider from 'react-bootstrap-range-slider';

import './index.css';

function FeatureSlider(props) {
    let initial = 0;
    if (props.feature.min !== 0 && props.feature.max !== 0) {
        initial = Math.floor((props.feature.max + props.feature.min) / 2)
    }

    const [ val, setVal ] = useState(0); 

    function removeFeatureHandler() {
        props.removeFeature(props.id);
    }

    function handleSetValue(val) {
        setVal(val);
        props.handleSetValue(props.id, parseInt(val));
    }

    useEffect(() => {
        handleSetValue(initial);
        // eslint-disable-next-line
    }, []);

    return (
        <Card>
            <div id="sliderLabelContainer">
                <span id="sliderLabel">{props.feature.name}</span>
                <span id="sliderRemove" className="material-symbols-outlined" onClick={removeFeatureHandler}>close</span>
            </div>
            <Row id="sliderGroup" style={{paddingRight: '1rem', paddingTop: '0.25rem'}}>
                <Col xs="3" md="2">
                    <span id="sliderNum" style={{float: 'right'}}>{(props.feature.min).toLocaleString("en-US")}</span>
                </Col>
                <Col xs="6" md="6">
                    <RangeSlider
                        min={props.feature.min}
                        max={props.feature.max}
                        value={val}
                        onChange={changeEvent => handleSetValue(changeEvent.target.value)}
                        tooltip='off'
                    />
                </Col>
                <Col xs="3" md="2" style={{paddingRight: '0'}} >
                    <span id="sliderNum" style={{paddingRight: '0rem', float: 'left'}}>{(props.feature.max).toLocaleString("en-US")}</span>
                </Col>
                <Col xs="12" md="2" id="numInput">
                    <Input type="number" value={val} onChange={changeEvent => handleSetValue(changeEvent.target.value)}></Input>
                </Col>
            </Row>
        </Card>
    );
}

export default FeatureSlider;