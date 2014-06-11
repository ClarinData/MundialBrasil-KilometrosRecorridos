// check http://jsfiddle.net/Qh9X5/1249/ for quadtree
// d3.labeler https://github.com/tinker10/D3-Labeler
var svg = d3.select("svg#map"),
  width = svg[0][0].clientWidth,
  height = svg[0][0].clientHeight;
svg.attr("viewBox", "0 0 " + width + " " + height)
  .attr("width", width)
  .attr("height", height);
window.addEventListener('resize', function() {
  var currentWidth = svg[0][0].clientWidth,
    currentHeight = svg[0][0].clientHeight;
  height = currentWidth * (currentHeight / currentWidth);
  width = currentWidth;
  svg.attr("width", width)
    .attr("height", height);
});
var projection = d3.geo.mercator()
  .center([0, -15])
  .rotate([52, 0])
  .scale((height * 74) / 55)
  .translate([width / 2, height / 2]);
var path = d3.geo.path()
  .projection(projection);
var graticule = d3.geo.graticule();
var tile = d3.geo.tile()
  .size([width, height])
  .scale(projection.scale() * 2 * Math.PI)
  .translate(projection([0, 0]))
  .zoomDelta((window.devicePixelRatio || 1) - .5);
var map = svg.append("g")
  .attr("id", "map");
var lines = svg.append("g")
  .attr("id", "lines");
var poi = svg.append("g")
  .attr("id", "poi");
var tooltips = svg.append("g")
  .attr("id", "tooltips");
var bar1 = d3.select("#bar1")
                  .select("svg").select("g");
var bar2 = d3.select("#bar2")
                  .select("svg").select("g");
var definitions = svg.append("defs");
var geoRef = {
  stadium: {},
  concentration: {}
};
var textSize = d3.scale.linear()
      .domain([4,8])
      .range([39, 79]);

definitions
  .append("g")
  .attr("id", "stadium-marker") // Concentration place marker
.append("circle")
  .attr("cx", 0)
  .attr("cy", 0)
  .attr("r", 4);
definitions
  .append("g")
  .attr("id", "concentration-marker") // Concentration place marker
.append("circle")
  .attr("cx", 0)
  .attr("cy", 0)
  .attr("r", 5);
definitions
  .append("g")
  .attr("id", "plane") // Plane icon
.append("path")
  .attr("d", "M28.288,117.296v4.877l-7.129,4.455v1.744l7.129-2.303v4.111l-1.643,1.432v1.348l2.564-0.924l2.563,0.924v-1.348l-1.641-1.432v-4.111l7.129,2.303v-1.744l-7.129-4.455v-4.877c0-0.6-0.416-1.092-0.922-1.092C28.702,116.205,28.288,116.697,28.288,117.296z");


bar1.append("rect")
.attr("class", "bar_line")
.attr("x", 35.354)
.attr("y", 665)
.attr("width", 7.755)
.attr("height", 7);

bar1.append("text")
    .attr("transform", "matrix(0 -1 1 0 43 622)")
    .attr("class", "bar_title")
    .text(" ");

bar1.append("use")
    .attr("class", "bar_icon")
    .attr("xlink:href", "#plane")
    .attr("transform", "matrix(1 0 0 1 10 539)");

bar1.append("text")
    .attr("transform", "matrix(1 0 0 1 20 643)")
    .attr("class", "bar_details")
    .text("0 KM");

bar2.append("rect")
.attr("class", "bar_line")
.attr("x", 35.354)
.attr("y", 665)
.attr("width", 7.755)
.attr("height", 7);

bar2.append("text")
    .attr("transform", "matrix(0 -1 1 0 43 622)")
    .attr("class", "bar_title")
    .text("");

bar2.append("use")
    .attr("class", "bar_icon")
    .attr("xlink:href", "#plane")
    .attr("transform", "matrix(1 0 0 1 10 539)");

bar2.append("text")
    .attr("transform", "matrix(1 0 0 1 20 643)")
    .attr("class", "bar_details")
    .text("0 KM");


var linearScale = function () { return 136; },
    inverseLinearScale = function () { return 136; };

// Data process
queue().defer(d3.json, "data/map.json")
  .defer(d3.json, "data/poi.json")
  .awaitAll(function(error, json) {
    var tiles = tile();
    // Background local Tiles
    map.append("g")
    // .attr("clip-path", "url(#clip)")
    .attr("id", "backtiles")
      .selectAll("image")
      .data(tiles)
      .enter()
      .append("image")
      .attr("xlink:href", function(d) { // Background images
        return "/tiles/2/" + d[2] + "/" + d[0] + "/" + d[1] + ".jpg";
      })
      .attr("width", Math.round(tiles.scale))
      .attr("height", Math.round(tiles.scale))
      .attr("x", function(d) {
        return Math.round((d[0] + tiles.translate[0]) * tiles.scale);
      })
      .attr("y", function(d) {
        return Math.round((d[1] + tiles.translate[1]) * tiles.scale);
      });
    // OpenWheather Tiles
    var tiles = tile();
    map.append("g")
      .attr("class", "temperature")
      .attr("clip-path", "url(#clip)")
      .selectAll("image")
      .data(tiles)
      .enter()
      .append("image")
      .attr("xlink:href", function(d) { // openweathermap temperature
        return "http://" + ["a", "b", "c", "d"][Math.random() * 4 | 0] + ".tile.openweathermap.org/map/temp/" + d[2] + "/" + d[0] + "/" + d[1] + ".png";
      })
      .attr("width", Math.round(tiles.scale))
      .attr("height", Math.round(tiles.scale))
      .attr("x", function(d) {
        return Math.round((d[0] + tiles.translate[0]) * tiles.scale);
      })
      .attr("y", function(d) {
        return Math.round((d[1] + tiles.translate[1]) * tiles.scale);
      });
    map.append("g")
      .attr("class", "precipitations")
      .attr("clip-path", "url(#clip)")
      .selectAll("image")
      .data(tiles)
      .enter()
      .append("image")
      .attr("xlink:href", function(d) { // openweathermap precipitations
        return "http://" + ["a", "b", "c", "d"][Math.random() * 4 | 0] + ".tile.openweathermap.org/map/precipitation/" + d[2] + "/" + d[0] + "/" + d[1] + ".png";
      })
      .attr("width", Math.round(tiles.scale))
      .attr("height", Math.round(tiles.scale))
      .attr("x", function(d) {
        return Math.round((d[0] + tiles.translate[0]) * tiles.scale);
      })
      .attr("y", function(d) {
        return Math.round((d[1] + tiles.translate[1]) * tiles.scale);
      });
    // Country limits (path)
    map.insert("path") // Land
    .datum(topojson.feature(json[0], json[0].objects.land))
      .attr("class", "land")
      .attr("id", "land")
      .attr("d", path);
    // Country limit clipping
    svg.append("clipPath")
      .attr("id", "clip")
      .append("use")
      .attr("xlink:xlink:href", "#land");
    // POI (stadiums, consentrations)
    poi.selectAll(".poi")
      .data(json[1].features)
      .enter()
      .append("use")
      .attr("id", function(d) {
        return d.properties.type + "." + ((d.properties.type == "stadium") ? d.properties.city : d.properties.team);
      })
      .attr("xlink:xlink:href", function(d) {
        return "#" + d.properties.type + "-marker";
      })
      .attr("class", function(d) {
        geoRef[d.properties.type][d.properties.city] = d.geometry.coordinates;
        return d.properties.type + " marker poi";
      })
      .attr("x", function(d) {
        return path.centroid(d)[0];
      })
      .attr("y", function(d) {
        return path.centroid(d)[1];
      })
      .text(function(d) {
        return d.properties.city;
      })
      .on("mouseover", function(d) {
        d3.select("#tooltip_" + d.domain + "_" + d.name.replace(/\s|\(|\)/g, "_"))
          .classed("disabled", false);
        d3.select(this)
          .classed("blink", true);
          console.log(d)
        // drawBar(bar2,d);
      })
      .on("mouseout", function(d) {
        d3.select("#tooltip_" + d.domain + "_" + d.name.replace(/\s|\(|\)/g, "_"))
          .classed("disabled", true);
        d3.select(this)
          .classed("blink", false);
      });
  });
d3.select(self.frameElement).style("height", height + "px");
var bpMenu = function(selector, data) {
  var menu = (function(menu) {
    menu.event = d3.dispatch("selected", "mouseover", "mouseout", "menuout");
    (function(menuitems) {
      menuitems.nodes = (function(nodes) {
        nodes.append("div")
          .attr("class", "menuitem radio")
          .on("mouseover", function(d) {
            if (this.id != "teamActive") {
              menu.event.mouseover(d);
            }
          })
          .on("mouseout", function() {
            menu.event.mouseover(null);
          })
          .on("click", function(d) {
            var teamActive = document.getElementById("teamActive");
            if (!this.hasAttribute("id")) {
              if (teamActive) {
                teamActive.removeAttribute("id");
              }
              this.id = "teamActive";
              menu.event.selected(d);
            } else {
              this.removeAttribute("id");
              menu.event.selected(null)
            }
          })
          .call(function(d) {
            nodes.labels = this.append("label")
              .text(function(d) {
                return d.team;
              });
          });
        return nodes;
      })(
        menuitems.append("g")
        .data(data)
        .enter()
      );
      return menuitems;
    })(menu.selectAll(".menuitem"));
    return menu;
  })(d3.select(selector));
  return menu;
};
var menu = {};
queue().defer(d3.json, "data/teams.json")
  .await(function(error, json) {
    var data = d3.keys(json)
      .sort(function(a, b) {
        return (a.toLowerCase() > b.toLowerCase()) ? 1 : ((a.toLowerCase() < b.toLowerCase()) ? -1 : 0);
      })
      .map(function(entry) {
        json[entry].team = entry;
        json[entry].totalDistance = (json[entry].games
          .map(function(game) {
            return game.distance;
          })
          .reduce(function(prevDist, currentDist) {
            return prevDist + currentDist;
          })) * 2;
        return json[entry];
      });

    var maxDistance = d3.max(data,function (d) {
      return d.totalDistance;
    });

    linearScale = d3.scale.linear()
      .domain([0,maxDistance])
      .range([200, 665]);
    inverseLinearScale = d3.scale.linear()
      .domain([0,maxDistance])
      .range([665, 200]);
    var routes = []
    data.map(function(entry) {
      var concentration = d3.select("use[id='concentration." + entry.team + "']");
      routes = (routes || []).concat(
        entry.games.map(function(game) {
          var stadium = d3.select("use[id='stadium." + game.stadium + "']");
          return {
            properties: {
              team: entry.team
            },
            coordinates: [
              [concentration.attr("x"), concentration.attr("y")],
              [stadium.attr("x"), stadium.attr("y")]
            ]
          };
        })
      )
    });
    lines.selectAll(".routes")
      .data(routes)
      .enter()
      .append("line")
      .attr("id", function(d, i) {
        return "route." + d.properties.team + "." + i;
      })
      .attr("class", "line routes disabled")
      .attr("x1", function(d) {
        return d.coordinates[0][0];
      })
      .attr("y1", function(d) {
        return d.coordinates[0][1];
      })
      .attr("x2", function(d) {
        return d.coordinates[1][0];
      })
      .attr("y2", function(d) {
        return d.coordinates[1][1];
      });
    menu = new bpMenu("#menu", data);
    menu.event.on("selected", function(d) {
      if (d) {
        d.stadiums = d.games.map(function(entry) {
          return entry.stadium;
        });
      }

      if (d) {
        drawBar(bar1,d);
        drawBar(bar2,{team: "", totalDistance: 0});
      } else {
        drawBar(bar1,{team: "", totalDistance: 0});
      }


      var pois = d3.selectAll("use[id^=concentration],use[id^=stadium],line[id^=route]");
      pois.datum(function(p) {
        var poi = this.getAttribute("id").split("."),
          poi_route = (poi[0] == "route") && d && d.team == poi[1],
          poi_noroute = (poi[0] != "route") && (!d || d.team == poi[1] || d.stadiums.indexOf(poi[1]) > -1);
        return {
          "selected": (poi_route || poi_noroute),
          "domain": poi[0],
          "name": poi[1],
          "gravity": p.anchor,
          // "oponent": (d.games[d.stadiums.indexOf(poi[1])]) ? d.games[d.stadiums.indexOf(poi[1])].oponent : null
        };
      })
        .classed("disabled", function(s) {
          return !s.selected;
        })
        .classed("over", false);
      var boxes = d3.selectAll("g.tooltip");
      boxes.remove();
      var xOffset = 41,
        yOffset = -10,
        boxWidth = 160,
        boxHeight = 62.104;
      var markers = d3.selectAll("use[id^=concentration]:not(.disabled),use[id^=stadium]:not(.disabled)");
      markers.each(function(s, i) {
        if (s.selected && d) {
          var marker = d3.select(this),
            thisTooltip = tooltips.datum(marker)
            .append("g")
            .attr("class", "tooltip " + s.domain)
            .attr("id", "tooltip_" + s.domain + "_" + s.name.replace(/\s|\(|\)/g, "_"))
            .classed("disabled", true),
            // thisLine = thisTooltip.append("g"),
            thisBox = thisTooltip.sort(function(a, b) {
              return parseFloat(b.attr("x")) - parseFloat(a.attr("x"));
            })
            .append("g")
            .attr("viewBox", "0 0 " + width + " " + height)
            .attr("transform", function(p) {
              p.width = boxWidth;
              p.height = boxHeight;
              p.x = parseFloat(p.attr("x")) - boxWidth / 2;
              // ((s.domain == "stadium") ? (-xOffset - boxWidth) : xOffset);
              p.y = parseFloat(p.attr("y")) - boxHeight - 10;
              p.y = (p.y < 0 || p.y > (height - boxHeight - 10)) ? height - boxHeight + yOffset : p.y;
              p.x = (p.x < 0 || p.x > (width - boxWidth - 10)) ? width - boxWidth - 10 : p.x;
              p.anchor = {
                w: [p.x, p.y + p.height / 2],
                n: [p.x + p.width / 2, p.y],
                e: [p.x + p.width, p.y + p.height / 2],
                s: [p.x + p.width / 2, p.y + p.height]
              };
              p.weight = 1;
              p.gravity = "s";
              return "translate(" + p.x + ", " + p.y + ")";
            });
          thisBox.append("rect") //box
          .attr("class", "box")
            .attr("x", 0)
            .attr("y", 0)
            .attr("width", boxWidth)
            .attr("height", boxHeight);
          if (s.domain == "concentration") {
            thisBox.append("text") //Team text
            .attr("class", "team")
              .attr("x", 5)
              .attr("y", 35)
              .text(d.team);
            thisBox.append("text") //City text
            .attr("class", "city")
              .attr("x", 5)
              .attr("y", 52)
              .text(d.concentration);
            thisBox.append("text") //City text
            .attr("class", "type")
              .attr("x", 5)
              .attr("y", 17)
              .text("Concentración");
          } else {
            thisBox.append("text") //Team text
            .attr("class", "stadium")
              .attr("x", 5)
              .attr("y", 20)
              .text(s.name);
            thisBox.append("rect") //box
            .attr("class", "box distance")
              .attr("x", 105)
              .attr("y", 0)
              .attr("width", 55)
              .attr("height", 31);
            thisBox.append("text") //Team text
            .attr("class", "distance")
              .attr("x", 112)
              .attr("y", 20)
              .text(function(p) {
                var index = d.stadiums.indexOf(s.name);
                return d.games[index].distance + " Km";
              });
          }
          // thisLine.append("line") //line
          //         .attr("class", "line")
          //         .attr("x1", function (p) {
          //           var offset = (p.gravity == "w") ? (-1) : 1;
          //           return p.anchor[p.gravity][0] + offset;
          //         })
          //         .attr("y1", function (p) {
          //           var offset = (p.gravity == "n") ? (-1) : 1;
          //           return p.anchor[p.gravity][1] + offset;
          //         })
          //         .attr("x2", function (p) {
          //           var offset = (p.gravity == "e") ? (-6) : 6;
          //           return parseFloat(p.attr("x")) + offset;
          //         })
          //         .attr("y2", function (p) {
          //           return parseFloat(p.attr("y"));
          //         });
        }
      })
        .classed("disabled", function(s) {
          return !s.selected;
        });
    });
    menu.event.on("mouseover", function(d) {
      if (d) {
        d.stadiums = d.games.map(function(entry) {
          return entry.stadium;
        });
      }
      d3.selectAll("use[id^=concentration],use[id^=stadium],line[id^=route]").datum(function(p) {
        var poi = this.getAttribute("id").split("."),
          poi_route = (poi[0] == "route") && d && d.team == poi[1],
          poi_noroute = (poi[0] != "route") && (!d || d.team == poi[1] || d.stadiums.indexOf(poi[1]) > -1);
        return {
          "selected": p.selected,
          "over": (poi_route || poi_noroute),
          "domain": poi[0],
          "name": poi[1],
          "route": poi_route,
          // "oponent": (d.games[d.stadiums.indexOf(poi[1])]) ? d.games[d.stadiums.indexOf(poi[1])].oponent : null
        };
      })
        .classed("over", function(s) {
          return d && !s.selected && s.over;
        })
        .classed("disabled", function(s) {
          return (!d && !s.selected && s.domain != "route") || (!d && s.domain == "route" && !s.selected) || (!s.selected && !s.over);
        });

      if (d) {
        drawBar(bar2,d);
      }

    });
  });

function drawBar(bar,d) {
    bar.select("text.bar_title")
        .transition()
        .attr("transform", function () {
          var vpos = inverseLinearScale(d.totalDistance) -43;
          return "matrix(0 -1 1 0 43 " + vpos + ")";
        })
        .text(d.team);
    bar.select("use")
        .transition()
        .attr("transform", function () {
          var vpos = inverseLinearScale(d.totalDistance) -126;
          return "matrix(1 0 0 1 10 " + vpos + ")";
        });
    bar.select("rect")
        .transition()
        .attr("y", inverseLinearScale(d.totalDistance))
        .attr("height", linearScale(d.totalDistance));
    bar.select("text.bar_details")
        .transition()
        .attr("transform", function () {
          var vpos = inverseLinearScale(d.totalDistance) -16,
              textLength = d.totalDistance.toString().length,
              hpos = 79 - textSize(textLength + 3);

          return "matrix(1 0 0 1 " + hpos + " " + vpos + ")";
        })
        .text(d.totalDistance + " KM");
}