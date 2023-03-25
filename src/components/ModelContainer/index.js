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

const API = "https://632b-54-167-52-69.ngrok.io/predictions/";

const initialFeatures = {
    "hhinc_mean2000": "nan",
    "med_hhinc2016": "nan",
    "med_hhinc1990": "nan",
    "popdensity2010": "nan",
    "popdensity2000": "nan",
    "mean_commutetime2000": "nan",
    "frac_coll_plus2010": "nan",
    "frac_coll_plus2000": "nan",
    "poor_share2010": "nan",
    "poor_share2000": "nan",
    "poor_share1990": "nan",
    "gsmn_math_g3_2013": "nan",
    "traveltime15_2010": "nan",
    "emp2000": "nan",
    "singleparent_share2010": "nan",
    "singleparent_share2000": "nan",
    "singleparent_share1990": "nan",
    "mail_return_rate2010": "nan",
    "jobs_total_5mi_2015": "nan",
    "jobs_highpay_5mi_2015": "nan",
    "job_density_2013": "nan",
    "ann_avg_job_growth_2004_2013": "nan"
}

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

    const percentFeats = ['frac_coll_plus2010', 'poor_share2010', 'emp2000', 'singleparent_share2010', 'traveltime15_2010'];
    async function useModel() {
        let inArray = [];
        Object.entries(curFeatures).forEach(([key, value]) => {
            if (percentFeats.includes(key)) {
                value = value / 100;
            }
            
            inArray.push(value);
        });
        let preparedInput = {
            "input": inArray
        };
        setLoading(true);
        let p25 = await callApi(preparedInput, "25p_em_mdn");
        let p50 = await callApi(preparedInput, "50p_em_mdn");
        let p75 = await callApi(preparedInput, "75p_em_mdn");
        setLoading(false);
        setDisplayData({
            'p25': p25,
            'p50': p50,
            'p75': p75
        });
    }

    return (
        <Container>
            <Container id="header">
                <h1 className="title">Mobility ML</h1>
                <h2 className="subtitle">Predict outcomes from neighborhood characteristics</h2>
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
                </Col>
            </Row>
        </Container>
    );
}

export default ModelContainer;