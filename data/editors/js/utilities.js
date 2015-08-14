var date_reverse_lookup={
0:"Jan 01",
1:"Feb 01",
2:"Mar 01",
3:"Apr 01",
4:"May 01",
5:"Jun 01",
6:"Jul 01",
7:"Aug 01",
8:"Sep 01",
9:"Oct 01",
10:"Nov 01",
11:"Dec 01",
12:"Jan 02",
13:"Feb 02",
14:"Mar 02",
15:"Apr 02",
16:"May 02",
17:"Jun 02",
18:"Jul 02",
19:"Aug 02",
20:"Sep 02",
21:"Oct 02",
22:"Nov 02",
23:"Dec 02",
24:"Jan 03",
25:"Feb 03",
26:"Mar 03",
27:"Apr 03",
28:"May 03",
29:"Jun 03",
30:"Jul 03",
31:"Aug 03",
32:"Sep 03",
33:"Oct 03",
34:"Nov 03",
35:"Dec 03",
36:"Jan 04",
37:"Feb 04",
38:"Mar 04",
39:"Apr 04",
40:"May 04",
41:"Jun 04",
42:"Jul 04",
43:"Aug 04",
44:"Sep 04",
45:"Oct 04",
46:"Nov 04",
47:"Dec 04",
48:"Jan 05",
49:"Feb 05",
50:"Mar 05",
51:"Apr 05",
52:"May 05",
53:"Jun 05",
54:"Jul 05",
55:"Aug 05",
56:"Sep 05",
57:"Oct 05",
58:"Nov 05",
59:"Dec 05",
60:"Jan 06",
61:"Feb 06",
62:"Mar 06",
63:"Apr 06",
64:"May 06",
65:"Jun 06",
66:"Jul 06",
67:"Aug 06",
68:"Sep 06",
69:"Oct 06",
70:"Nov 06",
71:"Dec 06",
72:"Jan 07",
73:"Feb 07",
74:"Mar 07",
75:"Apr 07",
76:"May 07",
77:"Jun 07",
78:"Jul 07",
79:"Aug 07",
80:"Sep 07",
81:"Oct 07",
82:"Nov 07",
83:"Dec 07",
84:"Jan 08",
85:"Feb 08",
86:"Mar 08",
87:"Apr 08",
88:"May 08",
89:"Jun 08",
90:"Jul 08",
91:"Aug 08",
92:"Sep 08",
93:"Oct 08",
94:"Nov 08",
95:"Dec 08",
96:"Jan 09",
97:"Feb 09",
98:"Mar 09",
99:"Apr 09",
100:"May 09",
101:"Jun 09",
102:"Jul 09",
103:"Aug 09",
104:"Sep 09",
105:"Oct 09",
106:"Nov 09",
107:"Dec 09",
108:"Jan 10",
109:"Feb 10",
110:"Mar 10",
111:"Apr 10",
112:"May 10",
113:"Jun 10",
114:"Jul 10",
115:"Aug 10",
116:"Sep 10",
117:"Oct 10",
118:"Nov 10",
119:"Dec 10",
120:"Jan 11",
121:"Feb 11",
122:"Mar 11",
123:"Apr 11",
124:"May 11",
125:"Jun 11",
126:"Jul 11",
127:"Aug 11",
128:"Sep 11",
129:"Oct 11",
130:"Nov 11",
131:"Dec 11",
132:"Jan 12",
133:"Feb 12",
134:"Mar 12",
135:"Apr 12",
136:"May 12",
137:"Jun 12",
138:"Jul 12",
139:"Aug 12",
140:"Sep 12",
141:"Oct 12",
142:"Nov 12",
143:"Dec 12",
144:"Jan 13",
145:"Feb 13",
146:"Mar 13",
147:"Apr 13",
148:"May 13",
149:"Jun 13",
150:"Jul 13",
151:"Aug 13",
152:"Sep 13",
153:"Oct 13",
154:"Nov 13",
155:"Dec 13",
156:"Jan 14",
157:"Feb 14",
158:"Mar 14",
159:"Apr 14",
160:"May 14",
161:"Jun 14",
162:"Jul 14",
163:"Aug 14",
164:"Sep 14",
165:"Oct 14",
166:"Nov 14",
167:"Dec 14",
168:"Jan 15",
169:"Feb 15",
170:"Mar 15",
171:"Apr 15",
172:"May 15",
173:"Jun 15",
174:"Jul 15",
175:"Aug 15",
176:"Sep 15",
177:"Oct 15",
178:"Nov 15",
179:"Dec 15",
};
var make_filter = function(row, matrix, domain, range, fn){
		//Getting the max value, fix this in a better way
		var max_domain = domain[5];
	return function(extent){
		var start = extent[0];
		var end = extent[1];
		if(end < max_domain){
			end = extent[1] + 0.00001 - 1;
		}
		else{
			end = extent[1] + 0.00001;
		}
		domain[1]=start;
		domain[2]=start;
		domain[3]=end;
		domain[4]=end;
		console.log('domain', domain);
		z = d3.scale.linear().domain(domain).range(range).clamp(true);
		var color = function(d,i){
			if(fn(d)){
				return z(fn(d));
			}
			else{
				return '#ffffff';
			}
		};
		row.selectAll('.cell').data(function(d, i) { 
						return d;
					}).transition().delay(function(d,i){return i*20;}).duration(500)/*.ease('exp')*/.style('fill', color);
	};
};

var showTooltip = function(elem, containerSelector) {
	var coordinates = d3.mouse(d3.select('body')[0][0]);
	var x = coordinates[0];
	var y = coordinates[1];

	var bodyRect = document.body.getBoundingClientRect();
	var elemRect = elem[0][0].getBoundingClientRect();
	var topOffset  = elemRect.top - bodyRect.top;
	var leftOffset  = elemRect.left - bodyRect.left;
	//Set first location of tooltip and change opacity
	var xpos = x ;
	var ypos = y ;
	 
	//Position the tooltip
	d3.select("#tooltip")
		.style('top',ypos+"px")
		.style('left',xpos+"px")
		.style('opacity',1);	

	//Change the texts inside the tooltip
	//d3.select("#tooltip .cohort").text(elem.attr('group'));
	var value = elem.attr('value');
	
	d3.select("#tooltip .value").html('Value: '+value);
	d3.select("#tooltip .month").html('Month: '+elem.attr('month'));
	d3.select("#tooltip .cohort").html('Cohort: '+elem.attr('cohort'));
}

var hideTooltip = function(d) {
	//Hide tooltip
	d3.select("#tooltip")
		.style('opacity',0)
		.style('top',0+"px")
		.style('left',0+"px");
}

var createTooltip = function(){
		//Creating the tooltip
	var tooltipContainer = $('<div>').attr('id','tooltipContainer');
	var tooltip = $('<div>').attr('id','tooltip');
	var tooltipValue = $('<div>').attr('class','value');
	var tooltipMonth = $('<div>').attr('class','month');
	var tooltipCohort = $('<div>').attr('class','cohort');
	tooltip.append(tooltipContainer);
	tooltipContainer.append(tooltipValue);
	tooltipContainer.append(tooltipMonth);
	tooltipContainer.append(tooltipCohort);
	$('body').append(tooltip);
};

/* Globals Variables */
var margin = {top: 25, right: 25, bottom: 25, left: 15};
var width = 1350 - margin.right - margin.left, height = 1400 - margin.top - margin.right; 
var graph_width = 1350 - margin.right - margin.left;
var matrix_size = 180;
var graph_axis_text_width = 22;

/* Global Functions */
var time_format = d3.time.format('%b %y');
var time_scale = d3.time.scale().domain([time_format.parse('Jan 01'), time_format.parse('Dec 15')]).range([0,matrix_size-1]);
