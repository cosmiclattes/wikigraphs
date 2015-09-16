/* Scales */
var x = d3.scale.ordinal().domain(d3.range(matrix_size)).rangeBands([0, graph_width]);

var highest = 1;

var data_transformation = function(matrix){

	for(i=0;i<matrix_size;i++){
		var total = 0;
		for(j=0;j<matrix_size;j++){
			total += matrix[j][i];
		}
		for(j=0;j<matrix_size;j++){
			var data ={};
			if(total){
				data['value'] = (matrix[j][i]/total)*100;
			}
			else{
				data['value'] = 0;
			}
			matrix[j][i] = data;
		}
	}
	
	//Global scale for variable column width
	column_width = d3.scale.linear().domain([0,100]).range([0,450]);

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
			matrix_rotated[i][j]['y']=450-counter;
		}
	}
	
	//Adding the month counter
	for(i=0;i<matrix_size;i++){
		var month = 1;
		var first_month_found = 0;
		for(j=0;j<matrix_size;j++){
		        if(matrix_rotated[i][j]['value']){
		                first_month_found = 1;
		        }
		        //matrix[i][j]['month'] = j;
		        //month +=1;

		        if (first_month_found){
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
	graph_container.append('rect').attr('class', 'background').attr('width', width).attr('height', height-50);
	var row = graph_container.selectAll('.row').data(matrix).enter().append('g').attr('class', 'row')
		.attr('transform', function(d, i){
			return  'translate(' + x(i) + ',0)';
		}).attr('month', function(d, i)  { 
		                var date = time_format.parse(date_reverse_lookup[i]);
			        return time_format(date);
	        }).on('mouseover', function(d,i){
			d3.selectAll('.column text').classed('active', function(d, i) { return false; });
			d3.select(d3.selectAll('.column text')[0][i]).attr('class','active');
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
        }).attr('cohort', function(d, i)  { 
                var date = time_format.parse(date_reverse_lookup[matrix_size -1 -i]);
	        return time_format(date);
        })
	.attr('month', function(d, i)  { 
                var row = d3.select(this.parentNode);
	        return row.attr('month');
        }).on('mouseover', function(d,i){
		var elem = d3.select(this);
		showTooltip(elem, '#viz g');
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
	//Adding Title
	var title = 'Monthly Article Edit Activity % Split By Cohort';
	$('.title').text(title);
	
	//Adding Notes
	var notes = $('<ul><li>When an article has edits >= 5/month by logged in editors the article is considered active.</li>\
<li>Articles are grouped by the month in which they were created.</li>\
<li>X-axis (time since the start of the wiki in months)</li>\
<li>Y-axis (% contribution split by the cohorts of active articles in the month.)</li>\
<li>The previous graph showed the total active articles in a month split by their cohorts. Here each column shows the contribution of each cohort in a month as a % of the total in the month.</li>\
<li>The brush lets you filter the graph by the age of a cohort in a month. For ex, to see the contribution of only cohorts of age 1 month in every month we select 1-2 in the brush. This lets us see the contribution of the active articles created in a month to the total active articles in the given month in %.</li>');
	$('#notes').append(notes);
	createTooltip();
};

var init_page = function(){
	matrix = data_transformation(matrix);
	init_graph(matrix);
	annotate_graph();
};
