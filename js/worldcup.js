// check http://jsfiddle.net/Qh9X5/1249/ for quadtree
// d3.labeler https://github.com/tinker10/D3-Labeler

var svg = d3.select("svg#map").attr({
    "width": function() {
      return this.clientWidth || this.parentElement.clientWidth;
    },
    "height": function() {
      return this.clientHeight || this.parentElement.clientHeight;
    },
    "viewBox": function() {
      return "0 0 " +
        (this.clientWidth || this.parentElement.clientWidth) + " " +
        (this.clientHeight || this.parentElement.clientHeight);
    }
  }),
  width = parseFloat(svg.attr("width")),
  height = parseFloat(svg.attr("height"));

window.addEventListener('resize', function() {
  svg.attr({
    "width": function() {
      return this.clientWidth || this.parentElement.clientWidth;
    },
    "height": function() {
      var currentWidth = this.clientWidth || this.parentElement.clientWidth,
        currentHeight = this.clientHeight || this.parentElement.clientHeight;
      return currentWidth * (currentHeight / currentWidth);
    }
  });
  width = parseFloat(svg.attr("width"));
  height = parseFloat(svg.attr("height"));
});

var projection = d3.geo.mercator()
  .center([0, -15])
  .rotate([52, 0])
  .scale((height * 74) / 55)
  .translate([width / 2, height / 2]);
var path = d3.geo.path()
  .projection(projection);
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
var axis = d3.select("#barAxis")
  .select("svg")
  .attr("height", function() {
    return this.clientHeight || this.parentElement.clientHeight;
  })
  .select("g")
  .attr("transform", "translate(0,-10)");
var bar1 = d3.select("#bar1")
  .select("svg")
  .attr("height", function() {
    return this.clientHeight || this.parentElement.clientHeight;
  })
  .select("g");
var bar2 = d3.select("#bar2")
  .select("svg")
  .attr("height", function() {
    return this.clientHeight || this.parentElement.clientHeight;
  })
  .select("g");

var definitions = svg.append("defs");
var geoRef = {
  stadium: {},
  concentration: {}
};

var barSize = [70, 600];
var weather = {};
var stad = definitions
  .append("g")
  .attr({
    "id": "stadium-marker",
    "transform": "translate(-10,-10)"
  }); // Concentration place marker

stad.append("circle")
  .attr({
    "cx": 11.614,
    "cy": 11.614,
    "r": 10,
    "fill": "#73C5E4",
    //"fill-opacity":"0",
    "stroke": "white",
    "stroke-width": "1.5px"
  });


stad.append("circle")
  .attr({
    "cx": 11.614,
    "cy": 11.614,
    "r": 7,
    "fill": "black",
    "fill-opacity": ".7",
    "stroke": "white",
    "stroke-width": "1.5px"
  });

/*
stad.append("line")
  .attr({
  	"x1":"11.614",
  	"y1":"6.562", 
  	"x2":"11.614", 
  	"y2":"17.182",
  	"fill": "#ffffff",
  	"stroke":"white",
  	"stroke-width":"2px" 
  });

stad.append("line")
  .attr({
  	"x1":"16.925",
  	"y1":"11.871", 
  	"x2":"6.305", 
  	"y2":"11.871",
  	"fill": "#ffffff",
  	"stroke":"white",
  	"stroke-width":"2px" 
  });  
*/


definitions
  .append("g")
  .attr("id", "concentration-marker") // Concentration place marker
.append("circle")
  .attr({
    "cx": 0,
    "cy": 0,
    "r": 4
  });
definitions
  .append("g")
  .attr("id", "plane") // Plane icon
.append("path")
  .attr("d", "M28.288,117.296v4.877l-7.129,4.455v1.744l7.129-2.303v4.111l-1.643,1.432v1.348l2.564-0.924l2.563,0.924v-1.348l-1.641-1.432v-4.111l7.129,2.303v-1.744l-7.129-4.455v-4.877c0-0.6-0.416-1.092-0.922-1.092C28.702,116.205,28.288,116.697,28.288,117.296z");

[bar1, bar2].forEach(function(entry) {
    entry.append("rect")
      .attr({
        "class": "bar_line",
        "x": 25.5,
        "y": barSize[1],
        "width": 7.755,
        "height": 0
      });

    var bar1title = entry.append("text")
      .attr({
        "x": 30,
        "y": barSize[1]-43,
        "class": "bar_title"
      });

    var matrix = "matrix(1 0 0 1 0 " + (parseFloat(barSize[1])-126) + ")";
    entry.append("use")
      .attr({
        "class": "bar_icon",
        "xlink:href": "#plane",
        "transform": matrix
      });

    entry.append("text")
      .attr({
        "x": 30,
        "y": barSize[1]-16,
        "class": "bar_details"
      })
      .text("0 KM");

  });


var linearScale = function() {
    return 136;
  },
  inverseLinearScale = function() {
    return 136;
  };

// Data process
queue()
  .defer(d3.json, "data/map.json")
  .defer(d3.json, "data/poi.json")
  .defer(d3.json, "data/teams.json")
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
      .attr({
        "xlink:href": function(d) { // Background images
          return "tiles/2/" + d[2] + "/" + d[0] + "/" + d[1] + ".jpg";
        },
        "width": Math.round(tiles.scale),
        "height": Math.round(tiles.scale),
        "x": function(d) {
          var x = Math.round((d[0] + tiles.translate[0]) * tiles.scale);
          return (x+(13-d[0]));
        },
        "y": function(d) {
          var y = Math.round((d[1] + tiles.translate[1]) * tiles.scale);
          return (y+(16-d[1]));
        }
      });
    // // OpenWheather Tiles
    // var tiles = tile();
    // map.append("g")
    //   .attr("class", "temperature")
    //   .attr("clip-path", "url(#clip)")
    //   .selectAll("image")
    //   .data(tiles)
    //   .enter()
    //   .append("image")
    //   .attr("xlink:href", function(d) { // openweathermap temperature
    //     return "http://" + ["a", "b", "c", "d"][Math.random() * 4 | 0] + ".tile.openweathermap.org/map/temp/" + d[2] + "/" + d[0] + "/" + d[1] + ".png";
    //   })
    //   .attr("width", Math.round(tiles.scale))
    //   .attr("height", Math.round(tiles.scale))
    //   .attr("x", function(d) {
    //     return Math.round((d[0] + tiles.translate[0]) * tiles.scale);
    //   })
    //   .attr("y", function(d) {
    //     return Math.round((d[1] + tiles.translate[1]) * tiles.scale);
    //   });
    // map.append("g")
    //   .attr("class", "precipitations")
    //   .attr("clip-path", "url(#clip)")
    //   .selectAll("image")
    //   .data(tiles)
    //   .enter()
    //   .append("image")
    //   .attr("xlink:href", function(d) { // openweathermap precipitations
    //     return "http://" + ["a", "b", "c", "d"][Math.random() * 4 | 0] + ".tile.openweathermap.org/map/precipitation/" + d[2] + "/" + d[0] + "/" + d[1] + ".png";
    //   })
    //   .attr("width", Math.round(tiles.scale))
    //   .attr("height", Math.round(tiles.scale))
    //   .attr("x", function(d) {
    //     return Math.round((d[0] + tiles.translate[0]) * tiles.scale);
    //   })
    //   .attr("y", function(d) {
    //     return Math.round((d[1] + tiles.translate[1]) * tiles.scale);
    //   });
    // Country limits (path)
    map.insert("path") // Land
    .datum(topojson.feature(json[0], json[0].objects.land))
      .attr({
        "class": "land",
        "id": "land",
        "d": path
      });
    // Country limit clipping
    svg.append("clipPath")
      .attr({
        "id": "clip",
        "xlink:xlink:href": "#land"
      })
      .append("use");
    // POI (stadiums, consentrations)
    poi.selectAll(".poi")
      .data(json[1].features.sort(function(a, b) {
        return (b.domain == "stadium") ? -1 : 1;
      }))
      .enter()
      .append("use")
      .attr({
        "id": function(d) {
          return d.properties.type + "." + ((d.properties.type == "stadium") ? d.properties.city : d.properties.team);
        },
        "xlink:xlink:href": function(d) {
          return "#" + d.properties.type + "-marker";
        },
        "class": function(d) {
          geoRef[d.properties.type][d.properties.city] = d.geometry.coordinates;
          return d.properties.type + " marker poi";
        },
        "x": function(d) {
          return path.centroid(d)[0];
        },
        "y": function(d) {
          return path.centroid(d)[1];
        }
      })
      .text(function(d) {
        return d.properties.city;
      })
      .on({
        "mouseover": function(d) {
          var thisTooltip = d3.select("#tooltip_stadium_" + ((d.name) ? d.name.replace(/\s|\(|\)/g, "_") : ""))
            .classed("disabled", false);
          d3.select("g[id ^=tooltip_concentration]")
            .classed("disabled", function() {
              return d.domain != "concentration";
            });
          /*
          var oponent = (d.oponent) ? d3.select("div.menuitem." + d.oponent.replace(/\s+|\.+/g, "_")).data()[0] : null;
                   drawBar(bar2, {
                     team: d.oponent,
                     totalDistance: (oponent || {
                       totalDistance: 0
                     }).totalDistance
                   });*/

          // d3.json("http://api.openweathermap.org/data/2.5/weather?lang=sp&units=metric&lat=" +
          //   d.geometry.coordinates[1] + "&lon=" + d.geometry.coordinates[0], function(weather) {
          //     thisTooltip.select(".temp.max")
          //       .text("Temperatura max: " + Math.round(weather.main.temp_max) + "°C");
          //   });
        },
        "mouseout": function(d) {
          d3.select("#tooltip_stadium_" + ((d.name) ? d.name.replace(/\s|\(|\)/g, "_") : ""))
            .classed("disabled", true);
          d3.select("g[id ^=tooltip_concentration]")
            .classed("disabled", false);
          drawBar(bar2, {
            team: "",
            totalDistance: 0
          });
        }
      });
    var bpMenu = function(selector, data) {
      var menu = (function(menu) {
        menu.event = d3.dispatch("selected", "mouseover", "mouseout", "menuout");
        (function(menuitems) {
          menuitems.nodes = (function(nodes) {
            nodes
              .append("div")
              .attr("class", function(d) {
                return "Group" + d.group;
              })
              .append("div")
              .attr("class", function(d) {
                return "menuitem radio " + d.team.replace(/\s+|\.+/g, "_").toLowerCase() + ((d.status) ? " " + d.status : "");
              })
              .on({
                "mouseover": function(d) {
                  if (this.id != "teamActive") {
                    menu.event.mouseover(d);
                  }
                },
                "mouseout": function() {
                  menu.event.mouseover(null);
                },
                "click": function(d) {
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
    var data = d3.keys(json[2])
      .map(function(entry) {
        json[2][entry].team = entry;
        json[2][entry].totalDistance = (json[2][entry].games
          .map(function(game) {
            return game.distance;
          })
          .reduce(function(prevDist, currentDist) {
            return prevDist + currentDist;
          })) * 2;
        return json[2][entry];
      })
      /*
      .sort(function(a, b) {
              return ((a.group.toLowerCase() > b.group.toLowerCase()) ? 1 : ((a.group.toLowerCase() < b.group.toLowerCase()) ? -1 : 0));
            });*/


    var maxDistance = d3.max(data, function(d) {
      return d.totalDistance;
    });

    linearScale = d3.scale.linear()
      .domain([0, maxDistance])
      .range(barSize);
    inverseLinearScale = d3.scale.linear()
      .domain([0, maxDistance])
      .range(barSize.reverse());

    var yAxis = d3.svg.axis()
      .scale(inverseLinearScale)
      .orient('right')
      .tickSize(130) // Tick size controls the width of the svg lines used as ticks
      .tickFormat(function(d) {
        return d + ((!d) ? " Km" : "");
      })
      .ticks(12);

    var yAxisGroup = axis.call(yAxis);

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
      .attr({
        "id": function(d, i) {
          return "route." + d.properties.team + "." + i;
        },
        "class": "line routes disabled",
        "x1": function(d) {
          return d.coordinates[0][0];
        },
        "y1": function(d) {
          return d.coordinates[0][1];
        },
        "x2": function(d) {
          return d.coordinates[1][0];
        },
        "y2": function(d) {
          return d.coordinates[1][1];
        }
      });
    menu = new bpMenu("#menu", data);
    menu.event.on("selected", function(d) {
      if (d) {
        d.stadiums = d.games.map(function(entry) {
          return entry.stadium;
        });
      }

      if (d) {
        drawBar(bar1, d);
        drawBar(bar2, {
          team: "",
          totalDistance: 0
        });
      } else {
        drawBar(bar1, {
          team: "",
          totalDistance: 0
        });
      }

      var pois = d3.selectAll("use[id^=concentration],use[id^=stadium],line[id^=route]");
      pois.datum(function(p) {
        var poi = this.getAttribute("id").split("."),
          poi_route = (poi[0] == "route") && d && d.team == poi[1],
          poi_noroute = (poi[0] != "route") && (!d || d.team == poi[1] || d.stadiums.indexOf(poi[1]) > -1);
        p.selected = (poi_route || poi_noroute);
        p.domain = poi[0];
        p.name = poi[1];
        p.gravity = p.anchor;
        p.oponent = (d && d.games[d.stadiums.indexOf(poi[1])]) ? d.games[d.stadiums.indexOf(poi[1])].oponent : null;
        return p;
      })
        .classed("disabled", function(s) {
          return !s.selected;
        })
        .classed("selected", function(s) {
          return (d && s.selected);
        })
        .classed("over", false);
      var boxes = d3.selectAll("g.tooltip");
      boxes.remove();
      var markers = d3.selectAll("use[id^=concentration]:not(.disabled),use[id^=stadium]:not(.disabled)");
      markers.each(function(s, i) {
        var xOffset = 41,
          yOffset = (s.domain == "concentration") ? 83 : -10,
          boxWidth = 150,
          boxHeight = 62;
        if (s.selected && d) {
          var marker = d3.select(this),
            thisTooltip = tooltips.datum(function() {
              return marker;
            })
            .append("g")
            .attr({
              "class": "tooltip " + s.domain,
              "id": "tooltip_" + s.domain + "_" + s.name.replace(/\s|\(|\)/g, "_")
            })
            .classed("disabled", function(t) {
              return s.domain != "concentration" && s.name != d.team;
            }),
            thisBox = thisTooltip.sort(function(a, b) {
              return parseFloat(b.attr("x")) - parseFloat(a.attr("x"));
            })
            .append("g")
            .on({
              "mouseover": function(s) {
                d3.select(this).classed("hidden", function(t) {
                  return t.domain != "concentration";
                })
              },
              "mouseout": function(s) {
                d3.select(this).classed("hidden", function(t) {
                  return t.domain == "concentration";
                })
              }
            })
            .attr({
              "viewBox": "0 0 " + width + " " + height,
              "transform": function(p) {
                p.width = boxWidth;
                p.height = boxHeight;
                p.x = parseFloat(p.attr("x")) - boxWidth / 2;
                // ((s.domain == "stadium") ? (-xOffset - boxWidth) : xOffset);
                p.y = parseFloat(p.attr("y")) - boxHeight - 10;
                p.y = (p.y < 0 || p.y > (height - boxHeight - 10)) ? height - boxHeight + yOffset : p.y + yOffset;
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
              }
            });
          var containerbox = thisBox.append("rect") //box
          .attr({
            "class": "box disable-hover",
            "x": 0,
            "y": 0,
            "width": boxWidth,
            "height": boxHeight
          });
          if (s.domain == "concentration") {
            //Team text
            thisBox.append("text")
              .attr({
                "class": "team  disable-hover",
                "x": 5,
                "y": 35
              })
              .text(d.team);
            //City text
            thisBox.append("text")
              .attr({
                "class": "city disable-hover",
                "x": 5,
                "y": 52
              })
              .text(d.concentration);
            //Concentración text
            thisBox.append("text")
              .attr({
                "class": "type disable-hover",
                "x": 5,
                "y": 17
              })
              .text("Concentración");
          } else {
            //Team text
            thisBox.append("text")
              .attr({
                "class": "stadium disable-hover",
                "x": 5,
                "y": 17
              })
              .text(s.name);
            //Opponent
            thisBox.append("text")
              .attr({
                "class": "opponent disable-hover",
                "x": 5,
                "y": 57
              })
              .text(function(p) {
                var opponents = d.games.map(function (v,i,a) {
                                  return (v.stadium == s.name) ? v.oponent : null;
                                }).reduce(function (p,c) {
                                  p = (Array.isArray(p)) ? p : (p) ? [p] : [];
                                  if (c) {
                                    p.push(c);
                                  }
                                  return p;
                                }).join(" / "),
                    match = d.team + "  vs.  " + opponents;
                containerbox.attr({
                  "width": Math.max(match.length * 5 + 6, boxWidth)
                });
                return match;
              });
            //box
            thisBox.append("rect")
              .attr({
                "class": "box distance disable-hover",
                "x": 5,
                "y": 22,
                "width": 55,
                "height": 20
              });
            
            //Team text
            thisBox.append("text")
              .attr({
                "class": "distance disable-hover",
                "x": 9,
                "y": 37
              })
              .text(function(p) {
                var index = d.stadiums.indexOf(s.name);
                return d.games[index].distance + " Km";
              });
            //Temp text
            // Aca borre el chain del txt de las temperaturas minimas!
            //Temp text
            /*
            thisBox.append("text")
                          .attr({
                            "class": "temp max disable-hover",
                            "x": 85,
                            "y": 52
                          })
                          .text("Temperatura max: N/D");*/

          }
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
      d3.selectAll("use[id^=concentration],use[id^=stadium],line[id^=route]")
        .datum(function(p) {
          var poi = this.getAttribute("id").split("."),
            poi_route = (poi[0] == "route") && d && d.team == poi[1],
            poi_noroute = (poi[0] != "route") && (!d || d.team == poi[1] || d.stadiums.indexOf(poi[1]) > -1);
          p.over = (poi_route || poi_noroute);
          p.domain = poi[0];
          p.name = poi[1];
          p.route = poi_route;
          return p;
        })
        .classed({
          "over": function(s) {
            return d && !s.selected && s.over;
          },
          "disabled": function(s) {
            return (!d && !s.selected) || (!s.selected && !s.over);
          }
        });

      if (d) {
        drawBar(bar2, d);
      } else {
        drawBar(bar2, {
          team: "",
          totalDistance: 0
        });
      }

    });
  });
function drawBar(bar, d) {
  var team = (d.team) ? d.team.split(/\s+/) : [];

  d.totalDistance = (d.team) ? d.totalDistance : 0;

  var title = bar.select("text.bar_title");

  title.selectAll("tspan").remove();

  title.transition()
    .attr({
      "x": 30,
      "y": inverseLinearScale(d.totalDistance) - 24
    });

  while (team.length > 0) {
    title.append("tspan")
      .attr({
        "x": 30,
        "dy": "-1.1em"
      })
      .text(team.pop() || "");
  }

  bar.select("use")
    .transition()
    .attr("transform", function() {
      var vpos = inverseLinearScale(d.totalDistance) - 126;
      return "matrix(1 0 0 1 0 " + vpos + ")";
    });
  bar.select("rect")
    .transition()
    .attr({
      "y": inverseLinearScale(d.totalDistance),
      "height": function() {
        var height = linearScale(d.totalDistance) - 80;
        height = (height < 0) ? 0 : height;
        return height;
      }
    });
  bar.select("text.bar_details")
    .transition()
    .attr({
      "x": 30,
      "y": inverseLinearScale(d.totalDistance) - 16
    })
    .text(d.totalDistance + " KM");
}