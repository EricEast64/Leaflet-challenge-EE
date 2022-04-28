// create tile layers for the map backgrounds
// default street map
var streetMap = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
	maxZoom: 19,
	attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
});

// simple grey map
var lightMap = L.tileLayer('https://tiles.stadiamaps.com/tiles/alidade_smooth/{z}/{x}/{y}{r}.png', {
	maxZoom: 20,
	attribution: '&copy; <a href="https://stadiamaps.com/">Stadia Maps</a>, &copy; <a href="https://openmaptiles.org/">OpenMapTiles</a> &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors'
});

// topographic map
var topoMap = L.tileLayer('https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png', {
	maxZoom: 17,
	attribution: 'Map data: &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, <a href="http://viewfinderpanoramas.org">SRTM</a> | Map style: &copy; <a href="https://opentopomap.org">OpenTopoMap</a> (<a href="https://creativecommons.org/licenses/by-sa/3.0/">CC-BY-SA</a>)'
});

// create basemaps object
let basemaps = {
    Street: streetMap,
    Light: lightMap,
    Topographic: topoMap
}

// create map object
var myMap = L.map("map", {
    center: [35.40659909030526, -119.01860729960146],
    zoom: 3,
    layers: [streetMap, lightMap, topoMap]
});

// add the light map to the map object
streetMap.addTo(myMap);

// get tectonic plate data, add to map
// variable to hold the pates layer
let tectonicPlates = new L.layerGroup();

// call the API to get the info for the tectonic plates
d3.json("https://raw.githubusercontent.com/fraxen/tectonicplates/master/GeoJSON/PB2002_boundaries.json")
.then(function(plateData){
    // console log to check the data
    // console.log(plateData)

    // load the data with geoJson, add to tectonic plates payer
    L.geoJson(plateData,{
        color: "orange",
        weight: 1.5
    }).addTo(tectonicPlates);
});

// add tectonic plates layer to map
tectonicPlates.addTo(myMap);

// create layer for the earthquakes
let earthquakes = new L.layerGroup();

// API call for earthquake layer group
d3.json("https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson")
.then(function(earthquakeData){
    // console.log(earthquakeData);
    // plot circles with radius based on magnitude and color based on depth
    function dataColor(depth){
        if (depth >90)
            return "#ff0000";
        else if (depth >70)
            return "#ff4800";
        else if (depth >50)
            return "#ff8000";
        else if (depth >30)
            return "#ffdd00";
        else if (depth >10)
            return "#e5ff00";
        else
            return "#6aff00";
    }

    // function to determine the size of the markers
    function radiusSize(mag){
        if (mag == 0)
            return 1;
        else
            return mag * 4;   
    }
    function dataStyle(feature)
    {
        return {
            opacity: 1,
            fillOpacity: .6,
            fillColor: dataColor(feature.geometry.coordinates[2]),
            color: "black",
            radius: radiusSize(feature.properties.mag),
            weight: 0.4
        }
    }
    // add the geoJson data
    L.geoJson(earthquakeData, {
        // add map markers to this layer
        pointToLayer: function(feature, latLng) {
            return L.circleMarker(latLng);
        },
        // set the style for each marker
        style: dataStyle,
        // add popups to label earthquakes
        onEachFeature: function(feature, layer){
            layer.bindPopup(`Magnitude: <b>${feature.properties.mag}</b><br>
                            Depth <b>${feature.geometry.coordinates[2]}</b><br>
                            Location: <b>${feature.properties.place}</b>`);
        }
    }).addTo(earthquakes);
});

earthquakes.addTo(myMap);

// create overlay functionality for tectonic plates layer
let overlays = {
    "Tectonic Plates": tectonicPlates,
    "Earthquakes": earthquakes
}

// layer control
L.control
    .layers(basemaps, overlays)
    .addTo(myMap);

// add the legend to the map
let legend = L.control({
    position: "bottomright"
});

// add the properties for the legend
legend.onAdd = function() {
    // div for the legend to appear on page
    let div = L.DomUtil.create("div", "info legend");

    // set up intervals for color grading
    let intervals = [-10, 10, 30, 50, 70, 90];
    let colors = ["6aff00","e5ff00","ffdd00","ff8000","ff4800","ff0000"];

    // loop through the intervals and the colors and generate label squares
    for(var i = 0; i < intervals.length; i++)
    {
        div.innerHTML += "<i style='background:  "
            + colors[i]
            + "'></i  "
            + intervals[i]
            + (intervals[i + 1] ? "km &ndash km;" + intervals[i + 1] + "km<br>" : "+");
    }

    return div;
};

legend.addTo(myMap);

