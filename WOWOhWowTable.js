
// Global variables / defaults
var WOW = {
  nan_formats: ['', 'nan', 'NaN', 'NA', 'inf', '-inf'],
  fraction_plot_marked: 0.2,
  data_counter: 0,
  graph_counter: 0,
  content_counter: 0,
  w: 1200,
  h: 800,
  default_color: "#555555",
  color_wheel: ["#0173b2","#de8f05","#029e73","#d55e00","#cc78bc","#ca9161","#ece133","#56b4e9"]
}

// A few helper functions
WOW.is_that_a_number = function(stringy_thing) {
  // guesses if a string is a number
  // from Angular code here: https://stackoverflow.com/questions/18082/validate-decimal-numbers-in-javascript-isnumeric
  return !isNaN(stringy_thing - parseFloat(stringy_thing));
}

WOW.toggle = function(element) {
  // input is d3 element
  element.style('display', (element.style('display')=='block') ?  "none" : "block");
}

// FOR DEBUGGING AND UNDERSTANDING INHERITANCE
class Test {
  constructor(a) {
    this.a = a;
    this.fun();
  }
}

class Tester extends Test {
  constructor(a2) {
    super(a2);
  }

  fun() {
    console.log(2);
  }
}

class WowThing {
  /* Base class for everything that gets drawn */
  constructor(dimensions, parent_data, rect) {
    this.rect = rect;
    this.parent_data = parent_data;
    this.svg = this.parent_data.svg;
    this.dimensions = dimensions;
    this.plot = true;
    [this.left, this.top, this.w, this.h] = dimensions;
    let self = this;
    this.graph_stuff = this.svg.append('g');

    this.exit_out = this.graph_stuff.append('text')
      .html('X')
      .attr('text-anchor', 'middle')
      .attr('class', 'plot_option plot_exit')
      .attr('x', this.left+this.w-5)
      .attr('y', this.top-10)
      .on("click", function() {
        self.kill();
      })
  }

  kill() {
    this.plot = false;
    this.rect.r.remove();
    this.graph_stuff.remove();
  }

}

class WowText extends WowThing {
  /* Simple SVG text element linked to data groups */
  constructor(dimensions, parent_data, rect) {
    super(dimensions, parent_data, rect);
    WOW.content_counter += 1;
    this.content_num = WOW.content_counter;
    let self = this;

    this.content = this.graph_stuff.append('text')
      .html('CONTENT')
      .attr('text-anchor', 'middle')
      .attr('class', 'plot_option plot_other')
      .attr('x', this.left+this.w/2)
      .attr('y', this.top+this.h/2)
      .on('click', function() { self.add_content(); })
  }

  add_content() {
    let self = this;
    this.content_var = this.parent_data.active_column;
    /* Old font-size inference
    this.average_chars = 0;
    let c = 0
    for (let possible_val of this.parent_data.string_sets[this.content_var]) {
      if (WOW.nan_formats.indexOf(String(possible_val))==-1) {
        this.average_chars += String(possible_val).length;
        c += 1;
      }
    }
    this.average_chars = this.average_chars / c;
    this.font_size = Math.sqrt(this.w*this.h)/this.average_chars;
    */
    this.font_size = 16;
    console.log(this.content_var, this.average_chars, this.font_size);
    // Everything will just be displayed as strings
    this.parent_data.svg.selectAll('.' + self.parent_data.wow_data_class)
      .append('foreignObject')
      .attr('class', 'text_content content_'+String(self.content_num))
      .attr('text-anchor', "middle")
      .attr('x', self.left)
      .attr('y', self.top)
      .attr('width', self.w)
      .attr('height', self.h)
      .style('font-size', this.font_size);

    this.parent_data.svg.selectAll('.content_'+String(self.content_num))
      .append('xhtml:div')
      .attr('class', 'text_content_div')
      .html(function(d) { return String(d[self.content_var]); });

    this.rect.r.remove();
    this.content.remove();
  }

  kill() {
    super.kill();
    this.parent_data.svg.selectAll('.content_'+String(this.content_num)).remove();
  }
}

class WowImg extends WowThing {
  /* Simple SVG text element linked to data groups */
  constructor(dimensions, parent_data, rect) {
    super(dimensions, parent_data, rect);
    WOW.content_counter += 1;
    this.content_num = WOW.content_counter;
    let self = this;

    this.content = this.graph_stuff.append('text')
      .html('IMG')
      .attr('text-anchor', 'middle')
      .attr('class', 'plot_option plot_other')
      .attr('x', this.left+this.w/2)
      .attr('y', this.top+this.h/2)
      .on('click', function() { self.add_content(); })
  }

  add_content() {
    let self = this;
    this.content_var = this.parent_data.active_column;
    this.parent_data.svg.selectAll('.' + self.parent_data.wow_data_class)
        .append('image')
        .attr('class', 'image_content content_'+String(self.content_num))
        .attr('preserveAspectRatio', "xMidYMid meet")
        .attr('x', this.left)
        .attr('y', this.top)
        .attr('width', this.w)
        .attr('height', this.h)
        .attr('href', function(d) { return d[self.content_var]; });

    this.rect.r.remove();
    this.content.remove();
  }

  kill() {
    super.kill();
    this.parent_data.svg.selectAll('.content_'+String(this.content_num)).remove();
  }
}

class WowGraph extends WowThing {
  /* Base class for graphs */
  constructor(dimensions, parent_data, rect) {
    super(dimensions, parent_data, rect)
    WOW.graph_counter += 1;
    this.graph_num = WOW.graph_counter;
    let self = this;
    this.axes = this.graph_stuff.append('g');
    this.plotted_yet = false;
    this.has_color = false;

    this.xlabel = this.graph_stuff.append('text')
      .html('X')
      .attr('text-anchor', 'middle')
      .attr('class', 'plot_option plot_xlabel')
      .attr('x', this.left+this.w/2)
      .attr('y', this.top+this.h+30)
      .on('click', function() { self.label_x(); });

    this.ylabel = this.graph_stuff.append('text')
      .html('Y')
      .attr('text-anchor', 'middle')
      .attr('class', 'plot_option plot_ylabel')
      .attr('x', this.left)
      .attr('y', this.top-15)
      .on('click', function() { self.label_y(); });

    this.color_by = this.graph_stuff.append('image')
      .attr('class', 'plot_option plot_color')
      .attr('x', this.left+this.w-15)
      .attr('y', this.top)
      .attr('width', 20)
      .attr('height', 20)
      .attr('href', 'Art/color_wheel.svg')
      .on('click', function() { self.color_em(); });

    this.color_scale = function(dummy) { return WOW.default_color; }; //default color function just returns default

    this.axes.append('g').attr("transform", "translate(0,"+(self.top+self.h)+")").attr('id', 'x_axis_graph_'+String(self.graph_num));
    this.axes.append('g').attr("transform", "translate("+self.left+", 0)").attr('id', 'y_axis_graph_'+String(self.graph_num));
  }

  color_em() {
    let self = this;
    if (this.has_color) this.legend_stuff.remove();
    this.color_col = this.parent_data.active_column;
    let tmp_dtype = this.parent_data.dtypes[this.color_col];
    if ((tmp_dtype != 'Image') && (tmp_dtype != 'Filename')) {
      this.has_color = true;
      if (tmp_dtype == 'String') {
        this.color_scale = d3.scaleOrdinal(self.parent_data.string_sets[self.color_col], WOW.color_wheel);
      } else if (tmp_dtype == 'Number') {
        this.color_scale = d3.scaleSequential(self.parent_data.number_domains[self.color_col], d3.interpolateViridis);
      }
      this.update_color();
      this.make_legend();
    }
  }

  make_legend() {
    // this is a bad version of this: https://observablehq.com/@d3/color-legend
    let self = this;
    this.legend_stuff = this.graph_stuff.append('g').style('display', 'block');

    this.legend_button = this.graph_stuff.append('text')
      .attr('class', 'plot_option plot_legend_button')
      .attr('x', this.left+this.w-5)
      .attr('y', this.top+40)
      .attr('width', 20)
      .attr('height', 20)
      .attr('text-anchor', 'middle')
      .html('L')
      .on('click', function() { WOW.toggle(self.legend_stuff); });

    this.legend_title = this.legend_stuff.append('text')
      .attr('x', this.left+this.w+20)
      .attr('y', this.top-16)
      .attr('font-size', 16)
      .html('Legend: ' + String(self.color_col));

    if (self.parent_data.dtypes[self.color_col] == 'String') {
      this.legend_entries = this.legend_stuff.append('g');
      this.legend_entries.selectAll('.legend_el_text')
        .data(self.parent_data.string_sets[self.color_col])
        .enter()
        .append('text')
          .attr('class', 'legend_el_text')
          .attr('x', this.left+this.w+45)
          .attr('y', function(d, i) { return self.top+3+18*i;})
          .attr('font-size', 14)
          .attr('dominant-baseline', 'middle')
          .html(function(d) { return d; });

      this.legend_entries.selectAll('.legend_el_marker')
        .data(self.parent_data.string_sets[self.color_col])
        .enter()
        .append('circle')
          .attr('class', 'legend_el_marker')
          .attr('cx', this.left+this.w+30)
          .attr('cy', function(d, i) { return self.top+3+18*i;})
          .attr('r', 7)
          .attr('fill', function(d) { return self.color_scale(d); });
    } else if (self.parent_data.dtypes[self.color_col] == 'Number') {
      // 10 blocks always ten blocks I tell you 
      let the_domain = self.color_scale.domain();
      let domain_range = the_domain[1]-the_domain[0];
      let bar_data = [];
      let n = self.h-40;
      for (let i=0; i<n; i++) {
        bar_data.push({
          'val': the_domain[0]+i*domain_range/n,
          'color': self.color_scale(the_domain[0]+i*domain_range/n),
      })
      }
      this.legend_bar = this.legend_stuff.append("g");
      this.legend_bar.selectAll("rect")
        .data(bar_data)
        .join("rect") // need to learn join syntax: https://observablehq.com/@d3/selection-join
          .attr("y", (d, i) => self.top+self.h-20-(i+1))
          .attr("x", self.left+self.w+30)
          .attr("height", 1)
          .attr("width", 20)
          .attr("fill", d => d['color']);
      this.legend_scale = d3.scaleLinear().domain(self.color_scale.domain()).range([self.top+20, self.top+self.h-20]);
      this.legend_axis_el = this.legend_stuff.append('g').attr("transform", "translate("+String(self.left+self.w+50)+", 0)").attr('class', 'legend_axis')
      this.legend_axis_el.call(d3.axisRight().scale(self.legend_scale));
    }

  }

  label_x() {
    let tmp_dtype = this.parent_data.dtypes[this.parent_data.active_column];
    if ((tmp_dtype != 'Image') && (tmp_dtype != 'Filename')) {
      this.xlabel.html(this.parent_data.active_column);
      this.x = this.parent_data.active_column;
      this.x_dtype = tmp_dtype;
      if (!this.y) this.ylabel.style('display', 'block');
      this.update_plot();
    }
  }

  label_y() {
    let tmp_dtype = this.parent_data.dtypes[this.parent_data.active_column];
    if ((tmp_dtype != 'Image') && (tmp_dtype != 'Filename')) {
      this.y = this.parent_data.active_column;
      this.ylabel.html(this.parent_data.active_column);
      this.y_dtype = tmp_dtype;
      if (!this.x) this.xlabel.style('display', 'block');
      this.update_plot();
    }
  }

  make_scale(d, x_or_y, scale_type, force_zero=false) {
    let self = this;
    if (scale_type == 'Linear') {
      let range = (x_or_y == 'x') ? [self.left, self.left+self.w] : [self.top+self.h, self.top];
      let buffer = (force_zero) ? 0 : (d[1]-d[0])/10;
      return d3.scaleLinear().domain([d[0]-buffer, d[1]+buffer]).range(range);
    } else if (scale_type == 'Qual') {
      let range = (x_or_y == 'x') ? [self.left+self.w/d.length, self.left+self.w] : [self.top+self.h-self.h/d.length, self.top];
      return d3.scalePoint().domain(d).range(range);
    }
  }

  kill() {
    super.kill();
    this.parent_data.svg.selectAll('.mark_on_graph_'+String(this.graph_num)).remove();
  }
}

class WowMarkerPlot extends WowGraph {
  /* Plots with markers (scatter, point-based hist or boxplot-ey thing) */
  constructor(dimensions, parent_data, rect) {
    super(dimensions, parent_data, rect)
    this.axes = this.graph_stuff.append('g');
    this.point_size = Math.ceil(Math.sqrt(this.w*this.h*WOW.fraction_plot_marked/(Math.PI*this.parent_data.data.length)));
    this.ylabel.style('display', 'none');
  }

  label_x() {
    let tmp_dtype = this.parent_data.dtypes[this.parent_data.active_column];
    if (tmp_dtype.indexOf("Series")==-1) super.label_x();
  }

  label_y() {
    let tmp_dtype = this.parent_data.dtypes[this.parent_data.active_column];
    if (tmp_dtype.indexOf("Series")==-1) super.label_y();
  }

  bin_data(bin_var, binpos_var) {
    this.bin_counts = {}
    for (let i=0; i<this.parent_data.data.length; i++) {
      let tmp_val = this.parent_data.data[i][bin_var];
      if (tmp_val in this.bin_counts) {
        this.bin_counts[tmp_val] += 1;
      } else {
        this.bin_counts[tmp_val] = 1;
      }
      this.parent_data.data[i][binpos_var] = this.bin_counts[tmp_val]-0.5;
    }
  }

  update_color() {
    let self = this;
    this.parent_data.svg.selectAll('.mark_on_graph_'+String(self.graph_num))
      .attr('fill', function(d) { return self.color_scale(d[self.color_col]) || WOW.default_color});
  }

  update_plot() {
    let self = this;
    var xvar = self.x;
    var yvar = self.y;
    if (this.x_dtype == 'Number') {
      let xd = this.parent_data.number_domains[this.x];
      this.xScale = this.make_scale(xd, 'x', 'Linear');
      if (!this.y) { // histogram
        self.n_bins = Math.round(self.parent_data.data.length/10);
        self.bin_size = (xd[1]-xd[0])/self.n_bins;
        for (let i=0; i<this.parent_data.data.length; i++) {
          let bin = Math.floor((this.parent_data.data[i][this.x]-xd[0])/self.bin_size);
          this.parent_data.data[i][this.x+'_binned'] = xd[0]+(bin+0.5)*self.bin_size;
        }
        self.bin_data(this.x+'_binned', this.x+'_binpos');
        this.yScale = self.make_scale([0, Math.max(...Object.values(self.bin_counts))], 'y', 'Linear', true);
        xvar = self.x+'_binned';
        yvar = self.x+'_binpos';
        self.ylabel.html('Count');
      }
    } else if (this.x_dtype == 'String') {
      this.xScale = this.make_scale(this.parent_data.string_sets[this.x], 'x', 'Qual');
      if (!this.y) { 
        // categorical histogram (weird barplot thingy) (otherwise swarmplot or intersection plot)
        self.bin_data(this.x, this.x+'_binpos');
        this.yScale = self.make_scale([0, Math.max(...Object.values(self.bin_counts))], 'y', 'Linear', true);
        yvar = this.x+'_binpos';
      }
    }
    if (this.y) {
      if (this.y_dtype == 'Number') {
        this.yScale = this.make_scale(this.parent_data.number_domains[this.y], 'y', 'Linear');
      } else if (this.y_dtype == 'String') {
        this.yScale = this.make_scale(this.parent_data.string_sets[this.y], 'y', 'Qual')
      }
    }
    if (this.plotted_yet) {
      this.parent_data.svg.selectAll('.mark_on_graph_'+String(self.graph_num))
        .transition()
        .duration(200)
        .attr('cx', function(d) { return self.xScale(d[xvar]); })
        .attr('cy', function(d) { return self.yScale(d[yvar]); });
    } else {
      this.parent_data.svg.selectAll('.WOW_data_group')
        .append('circle')
        .attr('class', 'circle_point mark_on_graph_'+String(WOW.graph_counter))
        .attr('r', self.point_size)
        .attr('fill', function(d) { return self.color_scale(d[self.color_col]) || WOW.default_color})
        .attr('cx', function(d) { return self.xScale(d[xvar]); })
        .attr('cy', function(d) { return self.yScale(d[yvar]); });
    }
    this.xAxis = d3.axisBottom().scale(self.xScale);
    this.yAxis = d3.axisLeft().scale(self.yScale);
    d3.select('#x_axis_graph_'+String(self.graph_num)).call(self.xAxis);
    d3.select('#y_axis_graph_'+String(self.graph_num)).call(self.yAxis);
    this.plotted_yet = true;
  }

}

class WowSeriesPlot extends WowGraph {
  /* Plots lines */
  constructor(dimensions, parent_data, rect) {
    super(dimensions, parent_data, rect)
    this.axes = this.graph_stuff.append('g');
    this.line_weight = Math.min(Math.ceil(Math.sqrt(this.w*this.h*WOW.fraction_plot_marked/(Math.PI*this.parent_data.data.length))/2), 4);
    this.xlabel.style('display', 'none');
  }

  label_x() {
    let tmp_dtype = this.parent_data.dtypes[this.parent_data.active_column];
    if (tmp_dtype.indexOf("Series")>-1) super.label_x();
  }

  label_y() {
    let tmp_dtype = this.parent_data.dtypes[this.parent_data.active_column];
    if (tmp_dtype.indexOf("Series")>-1) super.label_y();
  }

  update_color() {
    let self = this;
    this.parent_data.svg.selectAll('.mark_on_graph_'+String(self.graph_num))
      .attr('stroke', function(d) { return self.color_scale(d[self.color_col]) || WOW.default_color});
  }

  update_plot() {
    let self = this;
    this.line = d3.line();
    if (this.y_dtype == 'Series_Number') {
      let yd = this.parent_data.number_domains[this.y];
      this.yScale = this.make_scale(yd, 'y', 'Linear');
      this.line.y(function(d) { return self.yScale(Number(d.y)); });
    } else if (this.y_dtype == 'Series_String') {
      yd = this.parent_data.string_sets[this.y]
      this.yScale = this.make_scale(yd, 'y', 'Qual')
      this.line.y(function(d) { return self.yScale(d.y); });
    }
    if (!this.x) { // assume x series is just integers up
      let xd = [1, this.parent_data.series_lengths[this.y][1]];
      this.xScale = this.make_scale(xd, 'x', 'Linear');
      this.line.x(function(d, i) { return self.xScale(i+1); });
    } else {
      if (this.x_dtype == 'Series_Number') {
        let xd = this.parent_data.number_domains[this.x];
        this.xScale = this.make_scale(xd, 'x', 'Linear');
        this.line.x(function(d) { return self.xScale(Number(d.x)); });
      } else if (this.x_dtype == 'Series_String') {
        let xd = this.parent_data.string_sets[this.x];
        this.xScale = this.make_scale(xd, 'x', 'Qual');
        this.line.x(function(d) { return self.xScale(d.x); });
      }
    }
    if (this.plotted_yet) {
      this.parent_data.svg.selectAll('.mark_on_graph_'+String(self.graph_num))
        .transition()
        .duration(200)
        .attr('d', function(d) { 
          let yvals = d[self.y].split(';');
          let xvals;
          if (self.x) {
            xvals = d[self.x].split(';');
          }
          let tmp_line_data = [];
          for (let i=0; i<yvals.length; i++) {
            let tmp_point = {'y': yvals[i]};
            if (self.x) {
              tmp_point['x'] = xvals[i];
            }
            tmp_line_data.push(tmp_point);
          }
          return self.line(tmp_line_data);
        })
    } else {
      this.parent_data.svg.selectAll('.WOW_data_group')
        .append('path')
        .attr('class', 'path_mark mark_on_graph_'+String(WOW.graph_counter))
        .attr('stroke-width', self.line_weight)
        .attr('stroke', function(d) { return self.color_scale(d[self.color_col]) || WOW.default_color})
        .attr('fill', 'none')
        .attr('d', function(d) { 
          let yvals = d[self.y].split(';');
          let xvals;
          if (self.x) {
            xvals = d[self.x].split(';');
          }
          let tmp_line_data = [];
          for (let i=0; i<yvals.length; i++) {
            let tmp_point = {'y': yvals[i]};
            if (self.x) {
              tmp_point['x'] = xvals[i];
            }
            tmp_line_data.push(tmp_point);
          }
          return self.line(tmp_line_data);
        });
    }
    this.xAxis = d3.axisBottom().scale(self.xScale);
    this.yAxis = d3.axisLeft().scale(self.yScale);
    d3.select('#x_axis_graph_'+String(self.graph_num)).call(self.xAxis);
    d3.select('#y_axis_graph_'+String(self.graph_num)).call(self.yAxis);
    this.plotted_yet = true;
  }

}


class WowData {
  constructor(f_in, dimensions, parent_data=null, parent_column_div=null) {
    /*
    Reads tab-separated text file, associates it with column labels in the sidebar and an svg in the main space
    */
    WOW.data_counter += 1;
    this.wow_data_count = WOW.data_counter;
    this.wow_data_class = 'WOW_data_' + String(this.wow_data_count);
    this.parent_data = parent_data;
    this.dimensions = dimensions;
    this.parent_column_div = parent_column_div;
    this.f_in = f_in;
    this.wow_children = [];
    this.vis_elements = [];
    let wow_data = this;
    console.log(f_in);
    let reader = new FileReader();
    reader.readAsText(f_in);
    reader.onload = function() {
      wow_data.data = d3.tsvParse(reader.result)
      console.log(wow_data.data);
      wow_data.infer_dtypes();
      
      // For draggin, I am going to make an overlay svg that only pops up when you're making rects:
      wow_data.drag_svg = d3.select("#WOW_svg_holder").append('svg')
        .attr('class', 'WOW_svg drag_svg')
        .style('left', dimensions[0])
        .style('top', dimensions[1])
        .attr('width', dimensions[2])
        .attr('height', dimensions[3])
        .style('display', 'none');

      // This is where everything is going to actually be drawn
      wow_data.svg = d3.select("#WOW_svg_holder").append('svg')
        .attr('class', 'WOW_svg')
        .style('left', dimensions[0])
        .style('top', dimensions[1])
        .attr('width', dimensions[2])
        .attr('height', dimensions[3]);

      wow_data.svg.selectAll('.'+wow_data.wow_data_class)
        .data(wow_data.data)
        .enter()
        .append('g')
          .attr('class', 'WOW_data_group ' + wow_data.wow_data_class)
          .on('mouseover', function(d) { d3.select(this).raise(); }) //brings to front
          .on('click', function() {
            let already_clicked = d3.select(this).classed('clicked_data');
            wow_data.svg.selectAll('.'+wow_data.wow_data_class).classed('clicked_data', false);
            if (!already_clicked) d3.select(this).classed('clicked_data', true);
            console.log(this);
          });


      let tmp_text_button = wow_data.svg.append('g')
        .attr('class', 'rect_draw_button')
        .on("click", function() { 
          wow_data.rect_class = 'bounding_rect_text';
          wow_data.drag_svg.style("display", "block")}
        );
      tmp_text_button.append('rect')
        .attr('class', 'rect_draw_button bounding_rect')
        .attr('x', dimensions[0]+dimensions[2]-50)
        .attr('y', dimensions[1])
        .attr('width', 20)
        .attr('height', 20)
        .style('fill', '#ccc');
      tmp_text_button.append('text')
        .attr('x', dimensions[0]+dimensions[2]-40)
        .attr('y', dimensions[1]+15)
        .attr('text-anchor', 'middle')
        .attr('text-size', 15)
        .html('T');

      let tmp_img_button = wow_data.svg.append('g')
        .attr('class', 'rect_draw_button')
        .on("click", function() { 
          wow_data.rect_class = 'bounding_rect_img';
          wow_data.drag_svg.style("display", "block")}
        );
      tmp_img_button.append('rect')
        .attr('class', 'rect_draw_button bounding_rect')
        .attr('x', dimensions[0]+dimensions[2]-50)
        .attr('y', dimensions[1]+40)
        .attr('width', 20)
        .attr('height', 20)
        .style('fill', '#ccc');
      tmp_img_button.append('text')
        .attr('x', dimensions[0]+dimensions[2]-40)
        .attr('y', dimensions[1]+55)
        .attr('text-anchor', 'middle')
        .attr('text-size', 15)
        .html('I');

      let tmp_marker_button = wow_data.svg.append('g')
        .attr('class', 'rect_draw_button')
        .on("click", function() { 
          wow_data.rect_class = 'bounding_rect_markerplot';
          wow_data.drag_svg.style("display", "block")}
        );

      tmp_marker_button.append('rect')
        .attr('class', 'bounding_rect_graph')
        .attr('x', dimensions[0]+dimensions[2]-50)
        .attr('y', dimensions[1]+80)
        .attr('width', 20)
        .attr('height', 20)
        .style('stroke-dasharray', '0,40,200')
        .style('fill', '#ccc');
      for (let i=1; i<3; i++) {
        tmp_marker_button.append('circle')
          .attr('cx', dimensions[0]+dimensions[2]-50+8*i)
          .attr('cy', dimensions[1]+80+20-6*i)
          .attr('r', 3)
          .attr('fill', WOW.default_color)
          .style('opacity', 0.5);
      }
      

      let tmp_series_button = wow_data.svg.append('g')
        .attr('class', 'rect_draw_button')
        .on("click", function() { 
          wow_data.rect_class = 'bounding_rect_seriesplot';
          wow_data.drag_svg.style("display", "block")}
        );
      
      tmp_series_button.append('rect')
        .attr('class', 'bounding_rect_graph')
        .attr('x', dimensions[0]+dimensions[2]-50)
        .attr('y', dimensions[1]+120)
        .attr('width', 20)
        .attr('height', 20)
        .style('stroke-dasharray', '0,40,200')
        .style('fill', '#ccc')

      tmp_series_button.append('line')
        .attr('x1', dimensions[0]+dimensions[2]-50)
        .attr('y1', dimensions[1]+120+20)
        .attr('x2', dimensions[0]+dimensions[2]-50+20)
        .attr('y2', dimensions[1]+120)
        .attr('stroke', WOW.default_color)
        .attr('stroke-width', 1);

      wow_data.Rects = []; // Collection

      // On drag: call rect methods modified from https://bl.ocks.org/michaelwooley/b095fa7ce0e11d771dcb3f035fda1f07
      wow_data.drag_svg.call(
        d3.drag()
          .on('start', wow_data.startRect.bind(wow_data))
          .on('drag', wow_data.dragRect.bind(wow_data))
          .on('end', wow_data.endRect.bind(wow_data))
      );
  
    }
  }

  update_data(f_in) {
    this.f_in = f_in;
    let wow_data = this;
    console.log(f_in);
    let reader = new FileReader();
    reader.readAsText(f_in);
    reader.onload = function() {
      wow_data.data = d3.tsvParse(reader.result);
      console.log(wow_data.data);
      update_plots();
    }
  }

  add_search_filter(column, dimensions, description="") {
    let sf = new Object();
    let self = this;
    sf.dimensions = dimensions;
    sf.column = column;
    this.search_filters.push(sf);
    sf.foreignObject = this.svg.append('foreignObject')
      .attr('x', dimensions[0])
      .attr('y', dimensions[1])
      .attr('width', dimensions[2])
      .attr('height', dimensions[3])
      .attr('class', 'foreign_obj');
    sf.input_descrip = sf.foreignObject.append('xhtml:p')
      .attr('class', 'text_input_description')
      .style('height', dimensions[3]/2)
      .style('font-size', (dimensions[3]/2)*0.8)
      .html(description);
    sf.text_input = sf.foreignObject.append('xhtml:input')
      .attr('type', 'text')
      .attr('class', 'text_input_filter')
      .style('height', dimensions[3]/2)
      .style('font-size', (dimensions[3]/2)*0.8)
      .on('keyup', function() { 
        self.svg.selectAll('.'+self.wow_data_class)
          .style('display', function(d) {
            for (let tmp_sf of self.search_filters) {
              if (d[tmp_sf.column].indexOf(tmp_sf.text_input.property("value"))==-1) return 'none';
            }
            return 'block';
          });
      });
  }

  startRect(event) {
    //Add a rectangle
    // 1. Get mouse location in SVG
    this.current_rect = {};
    this.current_rect.x0 = event.x;
    this.current_rect.y0 = event.y;
    // 2. Make a rectangle
    this.current_rect.r = this.svg //self.zoomG
      .append('g')
      .append('rect') // An SVG `rect` element
      .attr('x', this.current_rect.x0) // Position at mouse location
      .attr('y', this.current_rect.y0)
      .attr('width', 1) // Make it tiny
      .attr('height', 1)
      .attr('class', this.rect_class) // Assign a class for formatting purposes
    ;
  }

  dragRect(event) {
    // What to do when mouse is dragged
    // 1. Get the new mouse position
    // 2. Update the attributes of the rectangle
    let tmp_width = Math.abs(this.current_rect.x0 - event.x);
    let tmp_height = Math.abs(this.current_rect.y0 - event.y);
    this.current_rect.r.attr('x', Math.min(this.current_rect.x0, event.x))
      .attr('y', Math.min(this.current_rect.y0, event.y))
      .attr('width', tmp_width)
      .attr('height', tmp_height);
    if (['bounding_rect_markerplot','bounding_rect_seriesplot'].includes(this.rect_class)) {
      this.current_rect.r.style('stroke-dasharray', '0,' + String(tmp_height+tmp_width) + ',' + String((tmp_height+tmp_width)*2));
    }
  }

  endRect() {
    // What to do on mouseup, shallow copy this thing to the list
    let dimensions = [parseInt(this.current_rect.r.attr('x')), parseInt(this.current_rect.r.attr('y')), 
                      parseInt(this.current_rect.r.attr('width')), parseInt(this.current_rect.r.attr('height'))];
    if (dimensions[2]*dimensions[3] > 500) { // if we drew anything reasonable
      this.Rects.push({ ...this.current_rect });
      if (this.rect_class == 'bounding_rect_text') {
        this.vis_elements.push(new WowText(dimensions, this, this.Rects[this.Rects.length-1]));
      } else if (this.rect_class == 'bounding_rect_img') {
        this.vis_elements.push(new WowImg(dimensions, this, this.Rects[this.Rects.length-1]));
      } else if (this.rect_class == 'bounding_rect_markerplot') {
        this.vis_elements.push(new WowMarkerPlot(dimensions, this, this.Rects[this.Rects.length-1]));
      } else if (this.rect_class == 'bounding_rect_seriesplot') {
        this.vis_elements.push(new WowSeriesPlot(dimensions, this, this.Rects[this.Rects.length-1]));
      }
    } else {
      this.current_rect.r.remove();
    }
    this.drag_svg.style('display', 'none');
  }

  infer_dtypes() {
    /*
    Infers the datatype of each column. Possible dtypes: 
    Number - NUMBER!
    String - any non-number variable
    Image - has to be a .png as of now
    Filename - has to be a .tsv (tab-delimited text file)
    Series_X_Number - a series with numbers on both axes (format "series:x1,y1;x2,y2;x3,y3;...")
    Series_X_String - a series with a string variable on the x-axis and numbers on the y-axis (format "series:x1,y1;x2,y2;x3,y3;...")
    */
    let example_row = this.data[0];
    this.dtypes = {};
    this.example_data = {};
    this.number_domains = {};
    this.string_sets = {}
    this.series_lengths = {}
    for (let column_name in example_row) {
      let val = "";
      let it_is_a_series = false;
      // if the value is blank ("") for the first row, keep checking rows until we find something
      let row_index = 0;
      let looking_for_example = true;
      while ((looking_for_example) && (row_index<this.data.length)) {
        let vals = String(this.data[row_index][column_name]).split(';');
        it_is_a_series = (vals.length>1) ? true : false;
        for (let i=0; i<vals.length; i++) {
          if (WOW.nan_formats.indexOf(vals[i]) == -1) {
            val = vals[i];
            looking_for_example = false;
          }
        }
        row_index += 1;
      }
      if (val.indexOf('.tsv') > -1) {
        this.dtypes[column_name] = 'Filename';
      } else if (val.indexOf('.png') > -1) {
        this.dtypes[column_name] = 'Image';
      } else if (it_is_a_series) {
        if (WOW.is_that_a_number(val)) {
          // number series, record numbers to pull max and min later
          this.dtypes[column_name] = 'Series_Number';
          let tmp_all_nums = [];
          for (let i=0; i<this.data.length; i++) {
            let tmp_series = this.data[i][column_name].split(';');
            for (let j=0; j<tmp_series.length; j++) {
              if (WOW.nan_formats.indexOf(tmp_series[j])==-1) {
                tmp_all_nums.push(Number(tmp_series[j]));
              }
            }
          }
          this.number_domains[column_name] = [Math.min(...tmp_all_nums), Math.max(...tmp_all_nums)];
        } else {
          // string series, record set of possible values
          this.dtypes[column_name] = 'Series_String';  
          this.string_sets[column_name] = [];
          for (let i=0; i<this.data.length; i++) {
            let tmp_series = this.data[i][column_name].split(';');
            for (let j=0; j<tmp_series.length; j++) {
              if (this.string_sets[column_name].indexOf(tmp_series[j])==-1) {
                this.string_sets[column_name].push(tmp_series[j]);
              }
            }
          }
        }
        // If it's series, record the min and max length
        let tmp_lens = [];
        for (let i=0; i<this.data.length; i++) {
          tmp_lens.push(this.data[i][column_name].split(';').length);
        }
        this.series_lengths[column_name] = [Math.min(...tmp_lens), Math.max(...tmp_lens)];
      } else {
        if (WOW.is_that_a_number(val)) {
          this.dtypes[column_name] = 'Number';
          let tmp_all_nums = [];
          // number column, record numbers to pull max and min later
          for (let i=0; i<this.data.length; i++) {
            if (this.data[i][column_name] != "") {
              tmp_all_nums.push(Number(this.data[i][column_name]));
            }
            this.data[i][column_name] = Number(this.data[i][column_name]);
          }
          this.number_domains[column_name] = [Math.min(...tmp_all_nums), Math.max(...tmp_all_nums)];
        } else {
          // string column, record set of possible values
          this.dtypes[column_name] = 'String';
          this.string_sets[column_name] = [];
          for (let i=0; i<this.data.length; i++) {
            if (this.string_sets[column_name].indexOf(this.data[i][column_name])==-1) {
              this.string_sets[column_name].push(this.data[i][column_name]);
            }
          }
        }
      }
    }
    this.make_column_list();
  }

  make_column_list() {
    let sidebar_container;
    if (!this.parent_column_div) {
      sidebar_container = d3.select("#WOW_sidebar");
    } else {
      sidebar_container = this.parent_column_div;
    }
    let column_div = sidebar_container.append('div').attr("class", "column_div");
    let column_top_stuff = column_div.append('div').attr("class", "column_top_stuff")
    column_top_stuff.append('div').attr("class", "arrow down").on("click", function() { WOW.toggle_columns(this); });
    column_top_stuff.append('div').attr("class", "columns_label").html("Columns");
    let inner_column_div = column_div.append('div').attr("class", "inner_column_div");
    this.inner_column_labels = {};
    let data_obj = this;
    for (let column_name in data_obj.dtypes) {
      let outer_single_column_label = inner_column_div.append('div').attr("class", "outer_single_column_label");
      data_obj.inner_column_labels[column_name] = outer_single_column_label.append('div')
        .attr("class", "inner_single_column_label column_label_"+data_obj.dtypes[column_name])
        .html(column_name+" ("+data_obj.dtypes[column_name]+")")
        .on("click", function() { data_obj.column_activate(column_name); });
    }
  }

  column_activate(column_name) {
    this.active_column = column_name;
    for (let cname in this.inner_column_labels) {
      if (cname == column_name) {
        this.inner_column_labels[cname].attr("class", "inner_single_column_label label_highlighted column_label_"+this.dtypes[cname]);
      } else {
        this.inner_column_labels[cname].attr("class", "inner_single_column_label column_label_"+this.dtypes[cname]);
      }
    }
  }
}

WOW.toggle_columns = function(arrow) {
  if (d3.select(arrow).attr("class")=="arrow down") {
    d3.select(arrow.parentNode.parentNode).selectAll('.inner_column_div').style("height", "0px")
    d3.select(arrow).attr("class", "arrow right");
  } else {
    d3.select(arrow.parentNode.parentNode).selectAll('.inner_column_div').style("height", "auto")
    d3.select(arrow).attr("class", "arrow down");
  }
}

WOW.toggle_sidebar = function() {
  let current_state = (d3.select("#WOW_sidebar_closer").html()=='&lt;') ? 'open': 'closed';
  if (current_state == 'open') {
    d3.select("#WOW_sidebar")
      .transition()
      .duration(300)
      .style("width", "13px")
      .style("overflow-x", "hidden")
      .on("end", d3.select("#WOW_sidebar_closer").html('&gt;'))
  } else {
    d3.select("#WOW_sidebar")
      .transition()
      .duration(300)
      .style("width", "200px")
      .style("overflow-x", "scroll")
      .on("end", d3.select("#WOW_sidebar_closer").html('&lt;'))
  } 
}

WOW.clear_plots = function () {
  for (let g of WOW.top_data.vis_elements) {
    g.kill();
  }
}

WOW.file_reader = function() {
  let file = document.getElementById('file_input').files[0]
  WOW.top_data = new WowData(file, [0, 40, window.innerWidth, window.innerHeight-40]);
}
