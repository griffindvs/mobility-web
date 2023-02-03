import React, { useState } from 'react';

import './index.css';

import FEATURE_LIST from '../features.json';

import FeatureSearch from '../FeatureSearch';
import FeatureSlider from '../FeatureSlider';

function FeatureList(props) {
    const [features, setFeatures] = useState([]);

    function addFeatureHandler(id) {
        if (id !== '') {
            setFeatures(features => [...features, id]);
        }
    }

    function removeFeatureHandler(id) {
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
            {features.map((id, index)=>{
                return <FeatureSlider key={index} id={id} feature={FEATURE_LIST[id]} removeFeature={removeFeatureHandler}/>
            })}
            <FeatureSearch features={FEATURE_LIST} addFeature={addFeatureHandler} selected={features} />
        </div>
    );
}

export default FeatureList;