// Example based on http://bl.ocks.org/mbostock/3887118
//Tooltip example from http://www.d3noob.org/2013/01/adding-tooltips-to-d3js-graph.html

var margin = {top: 20, right: 20, bottom: 30, left: 40},
    width = 960 - margin.left - margin.right,
    height = 500 - margin.top - margin.bottom;

// setup x
var xValue = function(d) { return d['loc.start.adj'];}, // data -> value
    xScale = d3.scale.linear().range([0, width]);
    xMapNum = function(num) {return xScale(num);};
    xAxis = d3.svg.axis().scale(xScale).orient("bottom").ticks(0);

// setup y
var yValue = function(d) { return d['seg.mean'];}, // data -> value
    yScale = d3.scale.linear().range([height, 0]), // value -> display
    yMapNum = function(num) {return yScale(num);};
    yAxis = d3.svg.axis().scale(yScale).orient("left");

// setup fill color
var cValue = function(d) { return d.Manufacturer;},
    color = d3.scale.category10();

// add the graph canvas to the body of the webpage
var svg = d3.select("body").append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
  .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

// add the tooltip area to the webpage
var tooltip = d3.select("body").append("div")
    .attr("class", "tooltip")
    .style("opacity", 1);


// load data
d3.csv("cbs_seg.csv", function(segs_error, data) {
  // change string (from CSV) into number format
  d3.csv('chrom_length.csv', function(chroms_error, chroms_data){
    chroms_data.forEach(function(d){
      process_chrom_data(d);
    });
    durp = lookup(chroms_data, 'chrom');

    data.forEach(function(d) {
      process_seg_data(d);
    });

    d3.tsv('all_reads.tsv', function(reads_error, reads_data){
      reads_data.forEach(function(d){
        process_reads_data(d);
      });

      // don't want dots overlapping axis, so add in buffer to data domain
      xScale.domain([d3.min(data, xValue)-1, d3.max(data, xValue)+1]);
      yScale.domain([d3.min(data, yValue)-1, d3.max(data, yValue)+1]);

      // x-axis
      svg.append("g")
          .attr("class", "x axis")
          .attr("transform", "translate(0," + height + ")")
          .call(xAxis);

      // y-axis
      svg.append("g")
          .attr("class", "y axis")
          .call(yAxis)
        .append("text")
          .attr("class", "label")
          .attr("transform", "rotate(-90)")
          .attr("y", 6)
          .attr("dy", ".71em")
          .style("text-anchor", "end")
          .text("seg mean");

    // chromosome rectangles
     var chr_rects = svg.selectAll()
        .data(chroms_data)
      .enter().append("g")
        .attr('class', 'chrom-rect');

      chr_rects.append('rect')
        .attr("x", function(d){return xMapNum(+d['offset']);})
        .attr("y", margin.top)
        .attr("width", function(d){ return xMapNum( d['length'] )+0.3;})
        .attr("height", height - 25)
        .style('fill', function(d, i){
          if(i%2 === 0){ return 'grey';}
          else{return 'black';}
        })
        .style('opacity', 0.2);

      chr_rects.append('text')
        .text(function(d){
          if(d['chrom'] === 23){return 'X';}
          return d['chrom'];})
        .attr('x', function(d){return xMapNum( d['offset'] );})
        .attr('y', margin.top - 10);

    // draw read dots
    svg.selectAll(".dot")
        .data(reads_data)
      .enter().append("circle")
        .attr("class", "dot")
        .attr("r", 1)
        .attr("cx", function(d){return(xMapNum(d['pos_adj']));})
        .attr("cy", function(d){return(yMapNum(d['seg_mean']));})
        .style("fill", 'green')
        .style("opacity", 0.1);


     var cn_lines = svg.selectAll()
        .data(data)
      .enter().append("g")
        .attr('class', 'cn-lines');

        // these are the lines that display
        cn_lines.append("line")
          .attr('class', 'display-line')
          .attr('data-range', function(d){return display_genome_range(d);})
          .attr("x1", function(d){return xMapNum(d['loc.start.adj']);})
          .attr("y1", function(d){return yMapNum(d['seg.mean']);})
          .attr("x2", function(d){return xMapNum(d['loc.end.adj']);})
          .attr("y2", function(d){return yMapNum(d['seg.mean']);})
          .attr("stroke-width", 2)
          .attr("stroke", "red");

        //these lines are invisible but wider than display lines to make mouseover easier
        cn_lines.append("line")
          .attr('class', 'line')
          .attr("x1", function(d){return xMapNum(d['loc.start.adj']);})
          .attr("y1", function(d){return yMapNum(d['seg.mean']);})
          .attr("x2", function(d){return xMapNum(d['loc.end.adj']);})
          .attr("y2", function(d){return yMapNum(d['seg.mean']);})
          .attr("stroke-width", 10)
          .attr("stroke", "red")
          .attr("opacity", 0)
          .on("mouseover", function(d) {
            selectedLine(d);
            tooltip.transition()
                 .duration(100)
                 .style("opacity", 0.9);
            tooltip.html( display_genome_range(d) + "<br />"
              + "<a target='_blank' href='" + make_ucsc_url(d) + "'> go to UCSC human genome browser </a>")
                 .style("left", (d3.event.pageX ) + "px")
                 .style("top", (d3.event.pageY + 10) + "px");
          });



        }); //end reads tsv
    }); // end  chroms csv
}); //end segs csv