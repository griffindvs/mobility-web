import React, { Component } from 'react';

import './index.css';

import * as am5 from "@amcharts/amcharts5";
import * as am5xy from "@amcharts/amcharts5/xy";
import am5themes_Animated from "@amcharts/amcharts5/themes/Animated";

function sd(array) {
    const n = array.length
    const mean = array.reduce((a, b) => a + b) / n
    return Math.sqrt(array.map(x => Math.pow(x - mean, 2)).reduce((a, b) => a + b) / n)
}

class PredictionGraph extends Component {
    buildChart() {
        // Prepare data
        var p25 = this.props.inData['p25'];
        var p50 = this.props.inData['p50'];
        var p75 = this.props.inData['p75'];

        var max_p25_prob = 0;
        var max_p25_est = 0;
        var p25_probs = [];
        for (let i = 0; i < p25.length; i++) {
            p25_probs.push(p25[i][1]);
            if (p25[i][1] > max_p25_prob) {
                max_p25_prob = p25[i][1];
                max_p25_est = p25[i][0];
            }
        }
        var p25_sd = sd(p25_probs);
        var p25_data = [
            {
                time: 'Parent',
                percentile: .25
            },
            {
                time: 'Child',
                percentile: max_p25_est,
                error: p25_sd
            }
        ];
        var max_p50_prob = 0;
        var max_p50_est = 0;
        var p50_probs = [];
        for (let i = 0; i < p50.length; i++) {
            p50_probs.push(p50[i][1]);
            if (p50[i][1] > max_p50_prob) {
                max_p50_prob = p50[i][1];
                max_p50_est = p50[i][0];
            }
        }
        var p50_sd = sd(p50_probs);
        var p50_data = [
            {
                time: 'Parent',
                percentile: .50
            },
            {
                time: 'Child',
                percentile: max_p50_est,
                error: p50_sd
            }
        ];
        var max_p75_prob = 0;
        var max_p75_est = 0;
        var p75_probs = [];
        for (let i = 0; i < p75.length; i++) {
            p75_probs.push(p75[i][1]);
            if (p75[i][1] > max_p75_prob) {
                max_p75_prob = p75[i][1];
                max_p75_est = p75[i][0];
            }
        }
        var p75_sd = sd(p75_probs);
        var p75_data = [
            {
                time: 'Parent',
                percentile: .75
            },
            {
                time: 'Child',
                percentile: max_p75_est,
                error: p75_sd
            }
        ];

        var chart = this.root.container.children.push(am5xy.XYChart.new(this.root, {
            maxTooltipDistance: 0
        }));

        // Create axes
        // https://www.amcharts.com/docs/v5/charts/xy-chart/axes/
        var xAxis = chart.xAxes.push(am5xy.CategoryAxis.new(this.root, {
            categoryField: "time",
            renderer: am5xy.AxisRendererX.new(this.root, {})
        }));
        xAxis.data.setAll(p25_data);

        var yAxis = chart.yAxes.push(am5xy.ValueAxis.new(this.root, {
            min: 0,
            max: 1,
            extraMin: 0.01,
            renderer: am5xy.AxisRendererY.new(this.root, {})
        }));

        // Clear any old series
        //chart.series.removeAll();

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
                valueYField: "percentile",
                categoryXField: "time",
                tooltip: am5.Tooltip.new(this.root, {
                    pointerOrientation: "horizontal",
                    labelText: "{valueY}"
                })
            }));
            series.strokes.template.setAll({
                strokeWidth: 4
            });

            series.data.setAll(data);

            var root = this.root;
            // add error bar
            // eslint-disable-next-line
            series.bullets.push(function() {
                var graphics = am5.Graphics.new(root, {
                  stroke: series.get("stroke"),
                  strokeWidth: 2,
                  draw: function(display, target) {
                    var dataItem = target.dataItem;
              
                    var error = dataItem.dataContext.error;
              
                    var yPosition0 = yAxis.valueToPosition(0);
                    var yPosition1 = yAxis.valueToPosition(error);
              
                    var height =
                      (yAxis.get("renderer").positionToCoordinate(yPosition1) - yAxis.get("renderer").positionToCoordinate(yPosition0)) / 2;
              
                    display.moveTo(0, -height);
                    display.lineTo(0, height);
              
                    display.moveTo(-10, -height);
                    display.lineTo(10, -height);
              
                    display.moveTo(-10, height);
                    display.lineTo(10, height);
                  }
                });
              
                return am5.Bullet.new(root, {
                  dynamic: true,
                  sprite: graphics
                });
            });

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
                    chartSeries.bullets.clear();
                    chartSeries.bullets.push(function() {
                        var graphics = am5.Graphics.new(root, {
                        strokeWidth: 2,
                        strokeOpacity: 0.15,
                        stroke: am5.color(0x000000),
                        draw: function(display, target) {
                            var dataItem = target.dataItem;
                    
                            var error = dataItem.dataContext.error;
                    
                            var yPosition0 = yAxis.valueToPosition(0);
                            var yPosition1 = yAxis.valueToPosition(error);
                    
                            var height =
                            (yAxis.get("renderer").positionToCoordinate(yPosition1) - yAxis.get("renderer").positionToCoordinate(yPosition0)) / 2;
                    
                            display.moveTo(0, -height);
                            display.lineTo(0, height);
                    
                            display.moveTo(-10, -height);
                            display.lineTo(10, -height);
                    
                            display.moveTo(-10, height);
                            display.lineTo(10, height);
                        }
                        });
                    
                        return am5.Bullet.new(root, {
                        dynamic: true,
                        sprite: graphics
                        });
                    });
                } else {
                    chartSeries.strokes.template.setAll({
                        strokeWidth: 5
                    });
                    chartSeries.bullets.clear();
                    chartSeries.bullets.push(function() {
                        var graphics = am5.Graphics.new(root, {
                          strokeWidth: 2,
                          stroke: chartSeries.get("stroke"),
                          draw: function(display, target) {
                            var dataItem = target.dataItem;
                      
                            var error = dataItem.dataContext.error;
                      
                            var yPosition0 = yAxis.valueToPosition(0);
                            var yPosition1 = yAxis.valueToPosition(error);
                      
                            var height =
                              (yAxis.get("renderer").positionToCoordinate(yPosition1) - yAxis.get("renderer").positionToCoordinate(yPosition0)) / 2;
                      
                            display.moveTo(0, -height);
                            display.lineTo(0, height);
                      
                            display.moveTo(-10, -height);
                            display.lineTo(10, -height);
                      
                            display.moveTo(-10, height);
                            display.lineTo(10, height);
                          }
                        });
                      
                        return am5.Bullet.new(root, {
                          dynamic: true,
                          sprite: graphics
                        });
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
                chartSeries.bullets.clear();
                chartSeries.bullets.push(function() {
                    var graphics = am5.Graphics.new(root, {
                      stroke: chartSeries.get("stroke"),
                      strokeWidth: 2,
                      draw: function(display, target) {
                        var dataItem = target.dataItem;
                  
                        var error = dataItem.dataContext.error;
                  
                        var yPosition0 = yAxis.valueToPosition(0);
                        var yPosition1 = yAxis.valueToPosition(error);
                  
                        var height =
                          (yAxis.get("renderer").positionToCoordinate(yPosition1) - yAxis.get("renderer").positionToCoordinate(yPosition0)) / 2;
                  
                        display.moveTo(0, -height);
                        display.lineTo(0, height);
                  
                        display.moveTo(-10, -height);
                        display.lineTo(10, -height);
                  
                        display.moveTo(-10, height);
                        display.lineTo(10, height);
                      }
                    });
                  
                    return am5.Bullet.new(root, {
                      dynamic: true,
                      sprite: graphics
                    });
                });
            });
        })

        legend.itemContainers.template.set("width", am5.p100);

        legend.data.setAll(chart.series.values);

        chart.appear(1000, 100);
    }

    componentDidMount() {
        let root = am5.Root.new("chartdiv_prediction");
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
            this.buildChart();
        }
    }

    render() {
        return (
            <div className="chartContainer">
                <h5>Percentile in the National Income Distribution</h5>
                <div id="chartdiv_prediction"></div>
            </div>
        );
    }
}

export default PredictionGraph;