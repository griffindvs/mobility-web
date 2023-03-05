import React, { useState } from 'react';

import './index.css';

import FEATURE_LIST from '../features.json';

import FeatureSearch from '../FeatureSearch';
import FeatureSlider from '../FeatureSlider';

function FeatureList(props) {
    const [features, setFeatures] = useState(
        ["hhinc_mean2000", "med_hhinc2016", "popdensity2010", "mean_commutetime2000", 
        "frac_coll_plus2010", "poor_share2010", "gsmn_math_g3_2013", "traveltime15_2010", 
        "emp2000", "singleparent_share2010"]);
    const [showAlert, setShowAlert] = useState(false);

    function handleAlert() {
        setShowAlert(showAlert => !showAlert);
    }

    function addFeatureHandler(id) {
        if (id !== '') {
            setFeatures(features => [...features, id]);
        }
    }

    function removeFeatureHandler(id) {
        if (features.length <= 10) {
            setShowAlert(true);
        }

        if (id !== '') {
            if (features.length === 0 || features.length === 1) {
                setFeatures([]);
            }

            setFeatures((cur) => {
                return cur.filter((item) => item !== id);
            });
        }
    }

    return (
        <div>
            { showAlert &&
                <div className="alert alert-danger alert-dismissible" role="alert">
                    <p className="alertText"><strong>Warning:</strong> The model requires at least 10 variables to be provided.</p>
                    <button type="button" className="alertClose" aria-label="Close" onClick={handleAlert}>
                        <span aria-hidden="true">&times;</span>
                    </button>
                </div>
            }
            {features.map((id, index)=>{
                return <FeatureSlider key={index} id={id} feature={FEATURE_LIST[id]} removeFeature={removeFeatureHandler}/>
            })}
            <FeatureSearch features={FEATURE_LIST} addFeature={addFeatureHandler} selected={features} />
        </div>
    );
}

export default FeatureList;