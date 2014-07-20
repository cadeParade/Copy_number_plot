var genomeLength = 3088269832;


var selectedLine = function(d){
  d3.selectAll('.display-line').attr("stroke", "red");
  return d3.selectAll('[data-range="' + display_genome_range(d) + '"]').attr("stroke", 'blue');
};

var check_x_y = function(d, field){
  if(d[field] === 'X'){return 23;}
  if(d[field] === 'Y'){return 24;}
  else{return +d[field];}
};

var process_chrom_data = function(d){
  d['chrom'] = check_x_y(d, 'chrom');
  d['chrom'] = +d['chrom'];
  d['length'] = +d['length'];
  return(d);
};

var process_seg_data = function(d){
  //convert to number and calculate adjusted start and end points
  d['chrom_num'] = d['chrom'].substring(3);
  d['chrom_num'] = check_x_y(d, 'chrom_num');
  d['loc.start'] = +d['loc.start'];
  d['loc.end'] = +d['loc.end'];
  d['seg.mean'] = +d['seg.mean'];

  var offset = +durp[d['chrom_num']].offset;
  d['loc.start.adj'] = d['loc.start'] + offset;
  d['loc.end.adj'] = d['loc.end'] + offset;

  return(d);
};

var process_reads_data = function(d){
  d['chrom_num'] = check_x_y(d, 'chrom_num');
  d['pos'] = +d['pos'];
  d['pos_adj'] = +d['pos_adj'];
  d['seg_mean'] = +d['seg_mean'];
  return(d)
}


var display_genome_range = function(d){
  return  d["chrom"] + ":" + d['loc.start'] + "-" + d['loc.end'];
};

var make_ucsc_url = function(d){
  return "https://genome.ucsc.edu/cgi-bin/hgTracks?db=hg19&position="  + display_genome_range(d);
};

var lookup = function(arr, key){ //rearranges array of objects into object with key as lookup for object
  var lookup_h = {};
  for (var i = 0, len = arr.length; i < len; i++) {
      lookup_h[arr[i][key]] = arr[i];
  }
  return lookup_h;
};
