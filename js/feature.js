
// This is the infobox object
var temp_info;

// Contains aggregated data for district, zipcode, census tract
var aggregated_data;

var global_type = 'District';

var global_key;

var layer_title;

var currentoverlayer = 'LA District';

// Tracks if mouse is hovering a layer (1) or not hovering a layer (0)
var mouse_status = 0;

var featuremap = null;

var featurelegend = null;
var featurelegends = [];

var info_text_array = [];
var info_units = null;
var info_eqkpiname = '';

/**
 * @desc fills district with different colors based on total metric value
*/
var zScoretoPercentileMap = {
    "-1.15" : 12.5,
    "-0.675" : 25,
    "-0.319" : 37.5,
    "0" : 50,
    "0.319" : 62.5,
    "0.675" : 75,
    "1.15" : 82.5,
    "3.0" : 100,
};
//https://upload.wikimedia.org/wikipedia/commons/b/bb/Normal_distribution_and_scales.gif
//percentile bucket of a given total_metric
    //Pr(Z<1.15)=0.875        
    //Pr(Z<−1.15)=0.125
    //753+−1.15×594 = 69.9 totalmetriccutoff <12.5
    //69.9-753 / 594 = -1.15 
    //Pr(Z<−0.675)=0.25
    //753+−0.675×594
    //Pr(Z<−0.319)=0.375
    //753+−0.319×594
    //Pr(Z<0)=0.5
    //753+0×594
function styleMetricByStandardDeviation(mean, stddev, colorMapName) {
    return( function(feature) {
        var totmet = NullUndefinedCheck( feature.properties.total_metric ) ? 0 : feature.properties.total_metric;
        var color = getMetricColor( ((totmet - mean) / stddev ), colorMapName);
        return {
            fillColor: color,
            weight: 2,
            opacity: 1,
            color: color,
            fillOpacity: equityMetricValueOpacityMap[colorMapName]
        };
    }); 
    
    
}
/**
 * @desc poverty look for all geojson themes
*/
function stylePoverty(feature) {
    var style = {
        // color of overlay
        color: getMetricColor(feature.properties.POVERTY, "poverty"),
        // thickness of border
        weight: 1,
        opacity: 1,
        dashArray: '3',
        // fill inside multipolygon
        fillOpacity: 1
    };
    // if( feature.properties.POVERTY <= 6.25)
    //     style.fillOpacity = 0.01;
    return style;
}
/**
 * @desc education look for all geojson themes
*/
function styleEducation(feature) {
    var style = {
        // color of overlay
        color: getMetricColor(feature.properties.EDUCATION_PCT, "education"),
        // thickness of border
        weight: 1,
        opacity: 1,
        dashArray: '3',
        // fill inside multipolygon
        fillOpacity: 1
    };
    // if( feature.properties.EDUCATION_PCT <= 6.25)
    //     style.fillOpacity = 0.01;
    return style;
}


/**
 * @desc fills district with different colors based on id
*/
function styleNeighborhood(feature) {
    var border_color;
    var fill_color;
    
    switch(feature.properties.nh_district){
        case '1':
            border_color = '#F1C8C5';
            fill_color = '#F1C8C5';
            break;
        case '2':
            border_color = '#EDB8E6';
            fill_color = '#EDB8E6';
            break;
        case '3':
            border_color = '#C6EABF';
            fill_color = '#C6EABF';
            break;
        case '4':
            border_color = '#80CB7B';
            fill_color = '#80CB7B';
            break;
        case '5':
            border_color = '#EDB8E6';
            fill_color = '#EDB8E6';
            break;
        case '6':
            border_color = '#BDA2EA';
            fill_color = '#BDA2EA';
            break;
        case '7':
            border_color = '#145FF5';
            fill_color = '#145FF5';
            break;
        case '8':
            border_color = '#C6C4D2';
            fill_color = '#C6C4D2';
            break;
        case '9':
            border_color = '#F9F7AA';
            fill_color = '#F9F7AA';
            break;
        case '10':
            border_color = '#F0D49D';
            fill_color = '#F0D49D';
            break;
        case '11':
            border_color = '#F2AC86';
            fill_color = '#F2AC86';
            break;
        case '12':
            border_color = '#B4B18B';
            fill_color = '#B4B18B';
            break;
        default:
            border_color = 'black';
            fill_color = 'black';
            break;
    }
    return {
        weight: 3,
        color: border_color,
        fillColor: fill_color,
        fillOpacity: 0.5
    };
}

/**
 * @desc district boundary with with no fill and different colors based on id
*/
function styleNeighborhoodClear(feature) {
    var border_color;
    
    switch(feature.properties.nh_district){
        case '1':
            border_color = '#F1C8C5';
            break;
        case '2':
            border_color = '#EDB8E6';
            break;
        case '3':
            border_color = '#C6EABF';
            break;
        case '4':
            border_color = '#80CB7B';
            break;
        case '5':
            border_color = '#EDB8E6';
            break;
        case '6':
            border_color = '#BDA2EA';
            break;
        case '7':
            border_color = '#145FF5';
            break;
        case '8':
            border_color = '#C6C4D2';
            break;
        case '9':
            border_color = '#F9F7AA';
            break;
        case '10':
            border_color = '#F0D49D';
            break;
        case '11':
            border_color = '#F2AC86';
            break;
        case '12':
            border_color = '#B4B18B';
            break;
        default:
            border_color = 'black';
            break;
    }
    return {
        weight: 3,
        color: border_color,
        fillOpacity: 0.0
    };
}

var equityMetricValueColorMap = {
    education : [
        { 12.5 : '#f7fcfd'},
        { 25 : '#e5f5f9'},
        { 37.5 : '#ccece6'},
        { 50 : '#99d8c9'},
        { 62.5 : '#66c2a4'},
        { 75 : '#41ae76'},
        { 82.5 : '#238b45'},
        { 100 : '#005824'},
    ],
    poverty : [
        { 12.5 : '#f7fcfd'},
        { 25 : '#e0ecf4'},
        { 37.5 : '#bfd3e6'},
        { 50 : '#9ebcda'},
        { 62.5 : '#8c96c6'},
        { 75 : '#8c6bb1'},
        { 82.5 : '#88419d'},
        { 100 : '#6e016b'},
    ],
    allkpis : [
        { "-1.15" : '#6e016b'},
        { "-0.675" : '#88419d'},
        { "-0.319" : '#8c6bb1'},
        { "0" : '#8c96c6'},
        { "0.319" : '#9ebcda'},
        { "0.675" : '#bfd3e6'},
        { "1.15" : '#e0ecf4'},
        { "3" : '#f7fcfd'},
    ],
    comparisonred : [
        { "-1.15" : '#99000d'},
        { "-0.675" : '#cb181d'},
        { "-0.319" : '#ef3b2c'},
        { "0" : '#fb6a4a'},
        { "0.319" : '#fc9272'},
        { "0.675" : '#fcbba1'},
        { "1.15" : '#fee0d2'},
        { "3" : '#fff5f0'},
    ],
    comparisonblue : [
        { "-1.15" : '#084594'},
        { "-0.675" : '#2171b5'},
        { "-0.319" : '#4292c6'},
        { "0" : '#6baed6'},
        { "0.319" : '#9ecae1'},
        { "0.675" : '#c6dbef'},
        { "1.15" : '#deebf7'},
        { "3" : '#f7fbff'},
    ],
};

var equityMetricValueTotalsMap = {
    poverty : {
        12.5 : 12.5,
        25 : 25,
        37.5 : 37.5,
        50 : 50,
        62.5 : 62.5,
        75 : 75,
        82.5 : 82.5,
        100 : 100
    },
    education : {
        12.5 : 12.5,
        25 : 25,
        37.5 : 37.5,
        50 : 50,
        62.5 : 62.5,
        75 : 75,
        82.5 : 82.5,
        100 : 100
    }
};

var equityMetricValueOpacityMap = {
    comparisonred : 0.7,
    comparisonblue : 1.0
};

var equityMetricLegendTextMap = {
    poverty : "Poverty",
    education : "Education",
};

/**
 * @desc determines colors
 * @param d is a number
*/
function getColor(d) {
    if (d > 300)
        return '#034e7b';
    else if (d > 250)
        return '#0570b0';
    else if (d > 200)
        return '#3690c0';
    else if (d > 150)
        return '#74a9cf';
    else if (d > 100)
        return '#a6bddb';
    else if (d > 50)
        return '#d0d1e6';
    else if (d > 10)
        return '#ece7f2';
    else
        return '#fff7fb';
}
/**
 * @desc determines education colors, an array is used to ensure ordering
 * @param d is a number
*/
/**
 * @desc determines poverty colors, an array is used to ensure ordering
 * @param d is a number
*/
function getMetricColor(d, metricname) {
    d = Number(d);
    var colormap = equityMetricValueColorMap[metricname];
    for( var i = 0; i < colormap.length; i++ ){
        if (d <= Number(Object.entries(colormap[i])[0][0]))
            return Object.entries(colormap[i])[0][1];
    }
    return Object.entries(colormap[colormap.length-1])[0][1];
}

/**
 * @desc customizes markers to display sum of count  
 */
function markerCustomFeature(cluster) {
    var children = cluster.getAllChildMarkers();
    var sum = 0;
    for (var i = 0; i < children.length; i++) {
        sum = sum + children[i].number;
    }

    var c = ' marker-cluster-';
    if (sum < 10) {
        c += 'small';
    } else if (sum < 100) {
        c += 'medium';
    } else {
        c += 'large';
    }

    return new L.DivIcon({ html: '<div><span>' + sum + '</span></div>', className: 'marker-cluster' + c, iconSize: new L.Point(40, 40) });
}

/**
 * @desc sum up count and calulate standard deviation from json 
 * @param {*}  json - data provided by web service
 * @param {*}  type - type is zipcode, district, census, or neighborhood
 * @return {*} an array of objects and std dev ex.  standarddeviation : 9.99, aggregatedata : [{"zipcode": 90012, "total_metric": 100 }, {..}]
*/
function sumandstddev_totalmetric(json, type) {
    var dict = {};
    var result = {aggregatedata : [], standarddeviation : 0, mean : 0};
    var validtypes = ["District", "Zipcode", "Census", "NH_District"];
    var total = 0;

    // check if type is valid
    if (validtypes.indexOf(type) < 0) {
        alert("Error: " + type + " does not exist.");
        return null;
    }
    type = type.toLowerCase();
    // loop through json
    for (var i = 0; i < json.length; i++) {
        // if type does not exist or is null in row property, skip it and move onto the next row property
        if(!NullUndefinedCheck(json[i][type])) {
            // if type key does not exist in in dict add key and value to dict
            if (!dict.hasOwnProperty(json[i][type])) {
                dict[json[i][type]] = json[i]["count"];
            }
            // if type key exist in dict sum up total metric in dict with json count
            else {
                dict[json[i][type]] = dict[json[i][type]] + json[i]["count"];
            }
            total += json[i]["count"];
        }
        
    }
    var keys = Object.keys(dict);
    var mean = total / keys.length;
    var totalmeandifferencesquared = 0;

    // insert object {district: key, total_metric: value} into result array
    for (key of keys) {
        let temp = {};
        temp[type] = key;
        temp["total_metric"] = dict[key];
        result.aggregatedata.push(temp);
        var meandifferencesquared = Math.pow(dict[key] - mean, 2);
        totalmeandifferencesquared += meandifferencesquared;
    }

    var variance = totalmeandifferencesquared / keys.length;
    result.standarddeviation = Math.pow( variance, 0.5 );
    result.mean = mean;

    return result;
}

/**
 * @desc sum up count from json and return result of aggregated value in json structure
 * @param {*}  json - data provided by web service
 * @param {*}  type - type is zipcode, district, census, or neighborhood
 * @return {*} an array of objects ex. {"zipcode": 90012, "total_metric": 100 }, {..}
*/
function sum_totalmetric(json, type) {
    var dict = {};
    var result = [];
    var validtypes = ["District", "Zipcode", "Census", "NH_District"];

    // check if type is valid
    if (validtypes.indexOf(type) < 0) {
        alert("Error: " + type + " does not exist.");
        return null;
    }
    type = type.toLowerCase();
    // loop through json
    for (var i = 0; i < json.length; i++) {
        // if type does not exist or is null in row property, skip it and move onto the next row property
        if(!NullUndefinedCheck(json[i][type])) {
            // if type key does not exist in in dict add key and value to dict
            if (!dict.hasOwnProperty(json[i][type])) {
                dict[json[i][type]] = json[i]["count"];
            }
            // if type key exist in dict sum up total metric in dict with json count
            else {
                dict[json[i][type]] = dict[json[i][type]] + json[i]["count"];
            }
        }
    }
    var keys = Object.keys(dict);

    // insert object {district: key, total_metric: value} into result array
    for (key of keys) {
        let temp = {};
        temp[type] = key;
        //https://javascript.info/number#imprecise-calculations
        temp["total_metric"] = +dict[key].toFixed(2);
        result.push(temp);
    }

    return result;
}

var typeToGeoJsonPropertyMap = {
    "DISTRICT": "name",
    "ZIPCODE": "ZIPCODE",
    "CENSUS": ["CT10", "GEOID10"]
};
/**
 * @desc inserts total metric value into geojson theme
 * @param {*}  aggregatejson - array of { District / Zipcode / Census : Value Count } For Example: [ { 90004 : 100 } ]
 * @param {*}  geojson - GeoJSON
 * @return {*} new geojson with in geojson[0]["features"][i]["properties"]["metadata"]["total_metric"] = item.totalmetric;
*/
function insert_totalmetric(aggregatejson, geojson) {

    if (NullUndefinedCheck(aggregatejson) || NullUndefinedCheck(geojson)) return null;
    if ((aggregatejson.length === 0) || (geojson.length === 0)) return null;

    var type = Object.keys(aggregatejson[0])[0];
    type = type.toUpperCase();

    if ((type != "DISTRICT") && (type != "ZIPCODE") && (type != "CENSUS")) {
        alert("Error: " + type + " does not exist.");
        return null;
    }
    // { typeid : total metric count }
    // { "90001" : 111 } or { "10" : 211 }
    var aggregatedict = {};
    for (item of aggregatejson) {
        var values = Object.values(item);
        aggregatedict[values[0]] = values[1];
    }

    for (var i = 0; i < geojson[0]["features"].length; i++) {
        if( type === "CENSUS" ) {
            var idandtm = getIDAndTotalMetricFromCensus(geojson[0]["features"][i]["properties"] , aggregatedict);
            if( !NullUndefinedCheck(idandtm) ) {
                geojson[0]["features"][i]["properties"]["metadata"] = {};
                geojson[0]["features"][i]["properties"]["metadata"][type] = idandtm.idnum;
                geojson[0]["features"][i]["properties"]["total_metric"] = idandtm.totalmetric;
            }
        }
        else if (!NullUndefinedCheck(geojson[0]["features"][i]["properties"][typeToGeoJsonPropertyMap[type]])) {
            geojson[0]["features"][i]["properties"]["metadata"] = {};
            // "metadata": {"DISTRICT": "10"},
            geojson[0]["features"][i]["properties"]["metadata"][type] = geojson[0]["features"][i]["properties"][typeToGeoJsonPropertyMap[type]];
            // "total_metric":143,
            geojson[0]["features"][i]["properties"]["total_metric"] = aggregatedict[geojson[0]["features"][i]["properties"][typeToGeoJsonPropertyMap[type]]];
        }
    }

    return geojson;
}

/**
 * @desc inserts total metric value and label into geojson theme
 * @param {*}  aggregatejson - array of { District / Zipcode / Census : Value Count } For Example: [ { 90004 : 100 } ]
 * @param {*}  geojson - GeoJSON
 * @return {*} new geojson with in geojson[0]["features"][i]["properties"]["metadata"]["total_metric"] = item.totalmetric;
*/
function createlabellayer(aggregatejson, geojson) {

    if (NullUndefinedCheck(aggregatejson) || NullUndefinedCheck(geojson)) return null;
    if ((aggregatejson.length === 0) || (geojson.length === 0)) return null;

    var type = Object.keys(aggregatejson[0])[0];
    type = type.toUpperCase();

    if ((type != "DISTRICT") && (type != "ZIPCODE") && (type != "CENSUS")) {
        alert("Error: " + type + " does not exist.");
        return null;
    }
    // { typeid : total metric count }
    // { "90001" : 111 } or { "10" : 211 }
    var aggregatedict = {};
    for (item of aggregatejson) {
        var values = Object.values(item);
        aggregatedict[values[0]] = values[1];
    }
    //Build layergroup
    var layerGroup = new L.layerGroup();
    var features = [];
    for (var i = 0; i < geojson[0]["features"].length; i++) {
        if( type === "CENSUS" ) {
            var idandtm = getIDAndTotalMetricFromCensus(geojson[0]["features"][i]["properties"] , aggregatedict);
            if( !NullUndefinedCheck(idandtm) ) {
                geojson[0]["features"][i]["properties"]["metadata"] = {};
                geojson[0]["features"][i]["properties"]["metadata"][type] = idandtm.idnum;
                geojson[0]["features"][i]["properties"]["total_metric"] = idandtm.totalmetric;
            }
        }
        else if (!NullUndefinedCheck(geojson[0]["features"][i]["properties"][typeToGeoJsonPropertyMap[type]])) {
            geojson[0]["features"][i]["properties"]["metadata"] = {};
            // "metadata": {"DISTRICT": "10"},
            geojson[0]["features"][i]["properties"]["metadata"][type] = geojson[0]["features"][i]["properties"][typeToGeoJsonPropertyMap[type]];
            // "total_metric":143,
            geojson[0]["features"][i]["properties"]["total_metric"] = aggregatedict[geojson[0]["features"][i]["properties"][typeToGeoJsonPropertyMap[type]]];
            
            //find zip in zipcodecenters
            for( var j = 0; j < zipcodecenters.features.length; j++) {
                if( zipcodecenters.features[j]["properties"]["zip"] === geojson[0]["features"][i]["properties"][typeToGeoJsonPropertyMap[type]] ) {
                    if( !NullUndefinedCheck( aggregatedict[geojson[0]["features"][i]["properties"][typeToGeoJsonPropertyMap[type]]] ) ) {
                        //create label
                        var labelLocation = new L.LatLng(zipcodecenters.features[j]["properties"]["latitude"], zipcodecenters.features[j]["properties"]["longitude"]);
                        //add to layergroup
                        layerGroup.addLayer( new L.LabelOverlay(labelLocation, aggregatedict[geojson[0]["features"][i]["properties"][typeToGeoJsonPropertyMap[type]]]) );
                        // layerGroup.addLayer( new L.LabelOverlay(labelLocation, geojson[0]["features"][i]["properties"][typeToGeoJsonPropertyMap[type]] ) );
                    }
                }
            }
        }
    }
    return layerGroup;
}

function getIDAndTotalMetricFromCensus(propertiesforcensustype, totalmetricdict) {
    for( var i = 0; i < typeToGeoJsonPropertyMap["CENSUS"].length; i++ ) {
        var id = propertiesforcensustype[typeToGeoJsonPropertyMap["CENSUS"][i]];
        var totalmetric = totalmetricdict[ id ];
        
        if( !NullUndefinedCheck( totalmetric ) ) {
            return { 
                "totalmetric" : totalmetric,
                "idnum" : id
            };
        }
    }
    return null;
}

function filterDataByDateRange(equitykpimetricsdata, usermonthfrom, usermonthto) {
    var data = [];
    if( NullUndefinedCheck(equitykpimetricsdata) || NullUndefinedCheck(usermonthfrom) 
    || NullUndefinedCheck(usermonthto) )
        return null;
    var usermonthfromint = parseInt(usermonthfrom);
    var usermonthtoint = parseInt(usermonthto);
    equitykpimetricsdata.forEach((item, index, array) => {
        if( ( item.reporting_month >= usermonthfromint ) && ( item.reporting_month <= usermonthtoint ) )
            data.push(item);
    });
    return data;
}

function aggregateAllTypes(data){
    var temp_district = [];
    var temp_zipcode = [];
    var temp_census = [];
    var temp_neighborhood = [];
    var temp_allTypes = [];
    var object = {
        'District':{},
        'Zipcode':{},
        'Census':{},
        'NH_District':{}
    };

    temp_district = sum_totalmetric(data,'District');
    temp_zipcode = sum_totalmetric(data,'Zipcode');
    temp_census = sum_totalmetric(data,'Census');
    temp_neighborhood = sum_totalmetric(data,'NH_District');
    temp_allTypes = temp_district.concat(temp_zipcode,temp_census,temp_neighborhood);

    for(var i = 0; i < temp_allTypes.length; i++){
        if(temp_allTypes[i].hasOwnProperty('district')){
            object['District'][temp_allTypes[i]['district']] = temp_allTypes[i]['total_metric'];
        }
        else if(temp_allTypes[i].hasOwnProperty('zipcode')){
            object['Zipcode'][temp_allTypes[i]['zipcode']] = temp_allTypes[i]['total_metric'];
        }
        else if(temp_allTypes[i].hasOwnProperty('census')){
            object['Census'][temp_allTypes[i]['census']] = temp_allTypes[i]['total_metric'];
        }
        else if(temp_allTypes[i].hasOwnProperty('nh_district')){
            object['NH_District'][temp_allTypes[i]['nh_district']] = temp_allTypes[i]['total_metric'];
        }
    }
    aggregated_data = object;
}

/**
 * @desc filter out null Latitude and Longitudes from data json and return result of cleaned data in json data
 * @param {*}  json - Equity KPI Metrics data provided by web service / database
 * @return {*} an array of data ex. {"x": -118, "y": 34, "district" : 1, "zipcode" : 90004, "census" : "00999", ...}
*/
function filterOutNullLatLongs(json) {
    var data = [];
    if( NullUndefinedCheck(json) )
        return null;
    json.forEach((item, index, array) => {
        if( ( !NullUndefinedCheck(item.x) ) && ( !NullUndefinedCheck(item.y) ) )
            data.push(item);
    });
    return data;
}

function createMarkerCluster(data){
    var temp_markers = L.markerClusterGroup({
        maxClusterRadius: 45
    });
    for(item of data){
        const temp_marker = L.marker(new L.LatLng(item.y, item.x));
        temp_markers.addLayer(temp_marker);
    }
    temp_markers["layerName"] = "cluster";
    return temp_markers;
}

function createHeatLayer(data){
    //Declarations
    var latlng_array = [];
    var latlng;

    var intensity = Math.pow(0.05, data.length * 0.00001) +0.08;

    for (item of data) {
        latlng = [item.y, item.x, intensity];
        latlng_array.push(latlng);
    }

    // Add/Create heat layer
    var options = {
        gradient: { 0.4: 'green', 0.65: 'blue', 1: 'purple' },
        blur: 10
    }
    var temp_heatlayer = L.heatLayer(latlng_array, options);
    temp_heatlayer["layerName"] = "heat";
    return temp_heatlayer;
}

function createComparisonHeatLayer(data) {
    //Declarations
    var latlng_array = [];
    var latlng;

    var intensity = Math.pow(0.05, data.length * 0.00001) +0.08;

    for (item of data) {
        latlng = [item.y, item.x, intensity];
        latlng_array.push(latlng);
    }

    // Add/Create heat layer
    var options = {
        gradient: { 0.4: 'green', 0.65: 'blue', 1: 'purple' },
        blur: 10
    }
    var temp_heatlayer = L.heatLayer(latlng_array, options);
    temp_heatlayer["layerName"] = "comparisonheat";
    return temp_heatlayer;
}

function setEquityMetricValueTotalsMap(mean, stddev, layerName) {
    var valuetotals = {
        "-1.15" : null,
        "-0.675" : null,
        "-0.319" : null,
        "0" : null,
        "0.319" : null,
        "0.675" : null,
        "1.15" : null,
        "3" : null,
    };

    Object.entries(valuetotals).forEach((valuetotal, index, array) => {
        // [["-1.15" : null], ["-0.675" : null], ...  ] Object.entries(valuetotals)
        //[ "-1.15" : null ] etc. valuetotal
        //-1.15, -0.675, -0.319 etc. valuetotal[0]
        valuetotals[valuetotal[0]] = mean + (Number(valuetotal[0]) * stddev);
    });

    equityMetricValueTotalsMap[layerName] = valuetotals;
    
}

function createComparisonLayer(comparisonYearData, label) {

    var aggandstddev = sumandstddev_totalmetric(comparisonYearData,'Zipcode');
    var comparison_zipcode = aggandstddev.aggregatedata;
    
    var lacomparison_geo = insert_totalmetric(comparison_zipcode, get_LAZipcode_GeoJSON());
    var comparisonoverlay = L.geoJson(lacomparison_geo, {
        style: styleMetricByStandardDeviation(aggandstddev.mean, aggandstddev.standarddeviation, "comparisonred"),
    });
    setEquityMetricValueTotalsMap(aggandstddev.mean, aggandstddev.standarddeviation, "comparison");
    comparisonoverlay["layerName"] = "comparison";
    equityMetricLegendTextMap["comparison"] = label;
    return comparisonoverlay;
}

function createComparisonAltLayer(comparisonYearData, label) {

    var aggandstddev = sumandstddev_totalmetric(comparisonYearData,'Zipcode');
    var comparison_zipcode = aggandstddev.aggregatedata;
    
    var lacomparison_geo = insert_totalmetric(comparison_zipcode, get_LAZipcode_GeoJSON());
    var comparisonoverlay = L.geoJson(lacomparison_geo, {
        style: styleMetricByStandardDeviation(aggandstddev.mean, aggandstddev.standarddeviation, "comparisonblue"),
    });
    setEquityMetricValueTotalsMap(aggandstddev.mean, aggandstddev.standarddeviation, "comparisonalt");
    comparisonoverlay["layerName"] = "comparisonalt";
    equityMetricLegendTextMap["comparisonalt"] = label;
    return comparisonoverlay;
}

function createCurrentZipcodeLayer(currentdata, label) {
    var aggandstddev = sumandstddev_totalmetric(currentdata,'Zipcode');
    var current_zipcode = aggandstddev.aggregatedata;
    var lacurrentzipcode_geo = insert_totalmetric(current_zipcode, get_LAZipcode_GeoJSON());
    var currentoverlay = L.geoJson(lacurrentzipcode_geo, {
        style: styleMetricByStandardDeviation(aggandstddev.mean, aggandstddev.standarddeviation, "comparisonblue"),
    });
    setEquityMetricValueTotalsMap(aggandstddev.mean, aggandstddev.standarddeviation, "currentzipcode");
    currentoverlay["layerName"] = "currentzipcode";
    equityMetricLegendTextMap["currentzipcode"] = label;
    return currentoverlay;
}

function createcurrentZipcodeLabelsLayer(currentdata) {
    var aggregatedata = sum_totalmetric(currentdata,'Zipcode');
    var lacurrentzipcodeLabels_layergroup = createlabellayer(aggregatedata, get_LAZipcode_GeoJSON());

    lacurrentzipcodeLabels_layergroup["layerName"] = "currentzipcodelabels";
    return lacurrentzipcodeLabels_layergroup;
}

function createcomparisonZipcodeLabelsLayer(data) {
    var aggregatedata = sum_totalmetric(data,'Zipcode');
    var lacomparisonzipcodeLabels_layergroup = createlabellayer(aggregatedata, get_LAZipcode_GeoJSON());

    lacomparisonzipcodeLabels_layergroup["layerName"] = "comparisonzipcodelabels";
    return lacomparisonzipcodeLabels_layergroup;
}

function createAndAddLegend( type, id ) {
    //legend only available for poverty and education
    if( NullUndefinedCheck( type ) || NullUndefinedCheck(equityMetricValueColorMap[type])) {
        return;
    }
    type = type.toLowerCase();
    removeLegend();
        
    featurelegend = createLegend( getKeyValuesFromColorMap(equityMetricValueColorMap[type]), type, id);
    featurelegends.push( featurelegend );
    featurelegend.addTo(featuremap);
}

function removeAllLegends() {
    removeLegend();
    featurelegends = [];
}

function removeTopLegend() {
    removeLegend();
    featurelegends.pop();
    featurelegend = featurelegends[featurelegends.length-1];
}
function findAndRemoveLegend( name ) {
    var flindex = featurelegends.findIndex(function(flitem) {
        return (flitem["layerName"] === name);
    });
    if( flindex === featurelegends.length-1 ) removeTopLegend();
    else {
        removeLegend();
        featurelegends.splice(flindex, 1);
    }
}

function showTopLegend() {
    if( !NullUndefinedCheck(featurelegend) && (featurelegends.length > 0) ) {
        featurelegend = featurelegends[featurelegends.length-1];
        featurelegend.addTo(featuremap);
    }
    else if ( NullUndefinedCheck(featurelegend) )
    {
        removeLegend();
    }
}

function removeLegend() {
    if( !NullUndefinedCheck(featurelegend) ) {
        featurelegend.remove();
        featurelegend = null;
    }
}

function createLegend(data, metricname, layerid) {
    var temp_legend;
    temp_legend = L.control({
        // position legend to be bottom left of the map
        position: 'bottomleft'
    });

    temp_legend.onAdd = function(map) {
        var div = L.DomUtil.create('div', 'info legend');
        div.innerHTML += '<div><b>' + equityMetricLegendTextMap[layerid] + '</b></div>';
        // loop through our density intervals and generate a global with a colored square for each interval
        for (var i = data.length-1; i > -1; i--) {
            var currtotal = Math.round(equityMetricValueTotalsMap[layerid][data[i].toString()]);
            currtotal = ( currtotal < 0 ) ? 0 : currtotal;
            if( i === 0 ) {
                div.innerHTML += '<div id=legend><i style="background:' + getMetricColor(data[i], metricname) + '"></i>' + 0 + '&ndash;' + currtotal + '<br></div>';
            }
            else {
                var prevtotal = Math.round(equityMetricValueTotalsMap[layerid][data[i-1].toString()]);
                prevtotal = ( prevtotal < 0 ) ? 0 : prevtotal;
                div.innerHTML +=
                '<div id=legend><i style="background:' + getMetricColor(data[i], metricname) + '"></i>' + prevtotal + '&ndash;' + currtotal + '<br></div>';
            }
        }
        //div.innerHTML += '</div>';
        return div;
    }
    temp_legend["layerName"] = layerid;
    return temp_legend;
}

function getKeyValuesFromColorMap( colormap ) {
    var keyvalues = [];
    if( NullUndefinedCheck(colormap) )
        return keyvalues;
    colormap.forEach((item, index, array) => {
        keyvalues.push(Object.keys(item)[0]);
    });
    return keyvalues;
}

function createInfo(data, eqkpiname) {
    info_units = NullUndefinedCheck( data[0].unit ) ? "units" : data[0].unit;
    info_eqkpiname = eqkpiname;

    temp_info = L.control({
        position: 'topleft'
    });

    temp_info.onAdd = function (map) {
        this._div = L.DomUtil.create('div', 'info');
        this.update();
        return this._div;
    }
    temp_info.update = function (props) { 
        var temp_string = '';
        var equitymetricinformation = '<h4>' + info_eqkpiname + '</h4>';

        // hide or show information box
        if(mouse_status === 1){
            //console.log("Mouse moved on layer");
            this._div.style.visibility = 'visible';
            this._div.style.display = 'block';

            if(!NullUndefinedCheck(props)){
                infoText(props);
            }
            
            // handler for undefined metric
            if(!NullUndefinedCheck(aggregated_data[global_type][global_key])){
                temp_string = '</b><br />' + aggregated_data[global_type][global_key] + ' ' + info_units + '(s)';
            }
            
            if(currentoverlayer.indexOf('LA Neighborhood') > -1){
                var info_text_string = '';
                for(var i = 0; i < info_text_array.length; i++){
                    var unitstr = (info_text_array[i][0].indexOf('Neighborhood Region Count') > -1) ?
                        ' ' + info_units + '(s)' 
                        : '';
                    info_text_string += '<b>' + info_text_array[i][0] + ': </b>' + info_text_array[i][1] + unitstr + '<br/>' 
                }
                this._div.innerHTML = equitymetricinformation + info_text_string;
            }
            else{
                this._div.innerHTML = equitymetricinformation +'<b>' + global_type + ': ' + global_key + temp_string;
                
            }
        }
        else if(mouse_status === 0){
            //console.log("Mouse moved off layer");
            this._div.style.visibility = "hidden";
            this._div.style.display = "none";
        }

    };
    return temp_info;
}

function infoText(props){
    if(currentoverlayer === 'LA District'){
        global_type = 'District';
        layer_title = 'District';
        global_key = props.name;
        return;
    }
    else if(currentoverlayer === 'LA Zipcode'){
        global_type = 'Zipcode';
        layer_title = 'Zipcode';
        global_key = props.ZIPCODE;
        return;
    }
    else if(currentoverlayer.indexOf('LA Neighborhood') > -1){
        global_type = 'NH_District';
        layer_title = 'Neighborhood District';
        global_key = props.nh_district;
        info_text_array = [['Neighborhood Region Number', props.nh_district], 
                            ['Neighborhood Region Name', props.REGION_GROUPING], 
                            ['Neighborhood Region Count', aggregated_data[global_type][global_key]],
                            ['Neighborhood District Name', props.NAME]];
        return props.NAME;
    }
    // else if(currentoverlayer === 'LA Census Tract'){
    //     global_type = 'Census';
    //     global_key = props.ct10;
    //     return props.ct10;
    // }
}

var previousStyle = {};
// mouseover event: highlight borders encapsulating region
function highlightFeature(e) {
    var layer = e.target;
    // mouse pointer moved on layer
    mouse_status = 1;
    // save the previous style
    previousStyle.weight = layer.options.weight;
    previousStyle.color = layer.options.color;
    previousStyle.opactiy = layer.options.opacity;
    previousStyle.fillOpacity = layer.options.fillOpacity;
    previousStyle.fillColor = layer.options.fillColor;
    previousStyle.dashArray = layer.options.dashArray;
    layer.setStyle({
        weight: 3,
        color: '#f2f0f5',
        fillColor: '#f2f0f5',
        fillOpacity: 0.7
    });
    // Does not work on these browsers
    if (!L.Browser.ie && !L.Browser.opera && !L.Browser.edge) {
        layer.bringToFront();
    }
    temp_info.update(layer.feature.properties);
}

//mouseover event: reset the layer style to its previous style state
function resetHighlight(e) {
    var layer = e.target;
    // mouse pointer moved off layer
    mouse_status = 0;
    layer.setStyle(previousStyle);
    
    // Does not work on these browsers
    if (!L.Browser.ie && !L.Browser.opera && !L.Browser.edge) {
        layer.bringToFront();
    }
    temp_info.update(layer.feature.properties);
}

function onEachFeature(feature, layer) {
    layer.on({
        mouseover: highlightFeature,
        mouseout: resetHighlight,
    });
}
// Set current overlayer
function overlayaddfeature(name) {
    if( name.indexOf("LA") > -1 )
        currentoverlayer = name;
    else
        currentoverlayer = "LA " + name;
}

function setFeatureMap(mymap) {
    featuremap = mymap;
}

/**
 * @desc filter data for compare year
 * @param compareyr 
 */
function getComparedYearData(data, compareyr) {
    // create a heatmap if compare year exist and meets condition
    if (!NullUndefinedCheck(compareyr) && !NullUndefinedCheck(data)) {

        compareyr_data = filterDataByDateRange(data, compareyr + '01', compareyr + '12');
        compareyr_data = filterOutNullLatLongs(compareyr_data);
        // data does not exist for the provided compareyr
        if (NullUndefinedCheck(compareyr_data) || (compareyr_data.length <= 0)) {
            console.log("Error: No data available to compare the following year: " + compareyr.toString());
            return null;
        }
        else {
            return compareyr_data;
        }
    }
    return null;
}
