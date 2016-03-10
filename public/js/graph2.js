// $( document ).ready(function() {

(function() {
    var Chart, root,
    __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };

    Chart = (function() {
        function Chart (data) {

            this.width = 960,
            this.height = 900,
            this.padding = 2, // separation between same-color nodes
            this.clusterPadding = 6, // separation between different-color nodes
            this.maxRadius = 30;
            this.n = data.length, // total number of nodes
            this.m = data.length / 30 ; // number of distinct clusters. 30 is the number of entries per cluster

            this.color = d3.scale.category10().domain(d3.range(this.m));

            this.clusters = new Array(this.m);
            this.force = null; 
            this.nodes = this.createNodes(data, this);
            this.createPack();
            this.start();
            this.node = this.createGraph(); 

            console.log(this.node);
              
        }    

            Chart.prototype.createNodes = function (data, _this) {

                var nodes = data.map(function (i) {
                    if (!_this.clusters[i.cluster]) _this.clusters[i.cluster] = i;
                    return i;
                });
                return nodes
            };

            Chart.prototype.createPack = function () {
                return d3.layout.pack()
                        .sort(null)
                        .size([this.width, this.height])
                        .children(function(d) { return d.values; })
                        .value(function(d) { return d.size * d.size; })
                        .nodes({values: d3.nest()
                        .key(function(d) { return d.cluster; })
                        .entries(this.nodes)});
            };

            Chart.prototype.start = function() {
                return this.force = d3.layout.force()
                                    .nodes(this.nodes)
                                    .size([this.width, this.height])
                                    .gravity(.02)
                                    .charge(0)
                                    .on("tick", this.tick)
                                    .start();;
            };

            Chart.prototype.createGraph = function () {
                var that;
                var svg = d3.select("body").append("svg")
                                           .attr("width", this.width)
                                           .attr("height", this.height);

                that = this;
                var node = svg.selectAll(".node")
                                        .data(this.nodes)
                                        .enter().append("g")
                                        .attr("class", "node")
                                        .call(this.force.drag)

                                
                node.append("circle")
                            .attr("r", function(d) { return d.size * 20; })
                            .attr("class", "node")
                            .style("fill", function(d) { 
                                return that.color(d.cluster); })
                    
                node.append("text")
                            .attr("dy", ".3em")
                            .style("text-anchor", "middle")
                            .text(function(d) { return d.keyword.substring(0, d.size / 3); })

                node.transition()
                    .duration(1000)
                    .delay(function(d, i) { return i * 5; })
                    .attrTween("r", function(d) {
                    var i = d3.interpolate(1, d.size);
                    return function(t) { return d.size = i(t); };
                });
                return node;
            };

            Chart.prototype.tick = function (e) {

                this.node
                    .each(cluster(10 * e.alpha * e.alpha, this))
                    .each(collide(.19))
                    .attr("transform", function(d) { 
                        console.log(d);
                        return "translate(" + d.x + "," + d.y + ")"; })
            };

            Chart.prototype.cluster = function (alpha) {
                return function(d) {
                    var cluster = _this.clusters[d.cluster];
                    if (cluster === d) return;
                    var x = d.x - cluster.x,
                        y = d.y - cluster.y,
                        l = Math.sqrt(x * x + y * y),
                        r = d.radius + cluster.radius;
                    if (l != r) {
                        l = (l - r) / l * alpha;
                        d.x -= x *= l;
                        d.y -= y *= l;
                        cluster.x += x;
                        cluster.y += y;
                    }
                };
            };

                // Resolves collisions between d and all other circles.
            Chart.prototype.collide = function (alpha) {
                var quadtree = d3.geom.quadtree(this.nodes);
                return function(d) {
                    var r = d.radius + maxRadius + Math.max(padding, clusterPadding),
                        nx1 = d.x - r,
                        nx2 = d.x + r,
                        ny1 = d.y - r,
                        ny2 = d.y + r;
                    quadtree.visit(function(quad, x1, y1, x2, y2) {
                        if (quad.point && (quad.point !== d)) {
                            var x = d.x - quad.point.x,
                            y = d.y - quad.point.y,
                            l = Math.sqrt(x * x + y * y),
                            r = d.radius + quad.point.radius + (d.cluster === quad.point.cluster ? padding : clusterPadding);
                            if (l < r) {
                                l = (l - r) / l * alpha;
                                d.x -= x *= l;
                                d.y -= y *= l;
                                quad.point.x += x;
                                quad.point.y += y;
                            }
                        }
                        return x1 > nx2 || x2 < nx1 || y1 > ny2 || y2 < ny1;
                    });
                };
            };

            // Move d to be adjacent to the cluster node.
                
        return Chart;
    })();

    root = typeof exports !== "undefined" && exports !== null ? exports : this;

    $(function() {
        var chart, renderBubbles;
        chart = null;
        renderBubbles = function(data) {
            data = JSON.parse(data.responseText)
            chart = new Chart(data);

            chart.start();
            // return root.displayAll();
        };
        d3.xhr("http://localhost:3000/results", renderBubbles);
    });
}).call(this);

