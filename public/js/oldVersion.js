
    function renderBubbles(data) {
        console.log(data);
        var width = 960,
            height = 900,
            padding = 2, // separation between same-color nodes
            clusterPadding = 6, // separation between different-color nodes
            maxRadius = 30;

        var n = 100, // total number of nodes
            m = 5; // number of distinct clusters

        var color = d3.scale.category10()
            .domain(d3.range(m));

        // The largest node for each cluster.
        var clusters = new Array(m);

        var nodes = data.map(function (i) {
            clusters[i] = i;
            return i;
        });


        // var nodes = d3.range(n).map(function() {
        //     console.log(n);
        //     var i = Math.floor(Math.random() * m),
        //         r = Math.sqrt((i + 1) / m * -Math.log(Math.random())) * maxRadius,
        //         n = "rocco"
        //         d = {cluster: i, radius: r, name: n };
        //     if (!clusters[i] || (r > clusters[i].radius)) clusters[i] = d;
        //     return d;
        // });

        // console.log(nodes);

        // Use the pack layout to initialize node positions.
        d3.layout.pack()
            .sort(function(a, b) {
                    return b.value - a.value;
                })
            .size([width, height])
            .children(function(d) { return d.values; })
            .value(function(d) { return d.size * d.size; })
            .nodes({values: d3.nest()
            .key(function(d) { return d.cluster; })
            .entries(nodes)});


        var force = d3.layout.force()
            .nodes(nodes)
            .size([width, height])
            .gravity(.02)
            .charge(0)
            .on("tick", tick)
            .start();

        var svg = d3.select("body").append("svg")
            .attr("width", width)
            .attr("height", height);

        var node = svg.selectAll(".node")
                                .data(nodes)
                                .enter().append("g")
                                .attr("class", "node")
                                .call(force.drag)
                                
        node.append("circle")
                    .attr("r", function(d) { return d.size; })
                    .attr("class", "node")
                    .style("fill", function(d) { return color(d.cluster); })
                    
        node.append("text")
                    .attr("dy", ".3em")
                    .style("text-anchor", "middle")
                    .text(function(d) { return d.name.substring(0, d.size / 3); })

        node.transition()
            .duration(1000)
            .delay(function(d, i) { return i * 5; })
            .attrTween("r", function(d) {
            var i = d3.interpolate(1, d.size);
            return function(t) { return d.size = i(t); };
        });

        function tick(e) {
            node
                .each(cluster(10 * e.alpha * e.alpha))
                .each(collide(.19))
                .attr("transform", function(d) { return "translate(" + d.x + "," + d.y + ")"; })
        }

        // Move d to be adjacent to the cluster node.
        function cluster(alpha) {
            return function(d) {
                var cluster = clusters[d.cluster];
                if (cluster === d) return;
                var x = d.x - cluster.x,
                    y = d.y - cluster.y,
                    l = Math.sqrt(x * x + y * y),
                    r = d.size + cluster.size;
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
        function collide(alpha) {
            var quadtree = d3.geom.quadtree(nodes);
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
    };
// $( document ).ready(function() {

    function loadData (){
        d3.xhr("http://localhost:3000/results", function (data) {
            console.log(data;)
        }
        });
            // renderBubbles);
    }
// });