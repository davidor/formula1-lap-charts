(function () {

    angular
        .module('f1_angular.directives')
        .directive('chart', Chart);

    function Chart() {

        return {
            restrict: 'EA', // the directive can be invoked only by using <my-directive> tag in the template
            scope: { // attributes bound to the scope of the directive
                raceResults: '='
            },
            link: function(scope){
                const DIMENSIONS = getWindowDimensions();
                const WIDTH = DIMENSIONS.width - 20;    // 20 => padding.
                const HEIGHT = DIMENSIONS.height - 60;  // 60 => legend, title and padding.
                const INSETS = {'left': 150, 'right': 150, 'top': 30, 'bottom': 30};
                const PADDING = {'left': 20, 'right': 20, 'top': 15, 'bottom': 15};
                const TICK_MARK_LENGTH = 8;
                const MARKER_RADIUS = 12;
                const SCALES = {};
                const TRANSITION_DURATION = 1000;
                const DIMMED_OPACITY = 0.3;
                const HIGHLIGHT_OPACITY = 1.0;
                const ZOOM_PEAK = 6.0;
                const ZOOM_SHOULDER = 3.0;
                var zoomed = false;


                scope.$watch('raceResults', function() {
                    // We need to make sure that we replace the current chart if there is any
                    d3.select("svg").remove();

                    if (scope.raceResults && scope.raceResults.laps) {
                        // Sort laps on finishing order.
                        scope.raceResults.laps.sort(function (a, b) {
                            var aLaps = a.placing.length;
                            var bLaps = b.placing.length;
                            return aLaps == bLaps ? a.placing[aLaps - 1] - b.placing[bLaps - 1] : bLaps - aLaps;
                        });

                        // Process lap markers
                        scope.raceResults.pitstops = processLapMarkers(scope.raceResults, "pitstops");
                        scope.raceResults.mechanical = processLapMarkers(scope.raceResults, "mechanical");
                        scope.raceResults.accident = processLapMarkers(scope.raceResults, "accident");
                        scope.raceResults.disqualified = processLapMarkers(scope.raceResults, "disqualified");

                        // Visualize the data.
                        visualize(scope.raceResults);
                    }
                });


                // Process lap markers.
                //
                // data: lap data.
                // key: marker key.
                function processLapMarkers(data, key) {
                    var markers = [];
                    var p = 0;
                    for (var i = 0; i < data.laps.length; i++) {
                        var lapData = data.laps[i];
                        var laps = lapData[key];
                        if (laps != undefined) {
                            for (var j = 0; j < laps.length; j++) {
                                var lap = laps[j];
                                var marker = {};
                                marker.start = lapData.placing[0];
                                marker.lap = lap;
                                marker.placing = lapData.placing[lap];
                                marker.name = lapData.name;
                                markers[p++] = marker;
                            }
                        }
                    }
                    return markers;
                }

                // Create the visualization.
                //
                // data the lap data object.
                //
                function visualize(data) {
                    configureScales(data);

                    // We need to make sure that we replace the current chart if there is any
                    d3.select("svg").remove();

                    var vis = d3.select('#chart')
                        .append('svg:svg')
                        .attr('width', WIDTH)
                        .attr('height', HEIGHT)
                        .attr('class', 'zoom');

                    // Background rect to catch zoom clicks.
                    vis.append('svg:rect')
                        .attr('class', 'zoom')
                        .attr('x', 0)
                        .attr('y', 0)
                        .attr('width', WIDTH)
                        .attr('height', HEIGHT)
                        .style('opacity', 0.0);

                    addSafetyElement(vis, data.safety);
                    addLappedElement(vis, data.lapped);
                    addLapTickLines(vis, data.lapCount);

                    // Lap labels.
                    addLapLabels(vis, data.lapCount, SCALES.y.range()[0] - PADDING.bottom, '0.0em', 'top');
                    addLapLabels(vis, data.lapCount, SCALES.y.range()[1] + PADDING.top, '0.35em', 'bottom');

                    // Add placings poly-lines.
                    addPlacingsLines(vis, data.laps);

                    // Add name labels.
                    addDriverLabels(vis, data.laps, 'pole', SCALES.x(0) - PADDING.right, 'end')
                        .attr('y', function (d) {
                            return SCALES.y(d.placing[0] - 1);
                        });
                    addDriverLabels(vis, data.laps, 'flag', SCALES.x(data.lapCount) + PADDING.left, 'start')
                        .attr('y', function (d, i) {
                            return SCALES.y(i);
                        });

                    // Add markers.
                    addMarkers(vis, data.pitstops, "pitstop", "P");
                    addMarkers(vis, data.mechanical, "mechanical", "M");
                    addMarkers(vis, data.accident, "accident", "X");
                    addMarkers(vis, data.disqualified, "disqualified", "D");

                    // Listen for clicks -> zoom.
                    vis.selectAll('.zoom')
                        .on("click", function() {
                            toggleZoom(vis, d3.mouse(this)[0]);
                        });
                }

                // Configure the scales.
                //
                // data: data set.
                //
                function configureScales(data) {
                    SCALES.x = d3.scale.linear()
                        .domain([0, data.lapCount])
                        .range([INSETS.left, WIDTH - INSETS.right]);

                    SCALES.y = d3.scale.linear()
                        .domain([0, data.laps.length - 1])
                        .range([INSETS.top, HEIGHT - INSETS.bottom]);

                    SCALES.clr = d3.scale.category20();
                }

                // Highlight driver.
                //
                // vis: the data visualization root.
                // index: index of driver to highlight.
                //
                function highlight(vis, name) {
                    // Dim others.
                    vis.selectAll('polyline')
                        .style('opacity', function(d) {
                            return d.name == name ? HIGHLIGHT_OPACITY : DIMMED_OPACITY;
                        });

                    vis.selectAll('circle')
                        .style('opacity', function(d) {
                            return d.name == name ? HIGHLIGHT_OPACITY : DIMMED_OPACITY;
                        });

                    vis.selectAll('text.label')
                        .style('opacity', function(d) {
                            return d.name == name ? HIGHLIGHT_OPACITY : DIMMED_OPACITY;
                        });
                }

                // Remove highlights.
                //
                // vis: the data visualization root.
                //
                function unhighlight(vis) {
                    // Reset opacity.
                    vis.selectAll('polyline')
                        .style('opacity', HIGHLIGHT_OPACITY);
                    vis.selectAll('circle')
                        .style('opacity', HIGHLIGHT_OPACITY);
                    vis.selectAll('text.label')
                        .style('opacity', HIGHLIGHT_OPACITY);
                }

                // Zoom/unzoom.
                //
                // vis: the data visualization root.
                // mouseX: x-coordinate of mouse click.
                //
                function toggleZoom(vis, mouseX) {
                    // Get lap of mouse-click position.
                    var lap = Math.round(SCALES.x.invert(mouseX));

                    // Clamp to domain.
                    var domain = SCALES.x.domain();
                    lap = Math.max(domain[0], Math.min(domain[1], lap));

                    // Specify transform.
                    var xform = zoomed ? unzoomXform : zoomXform;
                    zoomed = !zoomed;

                    // Transition tick lines.
                    vis.selectAll('line.tickLine')
                        .transition()
                        .duration(TRANSITION_DURATION)
                        .attr("x1", function(d) {
                            return SCALES.x(xform(d + 0.5, lap))
                        })
                        .attr("x2", function(d) {
                            return SCALES.x(xform(d + 0.5, lap))
                        });

                    // Transition tick labels.
                    vis.selectAll('text.lap')
                        .transition()
                        .duration(TRANSITION_DURATION)
                        .attr("x", function(d) {
                            return SCALES.x(xform(d, lap))
                        });

                    // Transition safety elements.
                    vis.selectAll('rect.safety')
                        .transition()
                        .duration(TRANSITION_DURATION)
                        .attr('x', function(d) {
                            return SCALES.x(xform(d - 0.5, lap));
                        })
                        .attr('width', function(d) {
                            return SCALES.x(xform(d + 0.5, lap)) - SCALES.x(xform(d - 0.5, lap));
                        });

                    // Transition lapped elements.
                    vis.selectAll('rect.lapped')
                        .transition()
                        .duration(TRANSITION_DURATION)
                        .attr('x', function(d, i) {
                            return SCALES.x(xform(i + 0.5, lap));
                        })
                        .attr('width', function(d, i) {
                            return SCALES.x(xform(i + 1.5, lap)) - SCALES.x(xform(i + 0.5, lap));
                        });

                    // Transition lapped elements.
                    vis.selectAll('polyline.placing')
                        .transition()
                        .duration(TRANSITION_DURATION)
                        .attr('points', function(d) {
                            var points = [];
                            for (var i = 0; i < d.placing.length; i++) {
                                points[i] = SCALES.x(xform(i, lap)) + ',' + SCALES.y(d.placing[i] - 1);
                            }

                            if (points.length > 0) {
                                points.push(SCALES.x(xform(i - 0.5, lap)) + ',' + SCALES.y(d.placing[i - 1] - 1));
                            }

                            return points.join(' ');
                        });

                    // Transition markers (circles).
                    vis.selectAll('circle.marker')
                        .transition()
                        .duration(TRANSITION_DURATION)
                        .attr('cx', function(d) {
                            return SCALES.x(xform(d.lap, lap));
                        });

                    // Transition markers (labels).
                    vis.selectAll('text.label.marker')
                        .transition()
                        .duration(TRANSITION_DURATION)
                        .attr('x', function(d) {
                            return SCALES.x(xform(d.lap, lap));
                        });
                }

                /**
                 * The zooming function is piecewise linear.  It divides the x-axis into several sections each of which is zoomed by
                 * a different amount.  The closer the zone is to the zoom centre, the higher the zoom factor.
                 *
                 * | NO ZOOM | ZOOM_SHOULDER | ZOOM_PEAK | ZOOM_SHOULDER | NO ZOOM |
                 *
                 * ZOOM_PEAK is applied where on the lap where the user clicked.
                 * ZOOM_SHOULDER is applied to the laps either side of this.
                 * No zoom is applied elsewhere.
                 *
                 * @param x the x-coordinate to transform using the zooming function.
                 * @param lap the lap the user clicked on.
                 */
                function zoomXform(x, lap) {
                    // The x-axis domain.
                    var domain = SCALES.x.domain();
                    var step = domain[1] - domain[0];

                    // What is the increment between each lap after zooming.
                    var inc = lap <= domain[0] || lap >= domain[1] ?
                        step / (ZOOM_PEAK + ZOOM_SHOULDER - 2.0 + step) :
                        step / (ZOOM_PEAK + 2.0 * ZOOM_SHOULDER - 3.0 + step);

                    // The zoom centre is mid-lap.
                    lap += 0.5;

                    // The transformed version of x.
                    var z = 0.0;

                    // Beyond upper shoulder.
                    if (x > lap + 1.0) z = (x + ZOOM_PEAK + 2.0 * ZOOM_SHOULDER - 3.0) * inc;

                    // Upper shoulder.
                    else if (x > lap) z = ((x - lap + 1.0) * ZOOM_SHOULDER + lap + ZOOM_PEAK - 2.0) * inc;

                    // Peak.
                    else if (x > lap - 1.0) z = ((x - lap + 1.0) * ZOOM_PEAK + lap + ZOOM_SHOULDER - 2.0) * inc;

                    // Lower shoulder.
                    else if (x > lap - 2.0)   z = ((x - lap + 2.0) * ZOOM_SHOULDER + lap - 2.0) * inc;

                    // Below lower shoulder.
                    else z = (x - domain[0]) * inc;

                    return z;
                }

                function unzoomXform(x) {
                    return x;
                }

                // Add safety car laps (rectangle elements).
                //
                // vis: the data visualization root.
                // data: safety car laps.
                //
                function addSafetyElement(vis, data) {
                    if (data != undefined) {
                        var y = SCALES.y.range()[0];
                        var height = SCALES.y.range()[1] - y;
                        var width = SCALES.x(1) - SCALES.x(0);

                        vis.selectAll('rect.safety')
                            .data(data)
                            .enter()
                            .append('svg:rect')
                            .attr('class', 'safety zoom')
                            .attr('x', function(d) {
                                return SCALES.x(d - 0.5);
                            })
                            .attr('y', function() {
                                return y;
                            })
                            .attr('height', function() {
                                return height;
                            })
                            .attr('width', function() {
                                return width;
                            });
                    }
                }

                // Add lapped rectangle elements.
                //
                // vis: the data visualization root.
                // data: the lapped data.
                //
                function addLappedElement(vis, data) {
                    if (data != undefined) {
                        var width = SCALES.x(1) - SCALES.x(0);

                        vis.selectAll('rect.lapped')
                            .data(data)
                            .enter()
                            .append('svg:rect')
                            .attr('class', 'lapped zoom')
                            .attr('x', function(d, i) {
                                return SCALES.x(i + 0.5);
                            })
                            .attr('y', function(d) {
                                return SCALES.y(d > 0 ? d - 1.5 : 0);
                            })
                            .attr('height', function(d) {
                                return d > 0 ? SCALES.y.range()[1] - SCALES.y(d - 1.5) : 0;
                            })
                            .attr('width', function(d) {
                                return d > 0 ? width : 0;
                            });
                    }
                }

                // Add lap tick-lines.
                //
                // vis: the data visualization root.
                // lapCount: number of laps.
                //
                function addLapTickLines(vis, lapCount) {
                    vis.selectAll('line.tickLine')
                        .data(SCALES.x.ticks(lapCount))
                        .enter().append('svg:line')
                        .attr('class', 'tickLine zoom')
                        .attr('x1', function(d) {
                            return SCALES.x(d + 0.5);
                        })
                        .attr('x2', function(d) {
                            return SCALES.x(d + 0.5);
                        })
                        .attr('y1', SCALES.y.range()[0] - TICK_MARK_LENGTH)
                        .attr('y2', SCALES.y.range()[1] + TICK_MARK_LENGTH)
                        .attr('visibility', function(d) {
                            return d <= lapCount ? 'visible' : 'hidden'
                        });
                }

                // Add lap labels.
                //
                // vis: the data visualization root.
                // data: lap data.
                // y: y position of labels.
                // dy: y offset.
                // cssClass: CSS class id.
                //
                function addLapLabels(vis, data, y, dy, cssClass) {
                    vis.selectAll('text.lap.' + cssClass)
                        .data(SCALES.x.ticks(data))
                        .enter().append('svg:text')
                        .attr('class', 'lap ' + cssClass + ' zoom')
                        .attr('x', function(d) {
                            return SCALES.x(d);
                        })
                        .attr('y', y)
                        .attr('dy', dy)
                        .attr('text-anchor', 'middle')
                        .text(function(d, i) {
                            return i > 0 ? i : '';
                        });
                }

                // Add placings polyline elements.
                //
                // vis: the visualization root.
                // laps: lap data.
                //
                function addPlacingsLines(vis, laps) {
                    vis.selectAll('polyline.placing')
                        .data(laps)
                        .enter()
                        .append('svg:polyline')
                        .attr('class', 'placing zoom')
                        .attr('points', function(d) {
                            var points = [];
                            for (var i = 0; i < d.placing.length; i++) {
                                points[i] = SCALES.x(i) + ',' + SCALES.y(d.placing[i] - 1);
                            }

                            if (points.length > 0) {
                                points.push(SCALES.x(i - 0.5) + ',' + SCALES.y(d.placing[i - 1] - 1));
                            }
                            return points.join(' ');
                        })
                        .style('stroke', function(d) {
                            return SCALES.clr(d.placing[0]);
                        })
                        .on('mouseover', function(d) {
                            highlight(vis, d.name);
                        })
                        .on('mouseout', function() {
                            unhighlight(vis);
                        });
                }

                // Add driver name labels.
                //
                // vis: the data visualization root.
                // laps: the lap data.
                // cssClass: CSS class id.
                // textAnchor: text-anchor value.
                //
                function addDriverLabels(vis, laps, cssClass, x, textAnchor) {
                    return vis.selectAll('text.label.' + cssClass)
                        .data(laps)
                        .enter()
                        .append('svg:text')
                        .attr('class', 'label ' + cssClass)
                        .attr('x', x)
                        .attr('dy', '0.35em')
                        .attr('text-anchor', textAnchor)
                        .text(function(d) {
                            return d.name;
                        })
                        .style('fill', function(d) {
                            return SCALES.clr(d.placing[0]);
                        })
                        .on('mouseover', function(d) {
                            highlight(vis, d.name);
                        })
                        .on('mouseout', function() {
                            unhighlight(vis);
                        });
                }

                // Add markers.
                //
                // vis: the visualization root.
                // data: marker data.
                // class: marker sub-class.
                // label: marker label.
                //
                function addMarkers(vis, data, cssClass, label) {
                    label = label || "P";

                    // Place circle glyph.
                    vis.selectAll("circle.marker." + cssClass)
                        .data(data)
                        .enter()
                        .append("svg:circle")
                        .attr("class", "marker " + cssClass + " zoom")
                        .attr("cx", function(d) {
                            return SCALES.x(d.lap);
                        })
                        .attr("cy", function(d) {
                            return SCALES.y(d.placing - 1);
                        })
                        .attr("r", MARKER_RADIUS)
                        .style("fill", function(d) {
                            return SCALES.clr(d.start);
                        })
                        .on('mouseover', function(d) {
                            highlight(vis, d.name);
                        })
                        .on('mouseout', function() {
                            unhighlight(vis);
                        });

                    // Place text
                    vis.selectAll("text.label.marker." + cssClass)
                        .data(data)
                        .enter()
                        .append("svg:text")
                        .attr("class", "label marker " + cssClass + " zoom")
                        .attr("x", function(d) {
                            return SCALES.x(d.lap);
                        })
                        .attr("y", function(d) {
                            return SCALES.y(d.placing - 1);
                        })
                        .attr("dy", "0.35em")
                        .attr("text-anchor", "middle")
                        .text(label)
                        .on('mouseover', function(d) {
                            highlight(vis, d.name);
                        })
                        .on('mouseout', function() {
                            unhighlight(vis);
                        });
                }

                function getWindowDimensions() {
                    var width = 630;
                    var height = 460;

                    if (document.body && document.body.offsetWidth) {
                        width = document.body.offsetWidth;
                        height = document.body.offsetHeight;
                    }

                    if (document.compatMode == 'CSS1Compat' && document.documentElement
                            && document.documentElement.offsetWidth) {
                        width = document.documentElement.offsetWidth;
                        height = document.documentElement.offsetHeight;
                    }

                    if (window.innerWidth && window.innerHeight) {
                        width = window.innerWidth;
                        height = window.innerHeight;
                    }

                    return {'width': width, 'height': height};
                }

            }
        };
    }

})();