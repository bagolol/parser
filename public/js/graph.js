

    var Chart = function() {
      this.width = 760,
      this.height = 500,
      this.format = d3.format(",d"),
      this.color = d3.scale.category20c();

      this.center = {
            x: this.width / 2,
            y: this.height / 2
          };
      this.week_centers = {
          "current": {
            x: this.width / 3,
            y: this.height / 2
          },
          "previous": {
            x: this.width / 2,
            y: this.height / 2
          }
        };
      this.layout_gravity = -0.01;
      this.damper = 0.1;
      this.vis = null;
      this.nodes = [];
      this.force = null;
      this.circles = null;
    };

    var svg = d3.select('.chart').append('svg')
                  .attr('width', width)
                  .attr('height', height);

    var bubble = d3.layout.pack()
              .size([width, height])
              .value(function(d) {return d.size;})
              .sort(function(a, b) {
               return -(a.value - b.value)
              })
              .padding(1);

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
          .text(function(d) { return d.className + ": " + format(d.value); });

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
