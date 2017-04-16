var allEdges=[];
var allNodes=[];
var root_dist;
var parent;
var parentList;
var children;
var children_num;
var taxonomyName;

function myonload(){
  loadEdges();
  loadNodes();
}
function start(){
  root_dist=-1;
  parent="-";
  document.getElementById("taxonomy").innerHTML=parent;
  parentList=[];
  children=["root"];
  loadInfo(0,1);
}

function loadInfo(taxonomyInd,distUpdate){
  
  if(distUpdate>0){
    //alert("parentList bfr="+parentList);
    parent=document.getElementById("taxonomy").innerHTML;
    parentList.push(parent);
    //alert("parentList after="+parentList);
    taxonomyName=children[taxonomyInd].replace(/(\r\n|\n|\r)/gm,"");  
  }
  if(distUpdate<0){
    taxonomyName=parentList[taxonomyInd];
    //alert("parentList bfr="+parentList);
    tmpLen=parentList.length;
    for(i=1;i<=tmpLen-taxonomyInd;i++){
      parent=parentList.pop();
      distUpdate--;  
    }
    distUpdate++;
    //alert("in pop, parent="+parent);
    //alert("parentList after="+parentList);
  }
  root_dist=root_dist+distUpdate;
  document.getElementById("taxonomy").innerHTML =/*root_dist+') '+*/taxonomyName;
  //alert(taxonomyName);

  //alert("here"+taxonomyName);
  children=[];
  for(i=0;i<allEdges.length;i++){
    if(allEdges[i][0]==taxonomyName){
      children.push(allEdges[i][1]);
    }
  }

  parInd=parentList.length-1;
  out="";
  for(i=1;i<parentList.length;i++){ // there is reason for starting from 1
    tmpInd=i-1;
    out=out+tmpInd+') <a href="#" onclick="loadInfo('+i+',-1);">'+parentList[i]+'</a></br>';
  }
  document.getElementById("parent").innerHTML =out;

  out="<ul>";
  for(i=0;i<children.length;i++){
    tmpInd=i+1;
    for(j=0;j<allNodes.length;j++){
      if(allNodes[j][0]==children[i]){
        childMultiplicity=allNodes[j][1];
      }
    }
    out+='<li><a href="#" onclick="loadInfo('+i+',1);">'+children[i]+'</a>'+'  ('+childMultiplicity+')</li>';
  }
  out+="</ul>";
  document.getElementById("allchildren").innerHTML=out;
  children_num=children.length;
  //document.getElementById("children_num").innerHTML = children_num;  
  //document.getElementById("allparents").innerHTML=parentList+"</br>"+children;

  for(i=0;i<allNodes.length;i++){
    if(allNodes[i][0]==taxonomyName){
      document.getElementById("multiplicity").innerHTML=allNodes[i][1];
    }
  }
}


function startSearch(){
  var queryLen=document.getElementById("tosearch").value.length;
  var query=document.getElementById("tosearch").value;
  if(4-queryLen>0){
    // IF LESS THAN 4 CHARACTERS HAVE BEEN ENTERED
    var missingLen=4-queryLen;
    if(missingLen==1){ 
      document.getElementById("searchstatus").innerHTML="Please enter 1 more character.."; 
    }else{
      document.getElementById("searchstatus").innerHTML="Please enter "+missingLen+" more characters..";  
    }
  }else{
    // IF >= 4 CHARACTERS HAVE BEEN ENTERED
    document.getElementById("searchstatus").innerHTML="";
    var searchOutput="";
    var patt,res2,ind2,redcol2,bf2,after2;
    var howManySearchResults=0;
    for(var i=0;i<allNodes.length;i++){
      patt=new RegExp(query,'gi');
      res2=allNodes[i][0].match(patt);

      if(res2!=null){
        howManySearchResults++;
	      ind2=allNodes[i][0].toLowerCase().indexOf(query.toLowerCase());
        bfr2=allNodes[i][0].substr(0,ind2);
        redcol2=allNodes[i][0].substr(ind2,queryLen);
        after2=allNodes[i][0].substr(ind2+queryLen);
        searchOutput=searchOutput+'<input type="radio" name="pointFoundFromSearch" value="'+i+'" onclick="selectAndFill('+i+');">['+bfr2+'<strong style="color:red">'+redcol2+'</strong>'+after2+']<br/>';
      }
    }
    if(howManySearchResults==0){
      document.getElementById("searchstatus").innerHTML='Nothing matches your search..';
    }else if(howManySearchResults<=10){
      document.getElementById("searchstatus").innerHTML="Click any of the results to go there.. </br>"+searchOutput;
    }else{
      document.getElementById("searchstatus").innerHTML="Found "+howManySearchResults+" matches. Please narrow it down to less than 10 results.";
    }
  }
}

function selectAndFill(id){
  document.getElementById("searchstatus").innerHTML="";
  document.getElementById("tosearch").value=allNodes[id][0];
  //alert(id);
  rootReached=false;
  curParent="";
  curChild=allNodes[id][0];
  parentList=[];
  while(!rootReached){
    for(i=0;i<allEdges.length;i++){
      if(allEdges[i][1]==curChild){
        curParent=allEdges[i][0];
	parentList.push(curParent);
	curChild=curParent;
	//alert(curParent);
	if(curParent=="root"){
	  rootReached=true;	
	}        
	break;      
      }
    }
  }
  parentList.push("");
  root_dist=parentList.length-2; // -2, yes, this is rigth
  parentList=parentList.reverse();
  parent=parentList[parentList.length-1];
  parentList.pop();
  //alert(parentList);
  children=[];
  for(i=0;i<allEdges.length;i++){
    if(allEdges[i][0]==parent){
      children.push(allEdges[i][1]);
      if(allEdges[i][1]==allNodes[id][0]){
	idToSend=children.length-1;
      }
    }
  }
  //children=["Eukaryota"];
  //alert(parentList+"\n"+children+"\n"+root_dist+"\n"+parent+"\n"+idToSend);
  document.getElementById("taxonomy").innerHTML=parent;
  loadInfo(idToSend,1);
}


function loadEdges(){
  var xmlhttp;
  if(window.XMLHttpRequest){xmlhttp=new XMLHttpRequest();}else{xmlhttp=new ActiveXObject("Microsoft.XMLHTTP");}

  xmlhttp.onreadystatechange=function(){
    if (xmlhttp.readyState==4 && xmlhttp.status==200){
      //alert("start edges");
      tmp=xmlhttp.responseText.split('#');
      for(i=0;i<tmp.length;i++){
        tmp2=tmp[i].split(',');
        allEdges.push([tmp2[0],tmp2[1]]);
      }
      //alert("stop edges");
    }
  }
  xmlhttp.open("GET","edges.txt",true);
  xmlhttp.send();
}

function loadNodes(){
  var xmlhttp;
  if(window.XMLHttpRequest){xmlhttp=new XMLHttpRequest();}else{ mlhttp=new ActiveXObject("Microsoft.XMLHTTP");}

  xmlhttp.onreadystatechange=function(){
    if (xmlhttp.readyState==4 && xmlhttp.status==200){
      //alert("start nodes");
      tmp=xmlhttp.responseText.split("#");
      for(i=0;i<tmp.length;i++){
        tmp2=tmp[i].split(",");
        allNodes.push([tmp2[0],tmp2[1]]);
      }
      //alert("stop nodes");
    }
  }
  xmlhttp.open("GET","nodes.txt",true);
  xmlhttp.send();
}
