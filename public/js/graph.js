

var Chart = function(data) {
    this.data = data;
    this.width = 760;
    this.height = 500;
    this.format = d3.format(",d");
    this.color = d3.scale.category20c();

    this.center = {
        x: this.width / 2,
        y: this.height / 2
      };
    this.weekCenters = {
      "current": {
        x: this.width / 3,
        y: this.height / 2
      },
      "previous": {
        x: this.width / 2,
        y: this.height / 2
      }
    };
    this.layoutGravity = -0.01;
    this.damper = 0.1;
    this.vis = null;
    this.nodes = [];
    this.force = null;
    this.circles = null;
    maxAmount = d3.max(this.data, function(d) {
    return d.size;
    });
    this.radiusScale = d3.scale.pow().exponent(0.5).domain([0, maxAmount]).range([2, 85]);
    this.createNodes();
    this.createVis();
};

Chart.prototype.createNodes = function() {
  this.data.forEach((function(_this) {
    return function(d) {
      var node;
      node = {
        radius: _this.radiusScale(d.size)),
        value: d.size,
        name: d.keyword,
        week: d.week,
        x: Math.random() * 900,
        y: Math.random() * 800
      };
      return _this.nodes.push(node);
    };
  })(this));
  return this.nodes.sort(function(a, b) {
    return b.value - a.value;
  });
};


Chart.prototype.create_vis = function() {
    var that;
    this.vis = d3.select(".chart").append("svg")
                                .attr("width", this.width)
                                .attr("height", this.height)
                                .attr("id", "svg_vis");
    this.circles = this.vis.selectAll("circle")
                                    .data(this.nodes, function(d) {
                                        return d.id;
                                    });
    that = this;
    this.circles.enter()
                    .append("circle")
                    .attr("r", 0)
                    // vedere come era fatto nella funzione originale. potrebbero esserci problemi di this
                    .style("fill", function(d) { return this.color(d.name); });
                    .attr("id", function(d) {return "bubble_" + d.id;}
    return this.circles.transition().duration(2000).attr("r", function(d) {
        return d.radius;
    });
};

Chart.prototype.charge = function(d) {
    return -Math.pow(d.radius, 2.0) / 8;
};

Chart.prototype.start = function() {
    return this.force = d3.layout.force().nodes(this.nodes).size([this.width, this.height]);
};

Chart.prototype.displayGroupAll = function() {
    this.force.gravity(this.layoutGravity).charge(this.charge).friction(0.9).on("tick", (function(_this) {
        return function(e) {
            return _this.circles.each(_this.moveTowardsCenter(e.alpha)).attr("cx", function(d) {
            return d.x;
            }).attr("cy", function(d) {
                return d.y;
            });
        };
    })(this));
    this.force.start();
    return this.hide_weeks();
};


Chart.prototype.moveTowardsCenter = function(alpha) {
    return (function(_this) {
        return function(d) {
            d.x = d.x + (_this.center.x - d.x) * (_this.damper + 0.02) * alpha;
            return d.y = d.y + (_this.center.y - d.y) * (_this.damper + 0.02) * alpha;
        };
    })(this);
};

Chart.prototype.displayByWeek = function() {
    this.force.gravity(this.layout_gravity).charge(this.charge).friction(0.9).on("tick", (function(_this) {
        return function(e) {
            return _this.circles.each(_this.move_towards_year(e.alpha)).attr("cx", function(d) {
                return d.x;
            }).attr("cy", function(d) {
                return d.y;
            });
        };
    })(this));
    this.force.start();
    return this.displayWeeks();
};

Chart.prototype.moveTowardsWeek = function(alpha) {
    return (function(_this) {
        return function(d) {
            var target;
            target = _this.weekCenters[d.week];
            d.x = d.x + (target.x - d.x) * (_this.damper + 0.02) * alpha * 1.1;
            return d.y = d.y + (target.y - d.y) * (_this.damper + 0.02) * alpha * 1.1;
        };
    })(this);
};

Chart.prototype.displayWeeks = function() {
    var weeks, weeks_data, weeks_x;
    weeks_x = {
        "2008": 160,
        "2009": this.width / 2,
        "2010": this.width - 160
    };
    weeks_data = d3.keys(weeks_x);
    weeks = this.vis.selectAll(".weeks").data(weeks_data);
    return weeks.enter().append("text").attr("class", "weeks").attr("x", (function(_this) {
        return function(d) {
            return weeks_x[d];
        };
    })(this)).attr("y", 40).attr("text-anchor", "middle").text(function(d) {
        return d;
    });
};

Chart.prototype.hideWeeks = function() {
    var weeks;
    return weeks = this.vis.selectAll(".weeks").remove();
};


    $.ajax({
      url: "http://localhost:3000/results",
      success: function(data){

        var nodes = svg.selectAll(".node")
          .data(bubble.nodes(data)
          .filter(function(d) { return !d.children; }))
          .enter().append("g")
          .attr("class", "node")
          .attr("transform", function(d) { return "translate(" + d.x + "," + d.y + ")"; });

        // var force = d3.layout.force()
        //     .gravity(0.05)
        //     .charge(function(d, i) { return i ? 0 : -2000; })
        //     .nodes(nodes)
        //     .size([width, height]);

        // force.start();

        nodes.append("title")
          .text(function(d) { return d.className + ": " + format(d.size); });

        nodes.append("circle")
          .attr("r", 0)
          .transition().duration(1000).attr("r", function (d) {return d.r})
          .style("fill", function(d) { return color(d.name); });

        nodes.append("text")
          .attr("dy", ".3em")
          .style("text-anchor", "middle")
          .style("font-size", "x-small")
          .text(function(d) { return d.name.substring(0, d.r / 3); });
      }
    });
