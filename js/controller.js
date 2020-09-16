var controllercurrentoverlayer = "";
var controllerbaseTree = null;
var controlleroverlayTree = null;
var controllermap = null;
var uilcontroller = null;
var heatLayerToDisableAndEnable = null;
var districtLayerToDisableAndEnable = null;
var neighborhoodLayerToDisableAndEnable = null;
var neighborhoodClearLayerToHideAndShow = null;
var controllerdefaultcenterzoom = null;
var highlightinfobox = null;
var clickThisArray = [];

function overlayaddcontroller(layer) {
    setControllerCurrentOverlayer(layer.layerName);
    overlayNameBusinessRulesMap[layer.layerName]();
    hideNodeHiddenUsedForControllerLogic();
}

function overlayaddcontrollername(layerName) {
    setControllerCurrentOverlayer(layerName);
    overlayNameBusinessRulesMap[layerName]();
    hideNodeHiddenUsedForControllerLogic();
    runClicksOnDOM(clickThisArray);
    clickThisArray = [];
}

//Census level layers are not allowed to be controllercurrentoverlayer, 
//only zipcode, district and neighborhood layers are allowed to be controllercurrentoverlayer
function setControllerCurrentOverlayer(name) {
    if(( name === "district" ) || ( name === "zipcode" ) || ( name === "neighborhood" ))
        controllercurrentoverlayer = name;
}

function setControllerObjs( baseTree, overlayTree, lcontrol, mymap, heatlayer, 
    districtLayer, neighborhoodLayer, neighborhoodClearLayer, latLngZoom, currentoverlayer,
    infobox ) {
    controllerbaseTree = baseTree;
    controlleroverlayTree = overlayTree;
    uilcontroller = lcontrol;
    controllermap = mymap;
    heatLayerToDisableAndEnable = heatlayer;
    districtLayerToDisableAndEnable = districtLayer;
    neighborhoodLayerToDisableAndEnable = neighborhoodLayer;
    neighborhoodClearLayerToHideAndShow = neighborhoodClearLayer;
    controllerdefaultcenterzoom = latLngZoom;
    controllercurrentoverlayer = currentoverlayer;
    highlightinfobox = infobox;
}

function overlayremovecontroller(layer) {
    overlayNameOffRulesMap[layer.layerName]();
}

function initializeDefaultMapController() {
    handleMapControllerClickWithInput(document.getElementById("default").parentNode.parentNode.querySelector("input"));
}

function handleMapControllerClickWithInput(input) {
    if( NullUndefinedCheck( input ) ) return;
    var parent = input.parentNode;
    var nameOfButtonClicked = parent.querySelector("span").innerText;
    var overlayClicked = findOverlayWithLabelController(controlleroverlayTree, nameOfButtonClicked);
    var overlayName = overlayClicked.layer.layerName;
    trackClickInControllerOverlayTree(nameOfButtonClicked);
    overlayaddcontrollername(overlayName);
}

function removeLayerWithLabel(treeobj, overlayname) {
    if( treeobj.label === overlayname ) {
        treeobj.layer = undefined;
    }
    else if( NullUndefinedCheck(treeobj.children) ) return null;
    else {
        var i;
        var result = null;
        for(i=0; result == null && i < treeobj.children.length; i++){
            result = removeLayerWithLabel(treeobj.children[i], overlayname);
        }
        return result;

    }
}

function addLayerToTreeOverlayWithLabel(layerobj, treeobj, overlayname ) {
    var parent = findOverlayWithLabelController(treeobj, overlayname);
    parent.layer = layerobj;
}

function findOverlayWithLabelController(treeobj, overlayname ) {
    if( treeobj.label.toLowerCase().indexOf( overlayname.toLowerCase() ) > -1 ) {
        return treeobj;
    }
    else if( treeobj.id === overlayname ) {
        return treeobj;
    }
    else if( NullUndefinedCheck(treeobj.children) ) return null;
    else {
        var i;
        var result = null;
        for(i=0; result == null && i < treeobj.children.length; i++){
            result = findOverlayWithLabelController(treeobj.children[i], overlayname);
        }
        return result;

    }
}

function findOverlayWithLayerNameController(treeobj, layerName ) {
    if( treeobj.layer.layerName === layerName ) {
        return treeobj;
    }
    else if( treeobj.id === layerName ) {
        return treeobj;
    }
    else if( NullUndefinedCheck(treeobj.children) ) return null;
    else {
        var i;
        var result = null;
        for(i=0; result == null && i < treeobj.children.length; i++){
            result = findOverlayWithLayerNameController(treeobj.children[i], layerName);
        }
        return result;

    }
}

function findParentOverlayWithLabelController(treeobj, childoverlayname, parentoverlay ) {
    if( treeobj.label.toLowerCase().indexOf( childoverlayname.toLowerCase() ) > -1 ) {
        return parentoverlay;
    }
    else if( treeobj.id === childoverlayname ) {
        return parentoverlay;
    }
    else if( NullUndefinedCheck(treeobj.children) ) return null;
    else {
        var i;
        var result = null;
        for(i=0; result == null && i < treeobj.children.length; i++){
            result = findParentOverlayWithLabelController(treeobj.children[i], childoverlayname, treeobj);
        }
        return result;

    }
}

//Queue up clicks on an array, then run the clicks on the HTML DOM when ready.
function runClicksOnDOM( clicknodenames ) {
    setTimeout( function() {
        clicknodenames.forEach( (nodename) => {
            var input = getControllerNodeWithText(nodename);
            if( !NullUndefinedCheck( input ) ) {
                input.click();
                trackClickInControllerOverlayTree(nodename);
            }
        });
    }, 125);
    
}

function trackClickInControllerOverlayTree(labelname) {
    //get parent
    var parentOverlay = findParentOverlayWithLabelController( controlleroverlayTree, labelname, null );
    if( NullUndefinedCheck( parentOverlay ) || NullUndefinedCheck( parentOverlay.children ) ) return;
    //uncheck siblings
    parentOverlay.children.forEach(function(childoverlay) {
        //check overlay
        if( childoverlay.label === labelname )
            childoverlay.checked = true;
        else
            childoverlay.checked = false;
    } );
}

// function isRadioButtonInOverlayChecked( labelname ) {
// Not used for now to be implemented in future
// }

function getControllerNodeWithText( innerHTMLToFind ) {
    innerHTMLToFind = innerHTMLToFind.toLowerCase();
    var controllerBoxes = document.querySelectorAll("label.leaflet-layerstree-header-label");
    for( box of controllerBoxes ) {
        if(box.querySelectorAll("span")[0].innerHTML.toLowerCase().indexOf(innerHTMLToFind) > -1 )
            return box;
    }
    return null;
}

function hideNodeHiddenUsedForControllerLogic() {
    var hideElement = getControllerNodeWithText( "HiddenUsedForControllerLogic" );
    if( !NullUndefinedCheck(hideElement) )
        hideElement.style = "display:none; visibility:hidden;";

    var hideCensusElement = getControllerNodeWithText( "HiddenCensusForControllerLogic" );
    if( !NullUndefinedCheck(hideCensusElement) ){
        hideCensusElement.style = "display:none; visibility:hidden;";
    }

    var hideResetDefaultElement = getControllerNodeWithText( "HiddenResetForControllerLogic" );
    if( !NullUndefinedCheck(hideResetDefaultElement) ){
        hideResetDefaultElement.style = "display:none; visibility:hidden;";
    }
}

function callClickOnCurrentOverlayer() {
    clickThisArray.push("HiddenUsedForControllerLogic");
    // click active (zipcode, district or neighborhood) layer, must be last / bottom for infobox highlight to work
    clickThisArray.push(controllercurrentoverlayer);
}

function uncheckAllZipcodeTypeOverlays() {
    var zipcodetypeOverlay = findOverlayWithLabelController(controlleroverlayTree, "Zipcode Type");
    if( NullUndefinedCheck(zipcodetypeOverlay) || NullUndefinedCheck(zipcodetypeOverlay.children) 
    || (zipcodetypeOverlay.children.length === 0) ) return;
    
    zipcodetypeOverlay.children.forEach((item, index, array) => {
        var childNode = getControllerNodeWithText(item.label);
        if(!NullUndefinedCheck(childNode))  {
            if( childNode.querySelector("input").checked ) {
                clickThisArray.push(item.label);
            }
        }
    });
}

var businessRulesForTerrain = function() {

};
var businessRulesForStreet = function() {

};
var businessRulesForToner = function() {

};
var businessRulesForDistrict = function() {
};

var businessRulesForZipcode = function() {
};

var businessRulesForNeighborhood = function() {
    var zipcodeLabelsNode = getControllerNodeWithText("Totals for Zipcode");
    if( zipcodeLabelsNode.querySelector("input").checked ) {
        clickThisArray.push("Cluster");
        businessRulesForCluster();
    }
    var povertyNode = getControllerNodeWithText("LA Poverty");
    var educationNode = getControllerNodeWithText("LA Education");
    var heatNode = getControllerNodeWithText("heat");
    if( povertyNode.querySelector("input").checked || educationNode.querySelector("input").checked ||
        ( !NullUndefinedCheck(heatNode) && ( heatNode.querySelector("input").checked ))) { 
        if( !NullUndefinedCheck(neighborhoodClearLayerToHideAndShow) ) {
            // in some cases we need to clock the DOM directly and immediately in order for the layers to hide correctly
            var hiddenNode = getControllerNodeWithText("HiddenUsedForControllerLogic");
            hiddenNode.querySelector("input").click();

            removeLayerWithLabel(controlleroverlayTree, "LA Neighborhood");
            addLayerToTreeOverlayWithLabel(neighborhoodClearLayerToHideAndShow, controlleroverlayTree, "LA Neighborhood");

            //refresh controller, must be called after "Hide heat radio button" to work
            controllermap.removeControl(uilcontroller);
            uilcontroller = L.control.layers.tree(controllerbaseTree, controlleroverlayTree).addTo(controllermap);

            clickThisArray.push("HiddenUsedForControllerLogic");
            clickThisArray.push("LA Neighborhood");
        }
    }
    var clusterNode = getControllerNodeWithText("Cluster");
    if( clusterNode.querySelector("input").checked && 
        ( !povertyNode.querySelector("input").checked && !educationNode.querySelector("input").checked ) ) {
            var hiddenNode = getControllerNodeWithText("HiddenUsedForControllerLogic");
            hiddenNode.querySelector("input").click();

            removeLayerWithLabel(controlleroverlayTree, "LA Neighborhood");
            addLayerToTreeOverlayWithLabel(neighborhoodLayerToDisableAndEnable, controlleroverlayTree, "LA Neighborhood");

            //refresh controller, must be called after "Hide heat radio button" to work
            controllermap.removeControl(uilcontroller);
            uilcontroller = L.control.layers.tree(controllerbaseTree, controlleroverlayTree).addTo(controllermap);

            
            clickThisArray.push("HiddenUsedForControllerLogic");
            clickThisArray.push("LA Neighborhood");
    }
};

var businessRulesForCensus = function() {
    var heatNode = getControllerNodeWithText("heat");
    heatNode.style.display = "none";
    if ( heatNode.querySelector("input").checked ) {
        clickThisArray.push("heat");
        businessRulesForHeat();
    }
};

var businessRulesForHeat = function() {

    if( controllercurrentoverlayer.indexOf("neighborhood") > -1 )
    {
        if( !NullUndefinedCheck(neighborhoodClearLayerToHideAndShow) ) {

            var hiddenNode = getControllerNodeWithText("HiddenUsedForControllerLogic");
            hiddenNode.querySelector("input").click();

            removeLayerWithLabel(controlleroverlayTree, "LA Neighborhood");
            addLayerToTreeOverlayWithLabel(neighborhoodClearLayerToHideAndShow, controlleroverlayTree, "LA Neighborhood");

            //refresh controller, must be called after "Hide heat radio button" to work
            controllermap.removeControl(uilcontroller);
            uilcontroller = L.control.layers.tree(controllerbaseTree, controlleroverlayTree).addTo(controllermap);

            
            clickThisArray.push("HiddenUsedForControllerLogic");
            clickThisArray.push("LA Neighborhood");
        }


    }
    else {
        // click active (zipcode, district or neighrborhood) layer, must be clicked last / bottom for infobox highlight to work
        callClickOnCurrentOverlayer();
    }
    removeLegend();
};

var businessRulesForCluster = function() {
    var povertyNode = getControllerNodeWithText("LA Poverty");
    var educationNode = getControllerNodeWithText("LA Education");
    if( controllercurrentoverlayer.indexOf("neighborhood") > -1 )
    {
        var hiddenNode = getControllerNodeWithText("HiddenUsedForControllerLogic");
        hiddenNode.querySelector("input").click();

        removeLayerWithLabel(controlleroverlayTree, "LA Neighborhood");

        if( !povertyNode.querySelector("input").checked && !educationNode.querySelector("input").checked ) {

            addLayerToTreeOverlayWithLabel(neighborhoodLayerToDisableAndEnable, controlleroverlayTree, "LA Neighborhood");
        }
        else {
            addLayerToTreeOverlayWithLabel(neighborhoodClearLayerToHideAndShow, controlleroverlayTree, "LA Neighborhood");
        }

        //refresh controller, must be called after "Hide heat radio button" to work
        controllermap.removeControl(uilcontroller);
        uilcontroller = L.control.layers.tree(controllerbaseTree, controlleroverlayTree).addTo(controllermap);

        clickThisArray.push("HiddenUsedForControllerLogic");
        clickThisArray.push("LA Neighborhood");
    }
    else {
        // click active (zipcode, district or neighrborhood) layer, must be clicked last / bottom for infobox highlight to work
        callClickOnCurrentOverlayer();
    }
};

var businessRulesForComparison = function() {
    clickThisArray.push("HiddenUsedForControllerLogic");
    clickThisArray.push("LA Zipcode");
    businessRulesForZipcode();

    createAndAddLegend( "comparisonred", "comparison" );
};

var businessRulesForComparisonHeat = function() {
    // click active (zipcode, district or neighrborhood) layer, must be clicked last / bottom for infobox highlight to work
    callClickOnCurrentOverlayer();
    removeLegend();
};

var businessRulesForComparisonAlt = function() {
    clickThisArray.push("HiddenUsedForControllerLogic");
    clickThisArray.push("LA Zipcode");
    businessRulesForZipcode();

    createAndAddLegend( "comparisonblue", "comparisonalt" );
};

var businessRulesForCurrentZipCode = function() {
    clickThisArray.push("HiddenUsedForControllerLogic");
    clickThisArray.push("LA Zipcode");
    businessRulesForZipcode();

    createAndAddLegend( "comparisonblue", "currentzipcode" );
};

var businessRulesForNoHeatClusterComparison = function() {
    // click active (zipcode, district or neighrborhood) layer, must be clicked last / bottom for infobox highlight to work
    callClickOnCurrentOverlayer();
};

var businessRulesForCurrentZipcodeLabels = function() {
    clickThisArray.push("LA Zipcode");
    highlightinfobox.update({ ZIPCODE : "Hover over a Zipcode to see Equity Metric Information" });
};

var businessRulesForComparisonZipcodeLabels = function() {
    clickThisArray.push("HiddenUsedForControllerLogic");
    clickThisArray.push("LA Zipcode");
    businessRulesForZipcode();
};

var businessRulesForPoverty = function() {

    clickThisArray.push("cluster");
    businessRulesForCluster();

    if( controllercurrentoverlayer.indexOf("neighborhood") < 0 )
    {
        // click active (zipcode, district or neighborhood) layer, must be clicked last / bottom for infobox highlight to work
        callClickOnCurrentOverlayer();

        //hide heat radio button
        if(NullUndefinedCheck(heatLayerToDisableAndEnable) ) {
            heatLayerToDisableAndEnable = findOverlayWithLabelController(controlleroverlayTree, "Heat").layer;
        }
        
        removeLayerWithLabel(controlleroverlayTree, "Heat");

        //refresh controller, must be called after "Hide heat radio button" to work
        controllermap.removeControl(uilcontroller);
        uilcontroller = L.control.layers.tree(controllerbaseTree, controlleroverlayTree).addTo(controllermap);
    }
    else {
        if( !NullUndefinedCheck(neighborhoodClearLayerToHideAndShow) ) {
            clickThisArray.push("HiddenUsedForControllerLogic");

            removeLayerWithLabel(controlleroverlayTree, "LA Neighborhood");
            addLayerToTreeOverlayWithLabel(neighborhoodClearLayerToHideAndShow, controlleroverlayTree, "LA Neighborhood");

            removeLayerWithLabel(controlleroverlayTree, "Heat");

            //refresh controller, must be called after "Hide heat radio button" to work
            controllermap.removeControl(uilcontroller);
            uilcontroller = L.control.layers.tree(controllerbaseTree, controlleroverlayTree).addTo(controllermap);

            clickThisArray.push("LA Neighborhood");
            businessRulesForNeighborhood();
        }

    }
    
    removeTopLegend();
    createAndAddLegend( "poverty", "poverty" );
};

var businessRulesForEducation = function() {
    clickThisArray.push("cluster");
    businessRulesForCluster();

    if( controllercurrentoverlayer.indexOf("neighborhood") < 0 )
    {
        // click active (zipcode, district or neighrborhood) layer, must be clicked last / bottom for infobox highlight to work
        callClickOnCurrentOverlayer();

        //hide heat radio button
        if(NullUndefinedCheck(heatLayerToDisableAndEnable) ) {
            heatLayerToDisableAndEnable = findOverlayWithLabelController(controlleroverlayTree, "Heat").layer;
        }
        removeLayerWithLabel(controlleroverlayTree, "Heat");

        //refresh controller, must be called after "Hide heat radio button" to work
        controllermap.removeControl(uilcontroller);
        uilcontroller = L.control.layers.tree(controllerbaseTree, controlleroverlayTree).addTo(controllermap);
    }
    else {
        if( !NullUndefinedCheck(neighborhoodClearLayerToHideAndShow) ) {
            clickThisArray.push("HiddenUsedForControllerLogic");

            removeLayerWithLabel(controlleroverlayTree, "LA Neighborhood");
            addLayerToTreeOverlayWithLabel(neighborhoodClearLayerToHideAndShow, controlleroverlayTree, "LA Neighborhood");

            //refresh controller, must be called after "Hide heat radio button" to work
            controllermap.removeControl(uilcontroller);
            uilcontroller = L.control.layers.tree(controllerbaseTree, controlleroverlayTree).addTo(controllermap);

            clickThisArray.push("LA Neighborhood");
            businessRulesForNeighborhood();
        }

    }

    removeTopLegend();
    createAndAddLegend( "education", "education" );
};

var businessRulesForEmpty = function() {
    
};

var businessRulesForDefault = function() {
    removeAllLegends();

    var hiddenResetNode = getControllerNodeWithText("HiddenResetForControllerLogic");
    var censusHiddenNode = getControllerNodeWithText("HiddenCensusForControllerLogic");
    var hiddenNode = getControllerNodeWithText("HiddenUsedForControllerLogic");

    // click HiddenResetForControllerLogic
    hiddenResetNode.querySelector("input").click();

    // click hidden radio in Heat Type (Census)
    censusHiddenNode.querySelector("input").click();

    // click hidden node in Boundary Type
    hiddenNode.querySelector("input").click();

    // click cluster marker
    clickThisArray.push("Cluster");

    // Show heat radio button
    var heatOverlay = findOverlayWithLabelController(controlleroverlayTree, "Heat");
    heatOverlay.layer = heatLayerToDisableAndEnable;

    // Show district radio button
    var districtOverlay = findOverlayWithLabelController(controlleroverlayTree, "LA District");
    districtOverlay.layer = districtLayerToDisableAndEnable;

    // Show neighborhood radio button
    removeLayerWithLabel(controlleroverlayTree, "LA Neighborhood");
    addLayerToTreeOverlayWithLabel(neighborhoodLayerToDisableAndEnable, controlleroverlayTree, "LA Neighborhood");

    // var neighborhoodOverlay = findOverlayWithLabelController(controlleroverlayTree, "LA Neighborhood");
    // neighborhoodOverlay.layer = neighborhoodLayerToDisableAndEnable;

    uncheckAllZipcodeTypeOverlays();

    //refresh controller, must be called after "Show heat radio button" to work
    controllermap.removeControl(uilcontroller);
    uilcontroller = L.control.layers.tree(controllerbaseTree, controlleroverlayTree).addTo(controllermap);

    controllermap.setView(controllerdefaultcenterzoom.latlng, controllerdefaultcenterzoom.zoom);

    // click district layer, must be last for infobox highlight to work
    clickThisArray.push("HiddenUsedForControllerLogic");
    clickThisArray.push("LA District");
    setControllerCurrentOverlayer("district");

    highlightinfobox.update(null);
}

var businessRulesOffCurrentZipCode = function() {
    findAndRemoveLegend("currentzipcode");
    showTopLegend();
}

var businessRulesOffComparison = function() {
    findAndRemoveLegend("comparison");
    showTopLegend();
}

var businessRulesOffComparisonAlt = function() {
    findAndRemoveLegend("comparisonalt");
    showTopLegend();
}

//global class 
var overlayNameBusinessRulesMap = {
    "terrain" : businessRulesForTerrain,
    "street" : businessRulesForStreet,
    "toner" : businessRulesForToner,
    "district" : businessRulesForDistrict,
    "zipcode" : businessRulesForZipcode,
    "census" : businessRulesForCensus,
    "heat" : businessRulesForHeat,
    "cluster" : businessRulesForCluster,
    "poverty" : businessRulesForPoverty,
    "education" : businessRulesForEducation,
    "neighborhood" : businessRulesForNeighborhood,
    "neighborhoodclear" : businessRulesForNeighborhood,
    "currentzipcode" : businessRulesForCurrentZipCode,
    "currentzipcodelabels" : businessRulesForCurrentZipcodeLabels,
    "comparisonzipcodelabels" : businessRulesForComparisonZipcodeLabels,
    "comparison" : businessRulesForComparison,
    "comparisonalt" : businessRulesForComparisonAlt,
    "comparisonheat" : businessRulesForComparisonHeat,
    "empty" : businessRulesForEmpty,
    "default" : businessRulesForDefault,
    "emptycensus" : businessRulesForEmpty,
    "emptydefault" : businessRulesForEmpty,
    "emptycomparison" : businessRulesForNoHeatClusterComparison
};

var overlayNameOffRulesMap = {
    "terrain" : businessRulesForEmpty,
    "street" : businessRulesForEmpty,
    "toner" : businessRulesForEmpty,
    "district" : businessRulesForEmpty,
    "zipcode" : businessRulesForEmpty,
    "census" : businessRulesForEmpty,
    "heat" : businessRulesForEmpty,
    "cluster" : businessRulesForEmpty,
    "poverty" : businessRulesForEmpty,
    "education" : businessRulesForEmpty,
    "neighborhood" : businessRulesForEmpty,
    "neighborhoodclear" : businessRulesForEmpty,
    "currentzipcode" : businessRulesOffCurrentZipCode,
    "currentzipcodelabels" : businessRulesForEmpty,
    "comparisonzipcodelabels" : businessRulesForEmpty,
    "comparison" : businessRulesOffComparison,
    "comparisonalt" : businessRulesOffComparisonAlt,
    "comparisonheat" : businessRulesForEmpty,
    "empty" : businessRulesForEmpty,
    "default" : businessRulesForEmpty,
    "emptycensus" : businessRulesForEmpty,
    "emptydefault" : businessRulesForEmpty,
    "emptycomparison" : businessRulesForEmpty
};
