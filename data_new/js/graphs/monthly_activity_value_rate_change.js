/* Scales */
var x = d3.scale.ordinal().domain(d3.range(matrix_size)).rangeBands([0, graph_width]);

var highest = 1;

var tooltip_elements = ['month', 'value', 'cohort', 'change'];
/* Scales */
var x = d3.scale.ordinal().domain(d3.range(matrix_size)).rangeBands([0, graph_width]);

var highest = 1;

var data_transformation = function(matrix){
	//finding the first month
	//Creating new array
	matrix_trn = new Array(matrix_size);
	for(i=0;i<matrix_size;i++){
		matrix_trn[i]= new Array(matrix_size);
		for(j=0;j<matrix_size;j++){
			matrix_trn[i][j]= {'value': 0, 'change': 0, 'change_val': 0};
		}
	}	

	for(i=0;i<matrix_size;i++){
		value_prev = matrix[i][0];
		for(j=1;j<matrix_size;j++){
	                console.log(i,j, matrix[i][j], Math.round((matrix[i][j])*100));
			value_curr = matrix[i][j];
			change_val = value_curr-value_prev
			if(value_prev){
				change=((change_val)/value_prev)*100;
			}
			else{
				change = 0;
			}
			value_prev = value_curr;
			if(change<0){
				change = change;
			}
			else{
				change = change;
			}
			if(highest < value_curr){
				highest = value_curr;
			}
			matrix_trn[i][j]={'value': value_curr, 'change':change, 'change_val': change_val};
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
		        matrix_rotated[i][j] = matrix_trn[matrix_size-j-1][i];
		}
	}

	for(i=0;i<matrix_size;i++){
		var counter = 0;
		for(j=0;j<matrix_size;j++){
			counter += column_width(matrix_rotated[i][j]['value']);
			matrix_rotated[i][j]['y']=500-counter;
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
	}).attr('change', function(d, i)  { 
                return d['change']; 
        
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
	
	var z = d3.scale.linear().domain([-100,0,100]).range(['red','#ffffff','#00441b']).clamp(true);
	row.selectAll('.cell').data(function(d, i) { return matrix[i]; }).style('fill', function(d,i){return z(d.change)});
};
var annotate_graph = function(){
	createTooltip(tooltip_elements);
};

var init_page = function(){
	matrix = data_transformation(data);
	init_graph(matrix);
	annotate_graph();
};

window.onload = function(){
	init_page();
};
