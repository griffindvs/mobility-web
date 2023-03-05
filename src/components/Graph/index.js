import React, { Component } from 'react';

import './index.css';

import * as am5 from "@amcharts/amcharts5";
import * as am5xy from "@amcharts/amcharts5/xy";
import am5themes_Animated from "@amcharts/amcharts5/themes/Animated";


class Graph extends Component {
    componentDidMount() {
        let root = am5.Root.new("chartdiv");
        root.setThemes([
        am5themes_Animated.new(root)
        ]);
    
        var chart = root.container.children.push(am5xy.XYChart.new(root, {
            maxTooltipDistance: 0,
        }));
    
        var data = [
            {
                value: 0.1,
                probability: 0.3
            },
            {
                value: 0.5,
                probability: 0.4
            },
            {
                value: 0.9,
                probability: 0.3
            },
        ]
    
        // Create axes
        // https://www.amcharts.com/docs/v5/charts/xy-chart/axes/
        var xAxis = chart.xAxes.push(am5xy.ValueAxis.new(root, {
            min: 0,
            max: 1,
            renderer: am5xy.AxisRendererX.new(root, {})
        }));
    
        var yAxis = chart.yAxes.push(am5xy.ValueAxis.new(root, {
            min: 0,
            max: 1,
            renderer: am5xy.AxisRendererY.new(root, {})
        }));
    
    
        // Add series
        // https://www.amcharts.com/docs/v5/charts/xy-chart/series/
        for (var i = 0; i < 3; i++) {
            var series = chart.series.push(am5xy.SmoothedXLineSeries.new(root, {
                name: "Series " + i,
                xAxis: xAxis,
                yAxis: yAxis,
                valueYField: "probability",
                valueXField: "value",
                tooltip: am5.Tooltip.new(root, {
                    pointerOrientation: "horizontal",
                    labelText: "{valueY}"
                })
            }));
        
            series.data.setAll(data);
    
            series.appear();
        }
    
        // Add cursor
        // https://www.amcharts.com/docs/v5/charts/xy-chart/cursor/
        var cursor = chart.set("cursor", am5xy.XYCursor.new(root, {
            behavior: "none"
        }));
        cursor.lineY.set("visible", false);    
    
        var legend = chart.rightAxesContainer.children.push(am5.Legend.new(root, {
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
            if (chartSeries != series) {
            chartSeries.strokes.template.setAll({
                strokeOpacity: 0.15,
                stroke: am5.color(0x000000)
            });
            } else {
            chartSeries.strokes.template.setAll({
                strokeWidth: 3
            });
            }
        })
        })
    
        // When legend item container is unhovered, make all series as they are
        legend.itemContainers.template.events.on("pointerout", function(e) {
        var itemContainer = e.target;
        var series = itemContainer.dataItem.dataContext;
    
        chart.series.each(function(chartSeries) {
            chartSeries.strokes.template.setAll({
                strokeOpacity: 1,
                strokeWidth: 1,
                stroke: chartSeries.get("fill")
            });
        });
        })
    
        legend.itemContainers.template.set("width", am5.p100);
    
        legend.data.setAll(chart.series.values);

        chart.appear(1000, 100);
        this.root = root;
    }

    componentWillUnmount() {
        if (this.root) {
          this.root.dispose();
        }
    }

    render() {
        return (
            <div className="chartContainer">
                <div id="chartdiv"></div>
                <button type="button" className="btn btn-primary">Generate</button>
            </div>
        );
    }
}

export default Graph;