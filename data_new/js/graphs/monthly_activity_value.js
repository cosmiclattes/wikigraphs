/* Scales */
var x = d3.scale.ordinal().domain(d3.range(matrix_size)).rangeBands([0, graph_width]);

var highest = 1;
var tooltip_elements = ['total'];
var data_transformation = function(matrix){
	//finding the first month

	for(i=0;i<matrix_size;i++){
		var total = 0;
		for(j=0;j<matrix_size;j++){
			if(matrix[j][i]>highest){
				highest = matrix[j][i];
			}
			total += matrix[j][i];
		}
		console.log('Total' , total);
		for(j=0;j<matrix_size;j++){
			var data ={};
			data['value'] = matrix[j][i];
			data['total'] = total;
			matrix[j][i] = data;
		}
	}
	
	//Global scale for variable column width
	column_width = d3.scale.linear().domain([0,highest]).range([0,100]);

	//Creating new array
	matrix_rotated = new Array(matrix_size);
	for(i=0;i<matrix_size;i++){
		matrix_rotated[i]= new Array(matrix_size);
	}

	//rotating the matrix -90
	for(i=0;i<matrix_size;i++){
		for(j=0;j<matrix_size;j++){
		        matrix_rotated[i][j] = matrix[matrix_size-j-1][i];
		}
	}

	for(i=0;i<matrix_size;i++){
		var counter = 0;
		for(j=0;j<matrix_size;j++){
			counter += column_width(matrix_rotated[i][j]['value']);
			matrix_rotated[i][j]['y']=500-counter;
		}
	}
	
	//Adding the month counter
	for(i=0;i<matrix_size;i++){
		var month = 1;
		var first_month_found = 0;
		for(j=0;j<matrix_size;j++){
			/*
		        if(matrix_rotated[i][j]['value']){
		                first_month_found += 1;
		        }
			*/
		        if (i+j >= matrix_size-1){
		                matrix_rotated[i][j]['month'] = month;
		                month += 1;
		        }
		}
	}
	
	return matrix_rotated;
};

var init_graph = function(matrix){
	//Over riding height & width
	var margin = {top: 30, right: 20, bottom: 20, left: 15};
	var width = 2050 - margin.right - margin.left, height = 1410 - margin.top - margin.right;

	var graph_container = d3.select('#viz').append('svg').attr('width', width + margin.left + margin.right)
		.attr('height', height + margin.top + margin.bottom).style('margin-left', margin.left + 'px').append('g')
		.attr('transform', 'translate(' + graph_axis_text_width + ',' + (50 + graph_axis_text_width) + ')')
		.append('g');
	graph_container.append('rect').attr('class', 'background').attr('width', graph_width).attr('height', height-50);
	var row = graph_container.selectAll('.row').data(matrix).enter().append('g').attr('class', 'row')
		.attr('transform', function(d, i){
			return  'translate(' + x(i) + ',0)';
		}).on('mouseover', function(d,i){
			d3.selectAll('.column text').classed('active', function(d, i) { return false; });
			d3.select(d3.selectAll('.column text')[0][i]).attr('class','active');
		}).attr('month', function(d, i)  { 
		                var date = time_format.parse(date_reverse_lookup[i]);
			        return time_format(date);
	        });

	row.selectAll('.cell').data(function(d){
		return d;
	}).enter().append('rect').attr('class', 'cell')
	.attr('y', function(d, i)  {
		return d.y;
	}).attr('width', function(d,i){
		return x.rangeBand();
	}).attr('height', function(d,i){
		return column_width(d.value);
	}).attr('value', function(d, i)  { 
                return d['value']; 
        }).attr('total', function(d, i)  { 
                return d['total']; 
        }).attr('cohort', function(d, i)  { 
                var date = time_format.parse(date_reverse_lookup[matrix_size -1 -i]);
	        return time_format(date);
        })
	.attr('month', function(d, i)  { 
                var row = d3.select(this.parentNode);
	        return row.attr('month');
        }).on('mouseover', function(d,i){
		var elem = d3.select(this);
		showTooltip(elem, '#viz g', tooltip_elements);
	}).on('mouseout', function(){
		hideTooltip();
	});
	
	var column = graph_container.selectAll('.column').data(matrix).enter().append('g').attr('class', 'column')
	.attr('transform', function(d, i)  {
		return 'translate(' + x(i) + ')rotate(-90)';
	});
	
	column.append('line').attr('x1', -width);
	column.append('text').attr('x', 0).attr('y', x.rangeBand() / 2).attr('dy', '.32em')
		.attr('text-anchor', 'start')
		.text(function (d, i) { 
		        var date = time_format.parse(date_reverse_lookup[i]);
		        return time_format(date);
		});
	
	var brush_options ={
				'height': 30,
				'width': 2000,
				'domain': [1,179],
				'extent': [1,179],
				'ticks': 180,
				'round': 1,
	};
	init_brush(brush_options, make_filter(row,matrix,[1,1,1,179,179,179],['#ffffff', '#ffffff', '#deebf7','#3182bd', '#ffffff', '#ffffff'], function(d){
		return 	d.month;	
	}));
};
var annotate_graph = function(){
	createTooltip();
};

var init_page = function(){
	matrix = data_transformation(data);
	init_graph(matrix);
	createTooltip(tooltip_elements);
};

window.onload = function(){
	init_page();
};
