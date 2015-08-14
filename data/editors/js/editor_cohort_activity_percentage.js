/* Scales */
var x = d3.scale.ordinal().domain(d3.range(matrix_size)).rangeBands([0, width]);


var data_transformation = function(matrix){
	for(i=0;i<matrix_size;i++){
		var total = 0;
		for(j=0;j<matrix_size;j++){ 
		        	total += matrix[i][j];
		}
		for(j=0;j<matrix_size;j++){
		        if(total){
		                console.log(i,j, matrix[i][j], Math.round((matrix[i][j]/total)*100));
		                matrix[i][j]=(matrix[i][j]/total)*100;
		        }
		}
	}
	for(i=0;i<matrix_size;i++){
		var month = 1;
		for(j=0;j<matrix_size;j++){
			var data ={};
			if(matrix[i][j]){
				data['value'] = matrix[i][j];
				data['month'] = month;
				month +=1;
			}
			else{
				data['value'] = 0;
			}
			matrix[i][j] = data;
		}
	}
	
	//Global scale for variable column width
	column_width = d3.scale.linear().domain([0,100]).range([0,500]);
	
	for(i=0;i<matrix_size;i++){
		var counter = 0;
		for(j=0;j<matrix_size;j++){
			matrix[i][j]['x']=counter;
			counter += column_width(matrix[i][j]['value']);
		}
	}

	return matrix;
};

var init_graph = function(matrix){
	//Over riding height & width
	var margin = {top: 30, right: 20, bottom: 20, left: 40};
	var width = 1600 - margin.right - margin.left, height = 1350 - margin.top - margin.right;
	
	var graph_container = d3.select('#viz').append('svg').attr('width', width + margin.left + margin.right)
		.attr('height', height + margin.top + margin.bottom).style('margin-left', margin.left + 'px').append('g')
		.attr('transform', 'translate(' + margin.left + ',' + (margin.top+50) + ')')
		.append('g');
	graph_container.append('rect').attr('class', 'background').attr('width', width).attr('height', height-50);
	var row = graph_container.selectAll('.row').data(matrix).enter().append('g').attr('class', 'row')
		.attr('transform', function(d, i){
			return  'translate(0,' + x(i) + ')';
		}).attr('cohort', function(d, i)  { 
		                var date = time_format.parse(date_reverse_lookup[i]);
			        return time_format(date);
		}).on('mouseover', function(d,i){
			d3.selectAll('.row text').classed('active', function(d, i) { return false; });
			d3.select(this).select('text').attr('class','active');
		});
	row.selectAll('.cell').data(function(d){
		return d;
		}).enter().append('rect').attr('class', 'cell')
		.attr('x', function(d, i)  {
			return d.x;
		}).attr('width', function(d,i){
			return column_width(d.value);
		})
		.attr('height', function(d,i){
			return x.rangeBand();
		});
	row.append('line').attr('x2', width);
	row.append('text').attr('x', -6).attr('y', x.rangeBand() / 2).attr('dy', '.32em')
		.attr('text-anchor', 'end').text(function(d,  i) {
			var date = time_format.parse(date_reverse_lookup[i]);
		        return time_format(date);
		});
	var column = graph_container.selectAll('.column').data(matrix).enter().append('g').attr('class', 'column')
		.attr('transform', function(d, i)  {
			return 'translate(' + x(i) + ')rotate(-90)';
		});
	var brush_options ={
				'height': 30,
				'width': 1800,
				'domain': [0,179],
				'extent': [0,179],
				'ticks': 180,
				'round': 1,
	};
	init_brush(brush_options, make_filter(row,matrix,[1,1,1,179,179,179],['#ffffff', '#ffffff', '#deebf7','#3182bd', '#ffffff', '#ffffff'], function(d){
		return 	d.month;	
	}));
};
var annotate_graph = function(){
	//Adding Title
	var title = 'Editor Cohort Activity Value  X-axis(value), Y-axis(time)';
	$('.title').text(title);
	
	//Adding Notes
	var notes = $('<p>Active editor = >=5 edits/month</p>\
		<p>Editor birth = month of first edit</p>\
		<p>Each horizontal line gives the total activity for a cohort.</p>');
	$('#notes').append(notes);
	createTooltip();
};

var init_page = function(){
	matrix = data_transformation(matrix);
	init_graph(matrix);
	annotate_graph();
};
