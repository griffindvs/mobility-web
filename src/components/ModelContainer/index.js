import React, { useState } from 'react';

import { 
    Container,
    Row, 
    Col,
    Nav,
    NavItem,
    NavLink
} from 'reactstrap'

import { Oval } from  'react-loader-spinner'

import './index.css';

import FeatureList from '../FeatureList';
import DistributionGraph from '../DistributionGraph';
import PredictionGraph from '../PredictionGraph';

import FEATURE_LIST from '../features.js';

const API = "https://734f-54-167-52-69.ngrok.io/predictions/";

const percentFeats = ['frac_coll_plus2000', 'frac_coll_plus2010', 'poor_share1990', 'poor_share2000', 'poor_share2010', 
    'emp2000', 'singleparent_share1990', 'singleparent_share2000', 'singleparent_share2010', 'traveltime15_2010'];

const initialFeatures = {};
Object.keys(FEATURE_LIST).forEach(function(key) {
    if (percentFeats.includes(key)) {
        initialFeatures[key] = FEATURE_LIST[key]['mean'] * 100;
    } else {
        initialFeatures[key] = FEATURE_LIST[key]['mean'];
    }
});

async function callApi(input, model) {
    const resp = await fetch(API + model, {
        method: "POST",
        mode: "cors",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(input),
      });
    return resp.json();
} 

function ModelContainer(props) {
    const [ loading, setLoading ] = useState(false);
    const [ distrGraphActive, setDistrGraphActive ] = useState(false);
    const [ curFeatures, setCurFeatures ] = useState(initialFeatures);
    const [ displayData, setDisplayData ] = useState({});

    function handleSetCurFeatures(fts) {
        setCurFeatures(fts);
    }

    function handleSetDistrGraphActive() {
        setDistrGraphActive(true);
    }
    function handleSetDistrGraphInactive() {
        setDistrGraphActive(false);
    }

    async function useModel() {
        let inArray = [];
        Object.entries(curFeatures).forEach(([key, value]) => {
            if (percentFeats.includes(key)) {
                value = value / 100;
            }
            
            inArray.push((value - FEATURE_LIST[key]['mean'])/FEATURE_LIST[key]['sd']);
        });
        let preparedInput = {
            "input": inArray
        };
        setLoading(true);

        const percentiles = ["25", "50", "75"]
        const responses = await Promise.all(
            percentiles.map(async p => {
                const res = await callApi(preparedInput, `${p}p_em_mdn`);
                return res;
            })
        )

        setLoading(false);
        setDisplayData({
            'p25': responses[0],
            'p50': responses[1],
            'p75': responses[2]
        });
    }

    return (
        <Container>
            <Container id="header">
                <h1 className="title">Mobility ML</h1>
                <h2 className="subtitle">Predict outcomes from neighborhood characteristics</h2>
                <p>All inputs are preset to the mean among all US <a href="https://www.census.gov/programs-surveys/geography/about/glossary.html#par_textimage_13">Census Tracts</a>.
                    If you wish to remove a feature from the input, press the "x" button. <br />
                    Removed features can be re-added using the search bar at the bottom of the page.
                </p>
            </Container>
            <Row className="mx-auto">
                <Col sm="12" lg="7">
                    <FeatureList curFeatures={curFeatures} handleSetCurFeatures={handleSetCurFeatures} />
                </Col>
                <Col sm="12" lg="5">
                    <Nav tabs>
                        <NavItem>
                            <NavLink href="#" active={!distrGraphActive} onClick={handleSetDistrGraphInactive} >Relative Mobility</NavLink>
                        </NavItem>
                        <NavItem>
                            <NavLink href="#" active={distrGraphActive} onClick={handleSetDistrGraphActive} >Probability Distributions</NavLink>
                        </NavItem>
                    </Nav>
                    { loading && 
                        <div id="spinner"><Oval
                            height={60}
                            width={60}
                            color="#263687"
                            wrapperStyle={{}}
                            wrapperClass=""
                            visible={true}
                            ariaLabel='oval-loading'
                            secondaryColor="#1a2457"
                            strokeWidth={5}
                            strokeWidthSecondary={5}
                        /></div>
                    }
                    { distrGraphActive && <DistributionGraph inData={displayData} reset={loading} /> }
                    { !distrGraphActive && <PredictionGraph inData={displayData} reset={loading} /> }
                    <button type="button" className="btn btn-primary" onClick={useModel}>Generate</button>
                    <p><br /><em>Note: Predictions take around 30 seconds to generate</em></p>
                </Col>
            </Row>
            <Container id="footer">
                <p>Griffin Davis &copy; 2023 | <a href="https://gcd.dev">gcd.dev</a></p>
            </Container>
        </Container>
    );
}

export default ModelContainer;