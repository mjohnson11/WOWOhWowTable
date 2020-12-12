# WOWOhWowTable

OK this is:
1. An interactive data browser meant for exploring your data that you are already familiar with.
2. Not as nice as other interactive data browsers, and WILL BE VERY SLOW ON BIG DATASETS STICK TO SMALL ONES FOR NOW
3. But has some neat features
  * quick cross-hovering, so that when one point is hovered, all marks corresponding to that row highlight
  * you can have a column that refers to an img url/path, so when you hover over a point you can see that picture (often a graph of underlying data)
  * (haven't got this done yet) you can have a column that refers to another datafile, so you can click on a point and then go explore the underlying data
  
## HOW TO (THIS IS ANNOYING, THE GOAL WILL BE TO EVENTUALLY MAKE THIS EASIER):

1. Clone this repo (or just download the three files) and put them in the directory your data is in. You can also test it out online here - https://nifty-poincare-4f73e1.netlify.app/wowohwowtable - but then you won't be able to access local image files.
2. Open WOWOhWowTable.html
3. Open a tab-separated table (supporting comma-separated is to-do)
4. The 4 icons on the right represent different elements you can add, from top to bottom: text, image, marker plot, series plot. To use one, click on it, and then click and drag to make a rectangle where that element will live.
5. Assign columns from your data file (in the sidebar at left) to these elements by first clicking on a column name to make it "active" and then clicking on an element (for the graphs, clicking on the x or y axis labels). For the graphs, you can change the axes labels later this way, but for the text and image you should just X-out of the element and make a new one.
6. I think the image, text, and marker plot should work fairly simply. The series plot requires a specific format, where numbers or strings are separated by semicolons. For example, a timeseries of numbers would be like 3;5;4;2;8 and if you put that on the y-axis it will plot it against 1;2;3;4;5 on the x-axis (or you can make another series column with the proper numbers or string values for the y-axis - 10;20;40;80;100 or Mon;Tue;Thu;Fri;Sun should work for example). Ideally in a future version you would be able to make series on the page, but for now this is the strict format.
7. Hovering should highlight all marks/text/images corresponding to an individual row. Clicking should hold those marks highlighted even after the mouse is taken away
