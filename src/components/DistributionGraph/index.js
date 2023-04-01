import React, { Component } from 'react';

import './index.css';

import * as am5 from "@amcharts/amcharts5";
import * as am5xy from "@amcharts/amcharts5/xy";
import am5themes_Animated from "@amcharts/amcharts5/themes/Animated";


class DistributionGraph extends Component {
    buildChart() {
        // Prepare data
        var p25 = this.props.inData['p25'];
        var p50 = this.props.inData['p50'];
        var p75 = this.props.inData['p75'];
        
        var p25_data = [];
        for (let i = 0; i < p25.length; i++) {
            p25_data.push({
                value: p25[i][0],
                probability: p25[i][1]
            })
        }
        var p50_data = [];
        for (let i = 0; i < p50.length; i++) {
            p50_data.push({
                value: p50[i][0],
                probability: p50[i][1]
            })
        }
        var p75_data = [];
        for (let i = 0; i < p75.length; i++) {
            p75_data.push({
                value: p75[i][0],
                probability: p75[i][1]
            })
        }

        var chart = this.root.container.children.push(am5xy.XYChart.new(this.root, {
            maxTooltipDistance: 0,
        }));

        // Create axes
        // https://www.amcharts.com/docs/v5/charts/xy-chart/axes/
        var xAxis = chart.xAxes.push(am5xy.ValueAxis.new(this.root, {
            min: 0,
            max: 1,
            renderer: am5xy.AxisRendererX.new(this.root, {})
        }));
    
        var yAxis = chart.yAxes.push(am5xy.ValueAxis.new(this.root, {
            min: 0,
            max: 1,
            renderer: am5xy.AxisRendererY.new(this.root, {})
        }));

        // Add series
        // https://www.amcharts.com/docs/v5/charts/xy-chart/series/
        for (var i = 0; i < 3; i++) {
            let name;
            let data;
            if (i === 0) {
                name = "25th Percentile";
                data = p25_data;
            } else if (i === 1) {
                name = "50th Percentile";
                data = p50_data;
            } else if (i === 2) {
                name = "75th Percentile";
                data = p75_data;
            }

            var series = chart.series.push(am5xy.SmoothedXLineSeries.new(this.root, {
                name: name,
                xAxis: xAxis,
                yAxis: yAxis,
                valueYField: "probability",
                valueXField: "value",
                tooltip: am5.Tooltip.new(this.root, {
                    pointerOrientation: "horizontal",
                    labelText: "({valueX}, p={valueY})"
                })
            }));
            series.strokes.template.setAll({
                strokeWidth: 4
            });
        
            series.data.setAll(data);
    
            series.appear();
        }

        // Add cursor
        // https://www.amcharts.com/docs/v5/charts/xy-chart/cursor/
        var cursor = chart.set("cursor", am5xy.XYCursor.new(this.root, {
            behavior: "none"
        }));
        cursor.lineY.set("visible", false);    
    
        var legend = chart.rightAxesContainer.children.push(am5.Legend.new(this.root, {
            width: 100,
            paddingLeft: 15,
            height: am5.percent(100)
        }));
    
        // When legend item container is hovered, dim all the series except the hovered one
        legend.itemContainers.template.events.on("pointerover", function(e) {
        var itemContainer = e.target;
    
        // As series list is data of a legend, dataContext is series
        var series = itemContainer.dataItem.dataContext;
    
        chart.series.each(function(chartSeries) {
            if (chartSeries !== series) {
            chartSeries.strokes.template.setAll({
                strokeOpacity: 0.15,
                stroke: am5.color(0x000000)
            });
            } else {
            chartSeries.strokes.template.setAll({
                strokeWidth: 5
            });
            }
        })
        })
    
        // When legend item container is unhovered, make all series as they are
        legend.itemContainers.template.events.on("pointerout", function(e) {
            chart.series.each(function(chartSeries) {
                chartSeries.strokes.template.setAll({
                    strokeOpacity: 1,
                    strokeWidth: 4,
                    stroke: chartSeries.get("fill")
                });
            });
        })
    
        legend.itemContainers.template.set("width", am5.p100);
    
        legend.data.setAll(chart.series.values);

        chart.appear(1000, 100);
    }

    componentDidMount() {
        let root = am5.Root.new("chartdiv_distribution");
        root.setThemes([
            am5themes_Animated.new(root)
        ]);

        this.root = root;

        if (this.props.inData['p25']) {
            this.buildChart();
        }
    }

    componentWillUnmount() {
        if (this.root) {
            this.root.dispose();
        }
    }

    componentDidUpdate() {
        if (this.props.inData['p25']) {
            this.root.dispose();

            let root = am5.Root.new("chartdiv_prediction");
            root.setThemes([
                am5themes_Animated.new(root)
            ]);

            this.root = root;

            this.buildChart();
        }
    }

    render() {
        return (
            <div className="chartContainer">
                <h5>Probability Distribution of Percentile Predictions</h5>
                <div id="chartdiv_distribution"></div>
            </div>
        );
    }
}

export default DistributionGraph;