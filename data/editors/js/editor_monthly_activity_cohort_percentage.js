/* Scales */
var x = d3.scale.ordinal().domain(d3.range(matrix_size)).rangeBands([0, graph_width]);

var highest = 1;

var data_transformation = function(matrix){
	//finding the first month

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
	column_width = d3.scale.linear().domain([0,100]).range([0,500]);
	
	//Adding the month counter
	for(i=0;i<matrix_size;i++){
		var month = 1;
		var first_month_found = 0;
		for(j=0;j<matrix_size;j++){
		        if(matrix[i][j]['value']){
		                first_month_found += 1;
		        }
		        //matrix[i][j]['month'] = j;
		        //month +=1;

		        if (first_month_found){
		                matrix[i][j]['month'] = month;
		                month += 1;
		        }
		}
	}

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
			matrix_rotated[i][j]['x']=counter;
			counter += column_width(matrix_rotated[i][j]['value']);
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
		.attr('transform', 'translate(' + graph_axis_text_width + ',' + (50) + ')')
		.append('g');
	graph_container.append('rect').attr('class', 'background').attr('width', width).attr('height', height-50);
	var row = graph_container.selectAll('.row').data(matrix).enter().append('g').attr('class', 'row')
		.attr('transform', function(d, i){
			return  'translate(0,' + x(i) + ')';
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
	}).attr('height', function(d,i){
		return x.rangeBand();
	}).attr('month', function(d,i){return d.month});
	row.append('line').attr('x2', graph_width);
	row.append('text').attr('x', 0).attr('y', x.rangeBand() / 2).attr('dy', '.32em')
	.attr('text-anchor', 'end').text(function(d,  i) {
		var date = time_format.parse(date_reverse_lookup[i])
		return time_format(date);
	});

	var column = graph_container.selectAll('.column').data(matrix).enter().append('g').attr('class', 'column')
	.attr('transform', function(d, i)  {
		return 'translate(' + x(i) + ')rotate(-90)';
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
	var title = 'Monthly Editor Activity % Split By Cohort - Stacked Bars';
	$('.title').text(title);
	
	//Adding Notes
	var notes = $('<ul><li>When an editor has edits >= 5/month the editor is considered active.</li>\
<li>Editors are grouped by the month in which they made their first edit.</li>\
<li>X-axis(month), Y-axis(editor group)</li>\
<li>Each row gives the total % of edit sessions in a given month. (Hence, It is always 100%) </li>\
<li>The bar in each row is split in % by the contribution from each article cohort.</li>\
<li>The selector lets you filter the graph by age of a cohort. The default selection is 1 - 179. The graph runs from Jan 01 - Dec 15 which is 180 months. Eg: If the selector is set to 1-2 the graph shows the no of edit sessions for cohorts of age 1 in each month, In month Jan 05 - cohort Jan 05 has age 1, Dec 04 has age 2 etc. </li>');
	$('#notes').append(notes);
};

var init_page = function(){
	matrix = data_transformation(matrix);
	init_graph(matrix);
	annotate_graph();
};
