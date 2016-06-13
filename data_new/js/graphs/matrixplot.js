var margin = {top: 20, right: 20, bottom: 30, left: 40},
    width = 1200 - margin.left - margin.right,
    height = 650 - margin.top - margin.bottom;
var matrix_width = 100;
var matrix_height = 180;
var graph_axis_text_width = 5;
/* Scales */
var x = d3.scale.ordinal().domain(d3.range(100)).rangeBands([0, width]);
var y = d3.scale.ordinal().domain(d3.range(180)).rangeBands([0, height]);

var data_transformation = function(matrix){
	for(i=0;i<matrix_height;i++){
		var total = 0;
		for(j=0;j<matrix_width;j++){ 
			total += matrix[i][j];
		}
		for(j=0;j<matrix_width;j++){
		        if(total){
		                matrix[i][j]={'value': matrix[i][j], 'percentage':(matrix[i][j]/total)*100};
		        }
		}
	}
	return matrix;
};

var init_graph = function(matrix){
	var graph_container = d3.select('#viz').append('svg')
		.attr('width', width + margin.left + margin.right)
		.attr('height', height + margin.top + margin.bottom)
		.style('margin-left', margin.left + 'px').append('g')
		.attr('transform', 'translate('  + graph_axis_text_width + ',' + (50 + graph_axis_text_width) + ')')
		.append('g');
	graph_container.append('rect').attr('class', 'background').attr('width', width).attr('height', height-50);
	var row = graph_container.selectAll('.row').data(matrix).enter().append('g').attr('class', 'row')
		        .attr('transform', function(d, i){
		                return  'translate(0,' + y(i) + ')';
		        }).attr('cohort', function(d, i)  { 
		                var date = time_format.parse(date_reverse_lookup[i]);
			        return time_format(date);
		        }).on('mouseover', function(d,i){
		                //Highlighting the row text
		                d3.selectAll(".row text").classed("active", function(d, i) { return false; });
		                d3.select(d3.selectAll('.row text')[0][i]).attr('class','active');
		        });
	row.selectAll('.cell').data(function(d) { return d; }).enter().append('rect').attr('class', 'cell')
		        .attr('x', function(d, i)  { 
		                return x(i); 
		        }).attr('width', x.rangeBand())
		        .attr('height', y.rangeBand())
			.attr('value', function(d, i)  { 
				return d.value; 
			}).attr('percentage', function(d, i)  { 
				return d.percentage; 
			})
		        .on('mouseover', function(d,i){
		                //Highlighting the column index
		                d3.selectAll(".column text").classed("active", function(d, i) { return false; });
		                d3.select(d3.selectAll('.column text')[0][i]).attr('class','active');
				
				var elem = d3.select(this);
				showTooltip(elem, '#viz g', ['percentage']);
			})
			.on('mouseout', function(){
				hideTooltip();
			});
	row.append('line').attr('x2', width);
	/*	
	row.append('text').attr('x', 0).attr('y', x.rangeBand() / 2).attr('dy', '.32em')
		.attr('text-anchor', 'end')
		.text(function(d,  i) {
		        var date = time_format.parse(date_reverse_lookup[i]);
		        return time_format(date);
		});
	*/
	var column = graph_container.selectAll('.column').data(matrix).enter().append('g').attr('class', 'column')
		.attr('transform', function(d, i)  { 
		        return 'translate(' + x(i) + ')rotate(-90)'; 
		});
	column.append('line').attr('x1', -width);
	/*	
	column.append('text').attr('x', 0).attr('y', x.rangeBand() / 2).attr('dy', '.32em')
		.attr('text-anchor', 'start')
		.text(function (d, i) { 
		        var date = time_format.parse(date_reverse_lookup[i]);
		        return time_format(date);
		});
	row.selectAll('.cell').data(function(d, i) { return matrix[i]; }).style('fill', z); */
	var brush_options ={
				'height': 30,
				'width': 1000,
				'domain': [0,100],
				'extent': [0,100],
				'ticks': 100,
				'round': 1,
	};
	init_brush(brush_options, make_filter(row,matrix,[0,0,0,100,100,100],['#ffffff', '#ffffff', '#e5f5f9','#00441b', '#ffffff', '#ffffff'], function(d){
		return 	d.percentage;
	}));
};

var annotate_graph = function(){
	createTooltip(['percentage']);
};

var init_page = function(){
	matrix = data_transformation(data);
	init_graph(matrix);
	annotate_graph();
};

$(function(){
	init_page();
});