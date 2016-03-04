var diameter = 960,
format = d3.format(",d"),
color = d3.scale.category20c();

var svg = d3.select('.chart svg');



$( document ).ready(function() {
	  	

    	console.log(svg[0][0]);
    	
    	if (svg[0][0] === null) {
    		svg = d3.select('.chart')
    				.append('svg')
                    .attr('width', diameter)
                    .attr('height', diameter);
    	}


    	var bubble = d3.layout.pack()
            .size([diameter, diameter])
            .value(function(d) {return d.size;})
         	.sort(function(a, b) {
            					return -(a.value - b.value)
            				}) 
            .padding(10);
  
		$.ajax({
			url: "http://localhost:3000/results", 
			success: function(data){

				var node = svg.selectAll(".node")
					.data(bubble.nodes(data)
					.filter(function(d) { return !d.children; }))
					.enter().append("g")
					.attr("class", "node")
					.attr("transform", function(d) { return "translate(" + d.x + "," + d.y + ")"; });

				node.append("title")
					.text(function(d) { return d.name + ": " + format(d.value); });

				node.append("circle")
					.attr("r", function(d) { return d.r; })
					.style("fill", function(d) { return color(d.name); });

				node.append("text")
					.attr("dy", ".5em")
					.style("text-anchor", "middle")
					.style("font-size", "x-small")
					.text(function(d) { return d.name.substring(0, d.r / 3); });
			}
		});
	});