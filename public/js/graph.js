

(function() {
  	var Chart, root,
    __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };

	Chart = (function() {
		function Chart(data) {
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
				        radius: _this.radiusScale(d.size),
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


		Chart.prototype.createVis = function() {
		    var that;
		    this.vis = d3.select(".chart")
		    						.append("svg")
	                                .attr("width", this.width)
	                                .attr("height", this.height)
	                                .attr("id", "svg_vis");
	        that = this;

		    this.circles = this.vis.selectAll(".node")
		                                    .data(this.nodes, function(d) {return d.name;})
		                                    .enter().append("g")
		                                    .attr("class", "circle")
		                                    .append("circle")
						                    .attr("r", 0)
						                    .attr("fill", function(d){
						                    	return that.color(d.name); 
						                    })
		    this.circles.append("text")
		    			.text(function(d) { return d.name.substring(0, d.radius / 3); })
	                    .attr("r", 0)
	                    .attr("fill", function(d){
	                    	return that.color("test"); 
	                    });
				
		    return this.circles.transition().duration(3000).attr("r", function(d) {
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
		    return this.hideWeeks();
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
		    this.force.gravity(this.layoutGravity).charge(this.charge).friction(0.9).on("tick", (function(_this) {
		        return function(e) {
		            return _this.circles.each(_this.moveTowardsWeek(e.alpha)).attr("cx", function(d) {
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
		            d.x = d.x + (target.x - d.x) * (_this.damper + 0.1) * alpha * 1.1;
		            return d.y = d.y + (target.y - d.y) * (_this.damper + 0.1) * alpha * 1.1;
		        };
		    })(this);
		};

		Chart.prototype.displayWeeks = function() {
		    var weeks, weeksData, weeksPosition;
		    weeksPosition = {
		        "previous": 160,
		        "current": this.width / 2
		    };
		    weeksData = d3.keys(weeksPosition);
		    weeks = this.vis.selectAll(".weeks").data(weeksData);
		    return weeks.enter().append("text").attr("class", "weeks").attr("x", (function(_this) {
		        return function(d) {
		            return weeksPosition[d];
		        };
		    })(this)).attr("y", 40).attr("text-anchor", "middle").text(function(d) {
		        return d;
		    });
		};

		Chart.prototype.hideWeeks = function() {
		    var weeks;
		    return weeks = this.vis.selectAll(".weeks").remove();
		};

		return Chart;
	})();

	root = typeof exports !== "undefined" && exports !== null ? exports : this;


	$(function() {
		var chart, renderVis;
		chart = null;
		renderVis = function(data) {
			data = JSON.parse(data.responseText)
			chart = new Chart(data.children);
			chart.start();
			return root.displayAll();
		};
		root.displayAll = (function(_this) {
			return function() {
			    return chart.displayGroupAll();
			};
		})(this);
		root.displayWeek = (function(_this) {
			return function() {
			    return chart.displayByWeek();
			};
		})(this);
		root.toggle_view = (function(_this) {
			return function(view_type) {
			    if (view_type === 'year') {
					return root.display_year();
			    } else {
					return root.display_all();
			    }
			};
		})(this);
		return d3.xhr("http://localhost:3000/results", renderVis);
	});
}).call(this);
