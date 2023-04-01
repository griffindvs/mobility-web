import React, { useState } from 'react';

import { Row, Col, Card, Input } from 'reactstrap'
import RangeSlider from 'react-bootstrap-range-slider';

import './index.css';

const percentFeats = ['frac_coll_plus2000', 'frac_coll_plus2010', 'poor_share1990', 'poor_share2000', 'poor_share2010', 
    'emp2000', 'singleparent_share1990', 'singleparent_share2000', 'singleparent_share2010', 'traveltime15_2010'];

function FeatureSlider(props) {
    const initialVal = percentFeats.includes(props.id) ? props.feature["mean"]*100 : props.feature["mean"];
    const [ val, setVal ] = useState(initialVal); 

    function removeFeatureHandler() {
        props.removeFeature(props.id);
        props.handleSetValue(props.id, "nan");
    }

    function handleSetValue(val) {
        setVal(val);
        props.handleSetValue(props.id, parseInt(val));
    }

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