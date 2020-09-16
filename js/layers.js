//Poverty data, Controller related

function getAllBaseMaps(){
    var baseMaps = {};

    var Stamen_Terrain = L.tileLayer('https://stamen-tiles-{s}.a.ssl.fastly.net/terrain/{z}/{x}/{y}{r}.{ext}', {
	    attribution: '<b><font color="red">Disclaimer</font>: <b> Addresses with missing geocode are not counted.',
	    subdomains: 'abcd',
	    minZoom: 0,
	    maxZoom: 18,
	    ext: 'png'
    });

    baseMaps["Terrain"] = Stamen_Terrain;

    var Stamen_Toner = L.tileLayer('https://stamen-tiles-{s}.a.ssl.fastly.net/toner/{z}/{x}/{y}{r}.{ext}', {
	    attribution: '<b><font color="red">Disclaimer</font>: <b> Addresses with missing geocode are not counted.',
	    subdomains: 'abcd',
	    minZoom: 0,
	    maxZoom: 20,
	    ext: 'png'
        });

    baseMaps["Toner"] = Stamen_Toner;

    var OSM_Mapnik = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '<b><font color="red">Disclaimer</font>: <b> Addresses with missing geocode are not counted.'
    });
    OSM_Mapnik["layerName"] = "street";
    baseMaps["Street"] = OSM_Mapnik;

    return baseMaps;
}

function getDistrictLayer(){

    var ladistrict_geocode = get_LADistrict_GeoJSON();
    
    // build LA District Overlay
    var ladistrict = L.geoJson(ladistrict_geocode, {
        // call style function in feature.js
        style: style,
        onEachFeature: onEachFeature
    });
    ladistrict["layerName"] = "district";
    return ladistrict;
}

function getZipcodeLayer(){

    var lazipcode_geocode = get_LAZipcode_GeoJSON();

    // build LA Zipcode Layer
    var lazipcode = L.geoJson(lazipcode_geocode, {
        style: style,
        onEachFeature: onEachFeature
    });
    lazipcode["layerName"] = "zipcode";
    return lazipcode;
}

function getCensusLayer(){
    // LA Poverty Layer
    var lapoverity_geocode = get_LAPOV_GeoJSON();
    var lapoverity = L.geoJson(lapoverity_geocode, {
        style: style,
        onEachFeature: onEachFeature
    });
    lapoverity["layerName"] = "census";
    return lapoverity;
}

function getCensusEducationLayer(){
    var laeducation_geocode = get_LACensus_Education_GeoJSON();
    var laeducation = L.geoJson(laeducation_geocode, {
        style: styleEducation
    });
    laeducation["layerName"] = "education";
    return laeducation;
}

function getPovertyLayer(){
    // LA Poverty Layer
    var lapoverity_geocode = get_LAPOV_GeoJSON();
    var lapoverity = L.geoJson(lapoverity_geocode, {
        style: stylePoverty
    });
    lapoverity["layerName"] = "poverty";
    return lapoverity;
}

function getEmptyLayer() {
    var empty_geocode = get_EMPTY_GeoJSON();
    var emptylayer = L.geoJson(empty_geocode, {});
    emptylayer["layerName"] = "empty";
    return emptylayer;
}

function getNeighborhoodLayer(){
    var neighborhood_geocode = get_Neighborhood_District_GeoJSON();
    var neighborhoodlayer = L.geoJson(neighborhood_geocode, {
        style: styleNeighborhood,
        onEachFeature: onEachFeature
    });
    neighborhoodlayer["layerName"] = "neighborhood";
    return neighborhoodlayer;
}

function getNeighborhoodClearLayer(){
    var neighborhood_geocode = get_Neighborhood_District_GeoJSON();
    var neighborhoodclearlayer = L.geoJson(neighborhood_geocode, {
        style: styleNeighborhoodClear,
        onEachFeature: onEachFeature
    });
    neighborhoodclearlayer["layerName"] = "neighborhoodclear";
    return neighborhoodclearlayer;
}

function getOverlayWithName(name) {
    var overlayMaps = getAllOverlays();
    return overlayMaps[name];
}

function getCensusEmptyLayer() {
    var censusempty_geocode = get_EMPTY_GeoJSON();
    var censusempty = L.geoJson(censusempty_geocode, {});
    censusempty["layerName"] = "emptycensus";
    return censusempty;
}

function getDefaultEmptyLayer(){
    var defaultempty_geocode = get_EMPTY_GeoJSON();
    var defaultempty = L.geoJson(defaultempty_geocode, {});
    defaultempty["layerName"] = "default";
    return defaultempty;
}

function getHiddenDefaultEmptyLayer() {
    var empty_geocode = get_EMPTY_GeoJSON();
    var emptylayer = L.geoJson(empty_geocode, {});
    emptylayer["layerName"] = "emptydefault";
    return emptylayer;
}

function getComparisonEmptyLayer() {
    var empty_geocode = get_EMPTY_GeoJSON();
    var emptylayer = L.geoJson(empty_geocode, {});
    emptylayer["layerName"] = "emptycomparison";
    return emptylayer;
}

function getAllOverlays(){
    var overlayMaps={};
    
    overlayMaps["LA District"] = getDistrictLayer();;

    overlayMaps["LA Zipcode"] = getZipcodeLayer();

    overlayMaps["LA Census Tract"] = getCensusLayer();

    overlayMaps["LA Poverty"] = getPovertyLayer();

    overlayMaps["LA Education"] = getCensusEducationLayer();

    overlayMaps["LA Neighborhood"] = getNeighborhoodLayer();

    overlayMaps["LA Neighborhood Clear"] = getNeighborhoodClearLayer();

    // overlayMaps["LA Year Comparison"] = getYearComparisonLayer();

    overlayMaps["LA Empty"] = getEmptyLayer();

    overlayMaps["LA Empty Census"] =  getCensusEmptyLayer();

    overlayMaps["LA Empty Default"] = getDefaultEmptyLayer();

    overlayMaps["LA Empty Default Hidden"] = getHiddenDefaultEmptyLayer();

    overlayMaps["LA Empty Comparison"] = getComparisonEmptyLayer();

    return overlayMaps;
}

/**
 * @desc generic look for all geojson themes
*/
function style(feature) {
    return {
        // thickness of border
        weight: '2',
        // color of overlay
        color: '#2F1B76',
        // fill inside multipolygon
        fillOpacity: 0.01
    };
}
