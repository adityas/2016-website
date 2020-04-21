var createIntervalArray = new Array();
var creatingIntervalCount = new Array();
var creatingIntervalProductId = new Array();

function createProductTxtFiles(productId,idNumber,url,type){
	var xhr = createCORSRequest('GET', url);
	  if (!xhr) {
		alert('CORS not supported');
		return;
	}
	xhr.onreadystatechange=function()
	{
		if (xhr.readyState==4 && xhr.status==200)
		{
			sourceUrl = document.referrer;
			var n = sourceUrl.indexOf("share");
			
			if(n == -1){
				myFancy("We are currently generating your custom product. It usually takes a few minutes to make your file so you can either wait here until the product is done or check your email in a few minutes.");
			}else{
				myFancy("We are currently generating your custom product. It usually takes a few minutes to make your file so wait here until the product is done.");
			}
		}
	}
	xhr.onerror = function(e) {
		//alert('Woops, there was an error making the request.' + e.target.status);
	  };
	xhr.send();
	styleGenerateButton(idNumber);
	// console.log("about to start creating produt timer with idNumber: "+idNumber +" and product " + productId + "  and type " + type + " and url "  + url);
	createInterval(genericAjaxCallback,idNumber,productId,type,url,10000);
}
function thirdPartyEmail(url){
	var xhr = createCORSRequest('GET', url);
	  if (!xhr) {
		alert('CORS not supported');
		return;
	}
	
	xhr.onreadystatechange=function()
	{
		if (xhr.readyState==4 && xhr.status==200)
		{
			myFancy("An email with the link to the file has been sent to the pertinent address")
		}
	}
	xhr.onerror = function(e) {
		//alert('Woops, there was an error making the request.' + e.target.status);
	  };
	xhr.send();
}

function createInterval(f,dynamicParameter,productId,type,url,interval) 
{ 
	creatingIntervalCount[dynamicParameter] = 0;
	creatingIntervalProductId[dynamicParameter] = productId;
	createIntervalArray[dynamicParameter] = setInterval(function() { f(dynamicParameter,productId,type,url); }, interval); 
}

function genericAjaxCallback(idNumber,productId,type,url){
	// console.log("checking "+ type + " --  scanName: "+g_model +" and product " + productId);
	// console.log("The type is " + type);
	if (type == "1"){
		callBackUrl = 'scripts/s3ModelExists.php';
	}else if(type=="2"){
		callBackUrl = 'scripts/swModelExists.php';
	}else{
		callBackUrl = 'scripts/s3ModelExists.php';
	}
	// console.log(callBackUrl);
	$.ajax({
			url: callBackUrl,
			data: "scanName="+g_model+"&productId="+productId,
			success: function(data) {
				//console.log(data);
				if(data=="trying"){
					// console.log("trying to make a product " + productId +  " for the " + creatingIntervalCount[idNumber] + " time");
				}else if(data=="fail"){
					console.log("Handle failed");
					myFancy("Generating this model failed. We tried really hard but sometimes this new-fangled 3D stuff is too much, even for us! Don't fret however, we sent an email to our 3D specialists and they are hard at work fixing the issue. Maybe try a different scan?");
					creatingToGenerateStyling(idNumber);
					clearInterval(createIntervalArray[idNumber]);
				}
				else if(data != "fail"){
					myFancy("Your product is finished generating. Buy it now!");
					if (type == "1"){
						//console.log("Shapeshot");
						//ShapeShot
						var s3Link = data;
						$("#generateText"+idNumber).addClass("buttondownload");
						$("#generateText"+idNumber).attr("href",s3Link);
						$("#generateText"+idNumber).attr("target","_blank");
						$("#generateText"+idNumber).removeClass("buttonCreating");
						$("#generateIcon"+idNumber).removeClass("buttonGenerateIconSpinning");
						$("#generateIcon"+idNumber).addClass("buttonGenerateIconNone");
						
						$("#tooltipDiv"+idNumber).remove();
					}else if(type=="2"){
						//console.log("shapeways");
						//Shapeways
						var partsOfStr = data.split(',');
						var shapewaysLink = "http://www.shapeways.com/model/" + partsOfStr[0] + "/?key=" + partsOfStr[1];
						//console.log(shapewaysLink);
						
						$("#generateText"+idNumber).addClass("buttonbuy");
						$("#generateText"+idNumber).attr("href",shapewaysLink);
						$("#generateText"+idNumber).attr("target","_blank");
						$("#generateText"+idNumber).removeClass("buttonCreating");
						$("#generateIcon"+idNumber).removeClass("buttonGenerateIconSpinning");
						$("#generateIcon"+idNumber).addClass("buttonGenerateIconNone");
						
						$("#tooltipDiv"+idNumber).remove();
					}else{
						//3rth party
						//console.log("3rd party");
						var s3Link = data;
						$("#generateText"+idNumber).addClass("buttonbuy");
						$("#generateText"+idNumber).bind("click", 
							   function() {
								 thirdPartyEmail.apply(this, [url]);
							   }
						  );
						$("#generateText"+idNumber).removeClass("buttonCreating");
						$("#generateIcon"+idNumber).removeClass("buttonGenerateIconSpinning");
						$("#generateIcon"+idNumber).addClass("buttonGenerateIconNone");
						$("#tooltipDiv"+idNumber).remove();	
					}
					clearInterval(createIntervalArray[idNumber]);
				}
			}
		});
		if(creatingIntervalCount[idNumber]>180){
			console.log("Handle too many tries!!!");
			myFancy("We tried a bunch of times but there is no response from the server. We are working to fix it!");
			creatingToGenerateStyling(idNumber);
			clearInterval(createIntervalArray[idNumber]);
		}
		creatingIntervalCount[idNumber]++;
}

function styleGenerateButton(idNumber){	
	$("#generateText"+idNumber).addClass("buttonCreating");
	$("#generateText"+idNumber).removeClass("buttongenerate");
	$("#generateIcon"+idNumber).addClass("buttonGenerateIconSpinning");
	$("#tooltipDiv"+idNumber).html("Your custom product is being created by our awesome brains. Well... at least our servers are working hard!");
	$("#generateText"+idNumber).removeAttr("onclick");
}

function creatingToGenerateStyling(idNumber){	
	$("#generateText"+idNumber).addClass("buttongenerate");
	$("#generateText"+idNumber).removeClass("buttonCreating");
	$("#generateIcon"+idNumber).removeClass("buttonGenerateIconSpinning");
	$("#generateIcon"+idNumber).addClass("buttonGenerateIcon");
	
}

function myFancy(html){
	document.getElementById('dialogContent').innerHTML=html;
	$.fancybox({
		type: 'inline',
		content: '#dialogContent'
	});
}
// Create the XHR object.
function createCORSRequest(method, url) {
  
  var xhr = new XMLHttpRequest();
  if ("withCredentials" in xhr) {
    // XHR for Chrome/Firefox/Opera/Safari.
	xhr.open(method, url, true);
  } else if (typeof XDomainRequest != "undefined") {
    // XDomainRequest for IE.
    xhr = new XDomainRequest();
    xhr.open(method, url);
  } else {
    // CORS not supported.
    xhr = null;
  }
  return xhr;
}
if (Modernizr.webgl){
	function IncludeJavaScript(jsFile)
	{
	  document.write('<script type="text/javascript" src="'+ jsFile + '"></scr' + 'ipt>');
	}
	IncludeJavaScript('webgl/js/three/build/Three.js');
	IncludeJavaScript('webgl/js/three/src/extras/io/Loader.js');
	IncludeJavaScript('webgl/js/json2.min.js');
	IncludeJavaScript('webgl/js/ss_loader.js');
	IncludeJavaScript('webgl/js/ss_webgl_eventHandling.js');
	IncludeJavaScript('webgl/js/ss_webgl_viewer_flex.js');
} else {
	document.getElementById('loading').style.display = 'none';
	document.getElementById('notice').style.display = 'block';
}