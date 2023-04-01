import React, { useState } from 'react';

import { Card, InputGroup, InputGroupText, Input } from 'reactstrap'

import './index.css';

import FEATURE_LIST from '../features';

function Scroll(props) {
    if (props.display) {
        return ( 
            <div id="searchResultScroll" style={{overflowY: 'scroll', height: '20vh'}}>
                {props.children}
            </div>
        );
    }

}

function SearchResult(props) {
    function handleOnClick() {
        props.add(props.id);
    }

    return (
        <div id="searchResultContainer" onClick={handleOnClick}>
            <span id="searchResultText">{props.name}</span>
        </div>
    );
}

const fts = Object.keys(FEATURE_LIST);

function FeatureSearch(props) {
    const [displayScroll, setDisplayScroll] = useState(false);
    const [query, setQuery] = useState("");
    const [filtered, setFiltered] = useState(fts);

    function toggleScroll() {
        setDisplayScroll(!displayScroll);
        setFiltered(fts.filter(
            item => {
              return (
                !props.selected.includes(item)
              );
            }
        ));
    }

    function hideScroll() {
        // setDisplayScroll(false);
    }

    function addFeatureHandler(id) {
        props.addFeature(id);
    }

    function handleSearch(event) {
        event.persist();
        setQuery(event.target.value);

        if (query === '') {
            setFiltered(fts);
            return;
        }

        setFiltered(fts.filter((f) => {
            return (f.toLowerCase().includes(query.toLowerCase()) && !props.selected.includes(f))
        }));
    }

    return (
        <Card onClick={toggleScroll} onMouseLeave={hideScroll}>
            <InputGroup>
                <InputGroupText>
                    <span className="material-symbols-outlined">search</span>
                </InputGroupText>
                <Input placeholder="Add a characteristic" value={query} onChange={handleSearch} />
                <div id="searchExpand">
                    <span className="material-symbols-outlined" onClick={toggleScroll}>
                        { displayScroll ? 'expand_less' : 'expand_more' }
                    </span>
                </div>
            </InputGroup>
            <Scroll id="scroll" display={displayScroll}>
                {filtered.map((item, index) => {
                    return <SearchResult add={addFeatureHandler} key={index} id={item} name={FEATURE_LIST[item]['name']}/>
                })}
            </Scroll>
        </Card>
    );
}

export default FeatureSearch;