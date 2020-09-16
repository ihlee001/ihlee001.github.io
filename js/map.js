//Uncomment the following to run the map application from 
//your local machine
//when below is commented that means initMap(...) is called from 
//the dashboard
if( window.location.hostname !== "wd16vmorcbi" ) {
//      run normal map mode
     initMap("./", 18, "SAIDI", "201811", "202004");
//      run comparison mode
    //  initMap("./", 10, "EV Chargers", "201401", "201912", "0001");
}


var applicationroot = "";
function initMap(rootpath, eqkpiid, eqkpiname, usermonthfrom, usermonthto, compareyear) {
    
    applicationroot = NullUndefinedCheck(rootpath) ? "./" : rootpath;
    //download the data from the js folder
    var element = document.createElement("script");
    element.src = applicationroot + "js/EQ_DATA_" + eqkpiid + ".js";
    element.addEventListener("load", function() {
        //create the map after js file is downloaded
        createMap(eqkpiid, eqkpiname, usermonthfrom, usermonthto, compareyear);
    });
    document.body.appendChild(element);

}

function createMap(eqkpiid, eqkpiname, usermonthfrom, usermonthto, compareyear) {

    // Get basemaps from data.js
    var baseMaps = {};
    baseMaps = getAllBaseMaps();

    // Get overlays from data.js
    var overlayMaps = {};
    overlayMaps = getAllOverlays();

    // center map to downtown los angeles 
    var dtla = new L.latLng({ lat: 34.0044785, lon: -118.4597917 });
    var dtlazoom = { latlng : dtla, zoom : 10 };

    // Create a map object called mymap
    var mymap = new L.Map('mapid',
        {
            //Setup mymap's attributes
            center: dtla,
            zoom: 10,
            zoomControl: false,
            layers: [baseMaps['Terrain'], overlayMaps['LA District']]
        });
    
    mymap.addControl(L.control.zoom({position:'bottomright'}));

    var data = filterDataByDateRange(equitykpimetricsdata, usermonthfrom, usermonthto);
    data = filterOutNullLatLongs(data);

    if (NullUndefinedCheck(data))
        return null;

    aggregateAllTypes(data);
    overlayaddfeature("LA District");
    setFeatureMap(mymap);

    // create Marker Clusters
    var markers = createMarkerCluster(data);
 
    // create Current Zipcode Labels
    var currentzipcodelabels_layer = createcurrentZipcodeLabelsLayer(data);

    // create Heat Layer
    var heat_layer = createHeatLayer(data);

    // Used for the controller button
    var baseTree = {
        label: "Map Type",
        children: [
            { label: 'Terrain', layer: baseMaps['Terrain'], radioGroup: 'map' },
            { label: 'Street', layer: baseMaps['Street'], radioGroup: 'map' },
            { label: 'Toner', layer: baseMaps['Toner'], radioGroup: 'map' }
        ]
    };

    // Used for controller button
    var overlayTree = {
        label: "Overlay",
        children: [
            {
                label: "Boundary Type",
                children: [
                    { label: 'LA District', layer: overlayMaps['LA District'], radioGroup: 'boundary'  },
                    { label: 'LA Zipcode', layer: overlayMaps['LA Zipcode'], radioGroup: 'boundary'},
                    { label: 'LA Neighborhood', layer: overlayMaps['LA Neighborhood'], radioGroup: 'boundary'},
                    { label: 'HiddenUsedForControllerLogic', layer: overlayMaps['LA Empty'], radioGroup: 'boundary' }
                ]
            },
            {
                label: "Census Type",
                children: [
                    { label: 'LA Poverty', layer: overlayMaps['LA Poverty'], radioGroup: 'census' },
                    { label: 'LA Education', layer: overlayMaps['LA Education'], radioGroup: 'census' },
                    { label: 'HiddenCensusForControllerLogic', layer: overlayMaps['LA Empty Census'], radioGroup: 'census' }
                ]
            },
            {
                label: ( NullUndefinedCheck(parseInt(compareyear)) ) ? 'Data Type' : 'Comparison Type',
                children: [
                    { label: 'Cluster', layer: markers, radioGroup: 'data type' },
                    { label: 'Heat', layer: heat_layer, radioGroup: 'data type', id: 'Heat' }
                ]
            },
            {
                label: 'Reset Map',
                children:[
                    {label: "<span id='default'>Default</span>", layer: overlayMaps['LA Empty Default'], radioGroup: 'reset'},
                    {label: 'HiddenResetForControllerLogic', layer: overlayMaps["LA Empty Default Hidden"], radioGroup: 'reset' }
                ]
            }
        ],
    };

    // create comparison layers
    if( !NullUndefinedCheck(compareyear) && !NullUndefinedCheck(parseInt(compareyear)) ) {
        var currentzipcode_layer = undefined;
        var comparisonzipcode_layer = undefined;
        var comparisonzipcodealt_layer = undefined;
        var comparisonzipcodelabels_layer = undefined;
        var comparisonheat_layer = undefined;
        var comparisonYearData = getComparedYearData(equitykpimetricsdata, compareyear, usermonthto.slice(0,4) );

        if ( !NullUndefinedCheck(comparisonYearData) ) {
            comparisonzipcode_layer = createComparisonLayer(comparisonYearData, "Red " + compareyear.toString() + "01-" + compareyear.toString() + "12");
            comparisonheat_layer = createComparisonHeatLayer(comparisonYearData);
            comparisonzipcodealt_layer = createComparisonAltLayer(comparisonYearData, "Blue " + compareyear.toString() + "01-" + compareyear.toString() + "12");
            currentzipcode_layer = createCurrentZipcodeLayer(data, "Blue " + usermonthfrom + "-" + usermonthto);
            comparisonzipcodelabels_layer = createcomparisonZipcodeLabelsLayer(comparisonYearData);
            
            var comptypeoverlay = findOverlayWithLabel(overlayTree, "Comparison Type");
            comptypeoverlay.children.push( { label: "Heat " + compareyear.toString() + "01-" + compareyear.toString() + "12", layer: comparisonheat_layer, radioGroup: 'data type' } );
            comptypeoverlay.children.push( { label: 'No Heat / Cluster', layer: overlayMaps['LA Empty Comparison'], radioGroup: 'data type' } );
            var heatoverlay = findOverlayWithLabel(overlayTree, "Heat");
            heatoverlay.label = "Heat " + usermonthfrom + "-" + usermonthto;

            var zipcodetypeoverlay = { label: "Zipcode Type", children : [] };
            zipcodetypeoverlay.children.push( { label: "Red " + compareyear.toString() + "01-" + compareyear.toString() + "12", layer: comparisonzipcode_layer } );
            zipcodetypeoverlay.children.push( { label: "Blue " + usermonthfrom + "-" + usermonthto, layer: currentzipcode_layer } );
            zipcodetypeoverlay.children.push( { label: "Blue " + compareyear.toString() + "01-" + compareyear.toString() + "12", layer: comparisonzipcodealt_layer } );
            zipcodetypeoverlay.children.push( { label: "Labels " + usermonthfrom + "-" + usermonthto, layer: currentzipcodelabels_layer, radioGroup: 'data type' } );
            zipcodetypeoverlay.children.push( { label: "Labels " + compareyear.toString() + "01-" + compareyear.toString() + "12", layer: comparisonzipcodelabels_layer, radioGroup: 'data type' } );
            comptypeoverlay.children.push( zipcodetypeoverlay );
            
        }
        
    }
    else {
        var datatypeoverlay = findOverlayWithLabel(overlayTree, "Data Type");
        datatypeoverlay.children.push( { label: "Totals for Zipcode", layer: currentzipcodelabels_layer, radioGroup: 'data type' } );
    }

    // put trees into a controller and add to mymap
    var uilcontroller = L.control.layers.tree(baseTree, overlayTree).addTo(mymap);
    // create info block
    var info = createInfo(data, eqkpiname);
    info.addTo(mymap);

    setControllerObjs( baseTree, overlayTree, uilcontroller, mymap, heat_layer, overlayMaps['LA District'],
        overlayMaps['LA Neighborhood'], overlayMaps['LA Neighborhood Clear'], dtlazoom, "district", info);
    initializeDefaultMapController();

    // When LA Zipcode is selected turn on Legend
    mymap.on('overlayadd', function (eventLayer) {
        overlayaddfeature(titleCase(eventLayer.layer.layerName));
    });

    mymap.on('overlayremove', function (eventLayer) {
        overlayremovecontroller(eventLayer.layer);
    });

    window.addEventListener("click", function(event) {
        if( event.x > 0 ) {
            var input = event.target;
            if( event.target.outerHTML.indexOf( '<span class="leaflet-layerstree-header-name">' ) > -1 ) {
                input = event.target.parentNode.querySelector("input");
                input.click();
            }
            handleMapControllerClickWithInput(input);
        }
    });
}

window.addEventListener('error', function(e) {
    if( NullUndefinedCheck( e.target.src ) )
        return;
    
    if( e.target.src.indexOf("EquityKPIMetrics-") > -1 ) {
        var div = document.createElement("div");
        div.innerHTML = "Data not available for this Equity Metric or date period!"
        document.getElementById("mapid").appendChild(div);
    }
}, true);

function findOverlayWithLabel(treeobj, overlayname ) {
    if( treeobj.label === overlayname ) {
        return treeobj;
    }
    else if( NullUndefinedCheck(treeobj.children) ) return null;
    else {
        var i;
        var result = null;
        for(i=0; result == null && i < treeobj.children.length; i++){
            result = findOverlayWithLabel(treeobj.children[i], overlayname);
        }
        return result;

    }
}
