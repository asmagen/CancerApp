//startup
var canvas=document.getElementById("canvas");
var c=canvas.getContext("2d");

//engine support
var colors=["red","yellow","orange","purple","blue","pink","gray","cyan","green"];
var bins=["low-low","low-med","low-high","med-low","med-med","med-high","high-low","high-med","high-high"];
var nodes=Array();
var edges=Array();
var selected=null;
var mouse=[0,0];
var origin={x:0,y:0};
var scale=1;
function formatClick(e){
	var b=canvas.getBoundingClientRect();
	e.x=e.clientX-b.left;
	e.y=e.clientY-b.top;
        e.x-=origin.x;
        e.y-=origin.y;
        e.x/=scale;
        e.y/=scale;
}
function mousedown(e){
        formatClick(e);
        if(graph.visible && graph.mouseIn(e.x*scale,e.y*scale)){
	    selected=graph;
	    return;
	}
	for(var a=nodes.length-1;a>=0;a--){
		if(distance(nodes[a],e.x,e.y)<nodes[a].radius){
			selected=nodes[a];
			return;
		}
	}
        selected=origin;
}
var moved=false;
function mousemove(e){
    formatClick(e);
    if(selected!=null){
	var factor=1;
	if(selected==origin || selected==graph){
	    factor=scale;
	}
	selected.x+=(e.x-mouse[0])*factor;
	selected.y+=(e.y-mouse[1])*factor;
	moved=true;
    }
    mouse=[e.x,e.y];
    if(graph.visible){
	for(var a=0;a<graph.selectors.length;a++){
	    Selector.statusColor(graph.selectors[a]);
	}
	var x=e.x*scale;
	var y=e.y*scale;
	var centerX=graph.x+(graph.selectors[0].xOff*graph.scaleX)+Selector.radius;
	if(x>=centerX-Selector.radius && x<=centerX+Selector.radius){
	    var centerY=graph.y+(graph.selectors[0].yOff*graph.scaleY);
	    if(y>=centerY-Selector.radius && y<=centerY+(Selector.buffer*graph.scaleY*(graph.selectors.length-1))+Selector.radius){
		var index=Math.floor((y-(centerY-Selector.radius))/(Selector.buffer*graph.scaleY));
		graph.selectors[index].color="blue";
	    }
	}
    }
}
function zoomIn(){
    const limit=3.5;
    if(scale>=limit){
	return;
    }
    scale*=1.5;
    if(scale>=limit){
	scale=limit;
    }
}
function zoomOut(){
    const limit=0.4;
    if(scale<=limit){
	return;
    }
    scale/=1.5;
    if(scale<=limit){
	scale=limit;
    }
}
var last;
function clickCanvas(){
	var x=mouse[0];
	var y=mouse[1];
        if(moved){
	    moved=false;
	    selected=null;
	    return;
	}
        /*if(help.active){
	        help.active=false;
	        help.hover=false;
	        return;
	}
        if(help.hover){
	        drawHelpButton();
	        help.active=true;
	        help.hover=false;
	        return;
	}*/
        if(graph.visible && graph.mouseIn(x*scale,y*scale)){
	    for(var a=0;a<graph.selectors.length;a++){
		var s=graph.selectors[a];
		if(s.color=="blue"){
		    s.status=!s.status;
		    Selector.statusColor(s);
		    Shiny.onInputChange("bins",Selector.getSelectors());
		    return;
		}
	    }
	    if(x*scale>graph.x+graph.width-20 && y*scale<graph.y+20){
		graph.visible=false;
	    }
	    return;
	}
	for(var a=nodes.length-1;a>=0;a--){
		var node=nodes[a];
		if(distance(node,x,y)<=node.radius){
			Shiny.onInputChange("bins","111");
			Shiny.onInputChange("gene",node.name);
			Shiny.onInputChange("gene1","none");
		        graph.setType("node","111");
			graph.description="";
		        graph.setCoordinates(node.x,node.y,node.radius+2);
		        if(last!=node){
			    last=node;
			    graph.image.src=Graph.defaultSrc;
			}
			return;
		}
	}
	for(var a=edges.length-1;a>=0;a--){
	        var edge=edges[a];
		if(edgeClick(nodes[edge.start],nodes[edge.end],edge)){
			setEdgeData(edge,nodes[edge.start].name,nodes[edge.end].name);
			graph.setType("edge",edge.getBins());
			graph.description="";
			/*for(var b=0;b<graph.selectors.length;b++){
				if(colors[b]!=edge.color){
					graph.selectors[b].status=false;
				}
			}*/
			graph.setCoordinates(edge.signPos[0],edge.signPos[1],15);
		        if(last!=edge){
			    last=edge;
			    graph.image.src=Graph.defaultSrc;
			}
			return;
		}
	}
        graph.visible=false;
}
function edgeClick(node,node1,edge){
	var x=mouse[0];
	var y=mouse[1];
	var width=edge.width;
	if((x>node.x)!=(x>node1.x) || (node.x==node1.x)){
		var m=(node.y-node1.y)/(node.x-node1.x);
		if(Math.abs(m)==Infinity){
			if((y>node.y)!=(y>node1.y)){
				if(Math.abs(x-node.x)<width){
					//setEdgeData(edge,node.name,node1.name);
					return true;
				}
			}
			return false;
		}else{
			var expectedY;
			if(node.x<node1.x){
				expectedY=(m*(x-node.x))+node.y;
			}else{
				expectedY=(m*(x-node1.x))+node1.y;
			}
			var leniency=Math.abs(width/Math.cos(Math.atan(m)));
			if(Math.abs(y-expectedY)<leniency){
				//setEdgeData(edge,node.name,node1.name);
				return true;
			}
		}
	}
	return false;
}
function setEdgeData(edge,gene,gene1){
	var i=colors.indexOf(edge.color);
	var addToTitle=": "+bins[i]+" ("+(i+1)+")(Confidence: "+edge.width+"/30)";
	Shiny.onInputChange("addToTitle",addToTitle);
	Shiny.onInputChange("bins",edge.getBins());
	Shiny.onInputChange("gene",gene);
	Shiny.onInputChange("gene1",gene1);
}
function distance(){
	function dist(x,y,x1,y1){
		return Math.sqrt(Math.pow(x-x1,2)+Math.pow(y-y1,2));
	}
	if(arguments.length==4){
		return dist(arguments[0],arguments[1],arguments[2],arguments[3]);
	}
	if(arguments.length==3){
		return dist(arguments[0].x,arguments[0].y,arguments[1],arguments[2]);
	}
	if(arguments.length==2){
		return dist(arguments[0].x,arguments[0].y,arguments[1].x,arguments[1].y);
	}
}
function onUpload(){
    var file=document.getElementById("uploader").files[0];
    var reader=new FileReader();
    reader.onload=function(e){
	var contents=e.target.result;
	contents=contents.split("\n");
	var string=contents[0];
	for(var a=1;a<contents.length;a++){
	    if(contents[a].length>0){
		string+=","+contents[a];
	    }
	}
	document.getElementById("searched").value=string;
	Shiny.onInputChange("searched",string);
    }
    reader.readAsText(file);
}

//class definitions
function Node(name,role,selected){
	this.radius=15;
	this.name=name;
	this.x=0;
	this.y=0;
	this.connections=0;
        this.selected=JSON.parse(selected);
        if(typeof(role)=="object"){
	    this.color=[];
	    for(var a=0;a<role.length;a++){
		this.color.push(getColor(role[a]));
	    }
	}else{
	    this.color=[getColor(role)];
	}
}
function Edge(color,width,sign,start,end){
	this.color=color;
	this.width=width;
	this.sign=sign;
	this.start=start;
	this.end=end;
        this.signPos=[];
	this.getBins=function(){
		var bin="";
		for(var a=0;a<colors.length;a++){
			if(colors[a]==this.color){
				bin+="1";
			}else{
				bin+="0";
			}
		}
		return bin;
	}
}
/*function Help(radius){
        this.x=canvas.width-radius;
        this.y=radius;
        this.left=this.x-radius;
        this.bottom=this.y+radius;
        this.radius=radius;
        this.hover=false;
        this.active=false;
}*/
function Graph(){
    this.image;
    this.visible=false;
    this.x=0;
    this.y=0;
    this.width=700;
    this.height=350;
    this.scaleX=1;
    this.scaleY=1;
    Graph.defaultSrc;//="default";
    this.description="";
    this.selectors=[];
    this.setCoordinates=function(focusX,focusY,minOffset){
	this.x=(focusX+minOffset)*scale;
	this.y=(focusY-(this.height/2))*scale;
	if(this.x+this.width+origin.x>canvas.width){
	    this.x=((focusX-minOffset)*scale)-this.width;
	}
	if(this.y+origin.y<0){
	    this.y=(focusY+minOffset)*scale;
	}else if(this.y+this.height+origin.y>canvas.height){
	    this.y=((focusY-minOffset)*scale)-this.height;
	}
	this.visible=true;
    }
    this.mouseIn=function(x,y){
	return (x>=this.x && x<=this.x+this.width && y>=this.y && y<=this.y+this.height);
    }
    this.setType=function(type,bins){
	this.type=type;
	var s=3;
	if(type=="edge"){
	    s=9;
	}
	this.selectors=[];
	for(var a=0;a<s;a++){
		var selector=new Selector(type,a);
		if(bins.substring(a,a+1)=="1"){
			selector.status=true;
		}
		this.selectors.push(selector);
	}
    }
}
function Selector(graphType,index){
    Selector.buffer=14.5;
    Selector.radius=5;
    this.color="gray";
    this.status=false;
    this.xOff=142;
    this.yOff=233;
    if(graphType=="edge"){
	this.xOff=187;
	this.yOff=184;
    }
    this.yOff+=index*Selector.buffer;
    Selector.statusColor=function(s){
	if(s.status){
	    s.color="gray";
	}else{
	    s.color="white";
	}
    }
    Selector.getSelectors=function(){
	var value="";
	for(var s=0;s<graph.selectors.length;s++){
	    if(graph.selectors[s].status){
		value+="1";
	    }else{
		value+="0";
	    }
	}
	return value;
    }
}

//nodes support
/*function getColor(name){
	var chars=["a","b","c","d","e","f","g","h","i","j","k","l","m","n","o","p","q","r","s","t","u","v","w","x","y","z","0","1","2","3","4","5","6","7","8","9"];
	var hex=["0","1","2","3","4","5","6","7","8","9","a","b","c","d","e","f"];
	var color="";
	var i=0;
	while(color.length<6){
		if(i>=name.length){
			i=0;
		}
		color+=hex[chars.indexOf(name.substring(i,i+1).toLowerCase())%hex.length];
		i++;
	}
	return "#"+color;
}*/
function getColor(role){
    if(role=="TSG"){//Tumor supressor gene
	return "green";
    }
    if(role=="oncogene"){
	return "orange";
    }
    if(role=="BRCAdriver"){//breast cancer driver
	return "ivory";
    }
    if(role=="Cancergene"){
	return "red";
    }
    return "gray";
}
/*function setCoordinates(node,index,length,center){
	var angle=index*(Math.PI*2)/length;
        var distance=150;
	node.x=Math.round(center.x+(distance*Math.cos(angle)));
	node.y=Math.round(center.y+(distance*Math.sin(angle)));
}*/
var nodeData="";
function populateNodes(){
	graph.visible=false;
	c.font="10pt sans-serif";
	while(nodes.length>0){
		nodes.splice(0,1);
	}
	while(edges.length>0){
		edges.splice(0,1);
	}
	var data=nodeData;
	for(var a=0;a<data.length;a++){
		if(data.substring(a,a+1)=="\"" || data.substring(a,a+1)=="\n" || data.substring(a,a+1)==" "){
			data=data.substring(0,a)+data.substring(a+1);
			a--;
		}
	}
	if(data.substring(0,6)=="[1]NA,"){
		return;
	}

	information=data.split("[1]");
	information.splice(0,1);
	for(var a=0;a<information.length;a++){
		information[a]=information[a].split(",,");
		var add=true;
		for(var b=0;b<nodes.length;b++){
			if(nodes[b].name==information[a][0]){
				add=false;
			        if(JSON.parse(information[a][2]) && !nodes[b].selected){
				    var n=nodes[b];
				    n.selected=true;
				    nodes.splice(b,1);
				    nodes.push(n);
				}
				break;
			}
		}
		if(add==true){
			nodes.push(new Node(information[a][0],getRoles(information[a][1]),information[a][2]));
		}
	}
	for(var a=0;a<information.length;a++){
		for(var b=3;b<information[a].length;b+=4){
			establishConnection(information[a][0],information[a][b],information[a][b+1],information[a][b+2],information[a][b+3]);
		}
	}
        /*var centerX=200;
        var centerY=200;
        var centerNode,index,length;
	for(var a=0;a<nodes.length;a++){
	        console.log(selected.indexOf(nodes[a].name));
	        if(selected.indexOf(nodes[a].name)>=0){
		    centerNode=nodes[a];
		    index=0;
		    length=1;
		    while(a+length<nodes.length && selected.indexOf(nodes[a+length].name)==-1){
			length++;
		    }
		    length--;
		    nodes[a].x=centerX;
		    nodes[a].y=centerY;
		    centerX+=350;
		    if(centerX+175>canvas.width){
			centerX=200;
			centerY+=350;
		    }
		}else{
	            setCoordinates(nodes[a],index,length,centerNode);
		    index++;
		}
		if(nodes[a].connections>0){
			nodes[a].radius+=Math.round(10*Math.log(nodes[a].connections));
		}
	}*/
	var filterColor=$("#colorFilter option:selected").val();
	if(filterColor!="all"){
		colorFilter(parseInt(filterColor));
		cleanAfterFilters();
	}
	if(document.getElementById("filter").checked){
		connectionFilter();
		cleanAfterFilters();
	}
        positionNodes();
}
function connectionFilter(){
	for(var a=0;a<nodes.length;a++){
		if(nodes[a].connections<=1 && !nodes[a].selected){
			for(var b=0;b<edges.length;b++){
				if(edges[b].start==a || edges[b].end==a){
					edges[b].remove=1;
					//break;
				}
			}
		}
	}
}
function colorFilter(color){
	for(var a=0;a<edges.length;a++){
		if(edges[a].color!=colors[color]){
			edges[a].remove=1;
		}
	}
}

function cleanAfterFilters(){
	for(var a=0;a<edges.length;a++){
		if(edges[a].remove!=undefined){
			if(nodes[edges[a].start].connections>0){
				nodes[edges[a].start].connections--;
			}
			if(nodes[edges[a].end].connections>0){
				nodes[edges[a].end].connections--;
			}
			edges.splice(a,1);
			a--;
		}
	}
	for(var a=0;a<nodes.length;a++){
		if(!nodes[a].selected && nodes[a].connections==0){
			for(var b=0;b<edges.length;b++){
				if(edges[b].start>a){
					edges[b].start--;
				}
				if(edges[b].end>a){
					edges[b].end--;
				}
			}
			nodes.splice(a,1);
			a--;
		}
	}
}
function getRoles(info){
    return info.replace(",","/").split("/");
}
function positionNodes(){
    var extreme=null;
    var centerX=0;
    var centerY=0;
    for(var a=0;a<nodes.length;a++){
	if(nodes[a].selected){
	    var length=0;
	    while(a+1+length<nodes.length && !nodes[a+1+length].selected){
		length++;
	    }
	    var rad=Math.ceil((length*20)/Math.PI)+10;
	    if(rad<150){
		rad=150;
	    }
	    centerX+=rad+25;
	    if(a==0){
		extreme={smallX:centerX,smallY:centerY,largeX:centerX,largeY:centerY};
	    }
	    nodes[a].x=centerX;
	    nodes[a].y=centerY;
	    checkForExtreme(nodes[a],extreme);
	    for(var b=0;b<length;b++){
		var theta=Math.PI*2*b/length
		nodes[b+a+1].x=Math.round(Math.cos(theta)*rad)+centerX;
		nodes[b+a+1].y=Math.round(Math.sin(theta)*rad)+centerY;
		checkForExtreme(nodes[b+a+1],extreme);
	    }
	    centerX+=rad+25;
	}
	if(nodes[a].connections>0){
	    nodes[a].radius+=Math.round(10*Math.log(nodes[a].connections));
	}
    }
    if(extreme==null){
	setScale(0,0,canvas.width,canvas.height);
    }else{
	setScale(extreme.smallX,extreme.smallY,extreme.largeX,extreme.largeY);
    }
}
function setScale(left,top,right,bottom){
    var width=right-left;
    var height=bottom-top;
    var xScale=canvas.width/width;
    var yScale=(canvas.height-legendHeight)/height;
    var sig=4;
    if(xScale<yScale){
	scale=Math.round(xScale*sig)/sig;
    }else{
	scale=Math.round(yScale*sig)/sig;
    }
    origin.x=-left*scale;
    origin.y=-top*scale;
}
function checkForExtreme(node,extreme){
    if(node.x+node.radius>extreme.largeX){
	extreme.largeX=node.x+node.radius;
    }
    if(node.x-node.radius<extreme.smallX){
	extreme.smallX=node.x-node.radius;
    }
    if(node.y+node.radius>extreme.largeY){
	extreme.largeY=node.y+node.radius;
    }
    if(node.y-node.radius<extreme.smallY){
	extreme.smallY=node.y-node.radius;
    }
}
function establishConnection(gene1,gene2,color,width,sign){
	var index1=-1;
	var index2=-1;
	for(var a=0;a<nodes.length;a++){
		if(nodes[a].name==gene1){
			index1=a;
			break;
		}
	}
	for(var a=0;a<nodes.length;a++){
		if(nodes[a].name==gene2){
			index2=a;
			break;
		}
	}
	if(index1>=0 && index2>=0){
		for(var a=0;a<edges.length;a++){
			if((edges[a].start==index1 && edges[a].end==index2) || (edges[a].start==index2 && edges[a].end==index1)){
				return;
			}
		}
		edges.push(new Edge(color,width,sign,index1,index2));
		nodes[index1].connections++;
		nodes[index2].connections++;
	}
}

function formatDescription(){
	var des=$("#description").text().split(",,,");
	des[0]=des[0].substring(5);
	if(des.length==2){
		des[1]=des[1].substring(0,des[1].length-1);
	}
	for(var a=0;a<des.length;a++){
		var b=1;
		while(b<des[a].length){
			if(c.measureText(des[a].substring(0,b)).width>690){
				while(des[a].substring(b,b+1)!=" "){
					b--;
				}
				des.splice(a+1,0,des[a].substring(b));
				des[a]=des[a].substring(0,b);
			}
			b++;
		}
	}
	graph.description=des;
}

//drawing
function drawGraph(){
        if(graph.visible){
	    c.translate(graph.x,graph.y);
	    if(graph.image.src==Graph.defaultSrc){
		drawLoading();
	    }else{
		if(graph.description==""){
			formatDescription();
		}
		c.fillStyle="black";
		c.strokeStyle="black";
		c.lineWidth=1;
		c.font="bold 15pt sans-serif";
		graph.scaleX=graph.width/graph.image.width;
		graph.scaleY=graph.height/graph.image.height;
		c.scale(graph.scaleX,graph.scaleY);
		c.drawImage(graph.image,0,0);
		c.scale(1/graph.scaleX,1/graph.scaleY);
		c.strokeRect(0,0,graph.width,graph.height);
		c.fillText("x",graph.width-20,20);
		drawDescription();
		drawSelectors(graph.selectors);
	    }
	    c.translate(-graph.x,-graph.y);
	}
}
function drawSelectors(s){
    for(var a=0;a<s.length;a++){
	c.beginPath();
	c.arc(s[a].xOff*graph.scaleX,s[a].yOff*graph.scaleY,Selector.radius,0,Math.PI*2,true);
	c.closePath();
	c.fillStyle=s[a].color;
	c.fill();
	c.stroke();
    }
}
function drawDescription(){
	c.fillStyle="white";
	c.fillRect(0,graph.height,graph.width,(graph.description.length*15)+5);
	c.font="10pt sans-serif";
	c.fillStyle="black";
	for(var a=0;a<graph.description.length;a++){
		c.fillText(graph.description[a],5,(15*(a+1))+graph.height);
	}
	c.strokeRect(0,graph.height,graph.width,(graph.description.length*15)+5);
}
function drawLoading(){
    c.fillStyle="maroon";
    c.font="bold 20pt sans-serif";
    c.fillText("Loading...",0,0);
}
function drawCircle(x,y,radius,colors){
    c.strokeStyle="black";
    c.lineWidth=1;
    c.fillStyle=colors[0];
    c.beginPath();
    c.arc(x,y,radius,0,2*Math.PI,true);
    c.closePath();
    c.fill();
    c.stroke();
    for(var a=1;a<colors.length;a++){
	c.fillStyle=colors[a];
	c.beginPath();
	var rad=(radius/colors.length)*(colors.length-a)
	c.arc(x,y,rad,0,2*Math.PI,true);
	c.closePath();
	c.fill();
    }
    c.fillStyle="white";
    c.globalAlpha/=4;
    c.beginPath();
    var offset=radius*Math.cos(Math.PI/4)/2;
    c.arc(x-offset,y-offset,radius/2,0,2*Math.PI,true);
    c.closePath();
    c.fill();
    c.globalAlpha*=4;
}
function drawNodes(){
	c.font="10pt sans-serif";
	for(var a=0;a<nodes.length;a++){
		var node=nodes[a];
		drawCircle(node.x,node.y,node.radius,node.color);
		c.fillStyle="black";
		var delta=c.measureText(node.name).width/2;
		c.fillText(node.name,node.x-delta,node.y+5);
	}
}
function drawEdges(){
	for(var a=0;a<edges.length;a++){
		var edge=edges[a];
		var startX=nodes[edge.start].x;
		var startY=nodes[edge.start].y;
		var endX=nodes[edge.end].x;
		var endY=nodes[edge.end].y;
		var theta=Math.atan2(endY-startY,endX-startX);
		startX+=(nodes[edge.start].radius+parseInt(edge.width))*Math.cos(theta);
		startY+=(nodes[edge.start].radius+parseInt(edge.width))*Math.sin(theta);
		theta+=Math.PI;
		endX+=nodes[edge.end].radius*Math.cos(theta);
		endY+=nodes[edge.end].radius*Math.sin(theta);
		edge.signPos=drawEdge(startX,startY,endX,endY,edge.color,edge.width,edge.sign);
	}
}
function drawEdge(startX,startY,endX,endY,color,width,sign){
    c.strokeStyle=color;
    c.lineWidth=width;
    c.beginPath();
    c.moveTo(startX,startY)
    c.lineTo(endX,endY)
    c.stroke();
    c.closePath();
    if(arguments.length==8){
	var theta=arguments[7];
    }else{
	var theta=Math.atan2(endY-startY,endX-startX)+Math.PI;
    }
    drawArrow(startX,startY,width,color,theta+Math.PI);
    c.fillStyle="black";
    c.font="bold 15pt sans-serif";
    var signPos=[((endX-startX)/2)+startX,((endY-startY)/2)+startY]
    c.fillText(sign,signPos[0]-7,signPos[1]+7);
    return signPos;
}
function drawArrow(x,y,e,color,theta){
	c.fillStyle=color;
	c.translate(x,y);
	c.rotate(theta);
	c.beginPath();
	c.moveTo(-e,0);
	c.lineTo(0,e);
	c.lineTo(0,-e);
	c.lineTo(-e,0);
	c.fill();
	c.closePath();
	c.rotate(-theta);
	c.translate(-x,-y);
}
/*var help=new Help(15);
function drawHelpButton(){
        if(canvas.width-(help.radius*2)>help.left){
	        help.x=canvas.width-help.radius;
	        help.left=help.x-help.radius;
	}
        help.hover=false;
	if(mouse!=null && mouse[0]>=help.left && mouse[1]<=help.bottom){
		help.hover=true;
	}
	if(help.hover){
		c.fillStyle="white";
	}else{
		c.fillStyle="maroon";
	}
	c.beginPath();
	c.arc(help.x,help.y,help.radius,0,Math.PI*2,true);
	c.closePath();
	c.fill();
	c.strokeStyle="black";
	c.lineWidth=1;
	c.stroke();
	if(help.hover){
		c.fillStyle="maroon";
	}else{
		c.fillStyle="white";
	}
	c.font="bold 12pt sans-serif";
	c.fillText("i",help.x-3,help.y+6);
}
function drawHelpScreen(){
        c.fillText("Welcome to the help screen!",25,10);
        c.fillText(" Type in a single gene's name, or a list of genes separated by commas to",5,30);
        c.fillText("start exploring gene networks. Click on a gene node or a connection",5,50);
        c.fillText("between genes to view a statistical representation of how it affects",5,70);
        c.fillText("Cancer survival. All data will be graphed using Kaplan-Meier (KM) plots.",5,90);
        c.fillText(" Connections can be different colors and widths, and they all have an",5,130);
        c.fillText("arrow and either a + or - on them. Color indicates which gene expression",5,150);
        c.fillText("combination (refer to graph legend) plays a critical role in Cancer. Width",5,170);
        c.fillText("refers to our confidence in that role (how strongly we believe in it).",5,190);
        c.fillText("The + and - indicate whether the factor positively or negatively affects",5,210);
        c.fillText("Cancer survival. The arrow helps identify which gene is Gene 1. Gene 1 in",5,230);
        c.fillText("an interaction corresponds to the first expression in each combination",5,250);
        c.fillText("pair.",5,270);
}
function drawLegend1(){
    c.fillStyle="maroon";
    c.font="15pt sans-serif";
    var y=canvas.height-100;
    if(mouse[1]<y){
	c.globalAlpha=0.25;
    }
    c.translate(5,y);
    c.fillText("Connection color shows what expression pair (see graph) causes an interesting interaction",0,0)
    c.fillText("Arrows point to first gene in a pair",0,20)
    c.fillText("Connection width is based on confidence in an interaction's effect",0,40)
    c.fillText("+ or - signifies positive/negative effect",0,60)
    c.fillText("Gene radius corresponds to how interconnected it is",0,80);
    c.translate(-5,-y);
    c.globalAlpha=1;
}*/
var legendHeight=150;
function drawLegend(){
    var y=canvas.height-legendHeight;
    if((mouse[1]*scale)+origin.y<y-20){
	c.globalAlpha=0.25;
    }
    c.translate(5,y);
    drawCircle(20,0,20,["gray"]);
    drawCircle(20,35,10,["gray"]);
    drawEdge(95,60,5,60,"green",15,"");
    drawEdge(100,85,5,85,"green",5,"");
    drawCircle(450,0,10,["green"]);
    drawCircle(450,25,10,["white"]);
    drawCircle(450,50,10,["orange"]);
    drawCircle(450,75,10,["red"]);
    drawCircle(830,0,15,["green","orange"]);
    drawEdge(890,30,815,30,"red",10,"+");
    drawEdge(890,55,815,55,"red",10,"-");
    drawEdge(30,110,5,110,"red",10,"");
    drawEdge(30,135,5,135,"yellow",10,"");
    drawEdge(230,110,205,110,"orange",10,"");
    drawEdge(230,135,205,135,"purple",10,"");
    drawEdge(430,110,405,110,"blue",10,"");
    drawEdge(430,135,405,135,"pink",10,"");
    drawEdge(630,110,605,110,"gray",10,"");
    drawEdge(630,135,605,135,"cyan",10,"");
    drawEdge(830,110,805,110,"green",10,"");
    c.fillStyle="gray";
    c.fillText("Relatively interconnected gene",50,7);
    c.fillText("Relatively isolated gene",40,40);
    c.fillText("Confident interaction",115,70);
    c.fillText("Less confident interaction",115,95);
    c.fillText("Tumor supressor gene (TSG)",470,7);
    c.fillText("Breast Cancer driver",470,32);
    c.fillText("Oncogene",470,57);
    c.fillText("Cancer gene",470,82);
    c.fillText("TSG/Oncogene",850,7);
    c.fillText("Positive interaction",910,40);
    c.fillText("Negative interaction",910,65);
    c.fillText("low-low (1)",45,120);
    c.fillText("low-med (2)",45,145);
    c.fillText("low-high (3)",245,120);
    c.fillText("med-low (4)",245,145);
    c.fillText("med-med (5)",445,120);
    c.fillText("med-high (6)",445,145);
    c.fillText("high-low (7)",645,120);
    c.fillText("high-med (8)",645,145);
    c.fillText("high-high (9)",845,120);
    c.translate(-5,-y);
    c.globalAlpha=1;
}

//initialize
function setCanvasDimensions(){
	$("body")[0].style.overflow="hidden";
	var rect=canvas.getBoundingClientRect();
	canvas.width=window.innerWidth-(rect.left*2);
	canvas.height=window.innerHeight-rect.top-rect.left;
}
function update(){
	setTimeout(update,250);
	if(graph.image==undefined){
		graph.image=$("img")[0];
	        if(graph.image!=undefined){
	            Graph.defaultSrc=graph.image.src;
		}
		//return;
	}
	var data=document.getElementById("nodeData").innerHTML;
	if(nodeData!=data){
		nodeData=data;
		populateNodes();
	}
	/*if(help.active){
	        var width=750;
	        var x=(canvas.width-width)/2;
	        c.clearRect(x,0,width,canvas.height);
	        c.strokeStyle="black";
	        c.strokeRect(x,0,width,canvas.height);
	        c.fillStyle="maroon";
	        c.font="15pt sans-serif";
	        c.translate(x,15);
	        drawHelpScreen();
	        c.translate(-x,-15);
	}else{*/
        c.clearRect(0,0,canvas.width,canvas.height);
        drawLegend();
        c.translate(origin.x,origin.y);
        c.scale(scale,scale);
        drawEdges();
        drawNodes();
        c.scale(1/scale,1/scale);
        drawGraph();
        c.translate(-origin.x,-origin.y);
        	/*drawHelpButton();
	}*/
}

$("#filter").click(function(){
	populateNodes();
});
$("#colorFilter").change(function(){
	populateNodes();
});
var graph=new Graph();
setCanvasDimensions();
update();
