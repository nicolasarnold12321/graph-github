
  $('.dropdown-menu a').click(function(){
    $('#selected').text($(this).text());
  });
  $('#optType label').click(function(){
    debugger;
    // $('#optType label input').removeAttr('checked');
    // Refresh the jQuery UI buttonset.                  
    $('#optType').val($(this).text());
     // $(this).attr('checked');
    if($(this).text()=="Interactive repository"){
     $( ".dropdown" ).css("visibility", "hidden");
     $( "#custominput" ).css("visibility", "visible");
    }
    else{
      $( ".dropdown" ).css("visibility", "visible");
      $( "#custominput" ).css("visibility", "hidden");
    }
});
// /*--------Functions to deal with cookies--------*/
function createCookie(name,value,days) {
    var expires = "";
    if (days) {
        var date = new Date();
        date.setTime(date.getTime() + (days*24*60*60*1000));
        expires = "; expires=" + date.toUTCString();
    }
    document.cookie = name + "=" + value + expires + "; path=/";
}
function deleteAllCookies() {
    var cookies = document.cookie.split(";");

    for (var i = 0; i < cookies.length; i++) {
        var cookie = cookies[i];
        var eqPos = cookie.indexOf("=");
        var name = eqPos > -1 ? cookie.substr(0, eqPos) : cookie;
        document.cookie = name + "=;expires=Thu, 01 Jan 1970 00:00:00 GMT";
    }
}

function signout(){
    sessionStorage.clear;
   deleteAllCookies();
   fetch("https://github.com/logout",{ 
            method: 'GET'
        }).then(function(f) {
            prompt("LoggedOut");
        });
   location.reload();
}
function readCookie(name) {
    var nameEQ = name + "=";
    var ca = document.cookie.split(';');
    for(var i=0;i < ca.length;i++) {
        var c = ca[i];
        while (c.charAt(0)==' ') c = c.substring(1,c.length);
        if (c.indexOf(nameEQ) == 0) return c.substring(nameEQ.length,c.length);
    }
    return null;
}

function eraseCookie(name) {
    createCookie(name,"",-1);
}
/*------------------------------------------------*/

/*------------------------------------------------*/

/*----Sets the page up by making the necessary http requests----*/
// function setUp() {

//     var CURRENT_TOKEN=readCookie("token");
//     fetch('https://api.github.com/orgs/google/public_members').then(function(js){
//             return js.text();
//          }).then(function(x){
//             var arraydata=createJSONDATA(JSON.parse(x));
//             renderjsontree(JSON.parse(arraydata));
//             stopLoad();
//          });
// }
//     function stopLoad(){
//         document.getElementById("loader").style.display="none";
//         document.getElementById("preload").style.display="block"; 
//     }

//     checking the graph
// function checkgraph(){
//         fetch('https://api.github.com/graphql', 
//         { 
//             method: 'POST', 
//             body: " \
//  { \
//    \"query\": \"query { viewer { login{number_of_repos:3} }}\" \
//  } \
// ",
//             headers: {"Authorization":"bearer "+sessionStorage.token}
//         })
//         .then(function(f) {
//             // console.log(f);
//             return f.text();
//         }).then(function(jF){
//             console.log(JSON.parse(jF));
//             //showAllrepos(JSON.parse(jF));
//         });
//     }


function stopLoad(){
  document.getElementById("loader").style.display="none";
  document.getElementById("preload").style.display="block";
   $("#info" ).remove();
}
function getServerData(){
    document.getElementById("loader").style.display="block";
    var name=document.getElementById("selected").innerHTML;
    var type=document.getElementById("optType").value;
    if(type!=""){
      debugger;
      if(type!="Interactive repository"&&name!="Choose Organisation"){
     fetch('/graph.json?name='+name.toLowerCase()+'&type='+(type=="Denograph"?"1":"0")).then(function(response){
            return response.json();
        }).then(function(data){
          if(document.getElementById("optType").value=="Denograph interactive"){
            renderjsonInteractive(data);}
            else
              renderjsontree(data);
            stopLoad();
        });
      }
      else{
        var repo=document.getElementById('reponame').value;
        var owner=document.getElementById('owner').value;
        if(repo!=""||owner!=""){
          console.log('here');
          console.log(repo+owner);
          fetch('/graph.json.repo?repo='+repo.toLowerCase()+'&owner='+owner.toLowerCase()).then(function(response){
              return response.json();
          }).then(function(data){
              renderjsonInteractive(data);
              stopLoad();
          });
      
      }
      else
        prompt("Repository/user not chosen!");
    }
}
else
  prompt("Please choose type of graph!");
}

//   }
// function getChildren(key,data){
//     var children= new Array();
//   for(var j=0;j<data.length;j++){
//   var tmp={name :data[j][key].toString().replace((/[\.{}]/g), "*"), size:(j*18+j)}
//   children.push(tmp);
//   }
//   return children;
// }

function renderjsontree(theData){
  debugger;
    var margin = {top: 20, right: 90, bottom: 30, left: 90},
    width = 1000 - margin.left - margin.right,
    height = 3000 - margin.top - margin.bottom;
     var svg = d3.select("#preload").append("svg")
    .attr("width", width + margin.right + margin.left)
    .attr("height", height + margin.top + margin.bottom)
  .append("g")
    .attr("transform", "translate("
          + margin.left + "," + margin.top + ")");
    g = svg.append("g").attr("transform", "translate(40,0)");

var tree = d3.cluster()
    .size([height, width - 160]);

var stratify = d3.stratify()
    .parentId(function(d) { return d.id.substring(0, d.id.lastIndexOf(".")); });

  var root = stratify(theData)
      .sort(function(a, b) { return (a.height - b.height) || a.id.localeCompare(b.id); });

  tree(root);

  var link = g.selectAll(".link")
      .data(root.descendants().slice(1))
    .enter().append("path")
      .attr("class", "link")
      .attr("d", function(d) {
        return "M" + d.y + "," + d.x
            + "C" + (d.parent.y + 100) + "," + d.x
            + " " + (d.parent.y + 100) + "," + d.parent.x
            + " " + d.parent.y + "," + d.parent.x;
      });

  var node = g.selectAll(".node")
      .data(root.descendants())
    .enter().append("g")
      .attr("class", function(d) { return "node" + (d.children ? " node--internal" : " node--leaf"); })
      .attr("transform", function(d) { return "translate(" + d.y + "," + d.x + ")"; })

  node.append("circle")
      .attr("r", 2.5);

  node.append("text")
      .attr("dy", 3)
      .attr("x", function(d) { return d.children ? -8 : 8; })
      .style("text-anchor", function(d) { return d.children ? "end" : "start"; })
      .text(function(d) { return d.id.substring(d.id.lastIndexOf(".") + 1); });
}
/*------------------------------------------------*/
function renderjsonInteractive(theData){
  //document.getElementById("graph").style.height="3000px";
  //document.getElementById("graph").style.width="3000px";
var margin = {top: 20, right: 90, bottom: 30, left: 90},
    width = 1000 - margin.left - margin.right,
    height = 3000 - margin.top - margin.bottom;

// append the svg object to the body of the page
// appends a 'group' element to 'svg'
// moves the 'group' element to the top left margin

var svg = d3.select("#preload").append("svg")
    .attr("width", width + margin.right + margin.left)
    .attr("height", height + margin.top + margin.bottom)
  .append("g")
    .attr("transform", "translate("
          + margin.left + "," + margin.top + ")");

var i = 0,
    duration = 750,
    root;

// declares a tree layout and assigns the size
var treemap = d3.tree().size([height, width]);

// Assigns parent, children, height, depth
root = d3.hierarchy(theData, function(d) { return d.children; });
root.x0 = height / 2;
root.y0 = 0;

// Collapse after the second level
root.children.forEach(collapse);

update(root);

// Collapse the node and all it's children
function collapse(d) {
  if(d.children) {
    d._children = d.children
    d._children.forEach(collapse)
    d.children = null
  }
}

function update(source) {

  // Assigns the x and y position for the nodes
  var treeData = treemap(root);

  // Compute the new tree layout.
  var nodes = treeData.descendants(),
      links = treeData.descendants().slice(1);

  // Normalize for fixed-depth.
  nodes.forEach(function(d){ d.y = d.depth * 180});

  // ****************** Nodes section ***************************

  // Update the nodes...
  var node = svg.selectAll('g.node')
      .data(nodes, function(d) {return d.id || (d.id = ++i); });

  // Enter any new modes at the parent's previous position.
  var nodeEnter = node.enter().append('g')
      .attr('class', 'node')
      .attr("transform", function(d) {
        return "translate(" + source.y0 + "," + source.x0 + ")";
    })
    .on('click', click);

  // Add Circle for the nodes
  nodeEnter.append('circle')
      .attr('class', 'node')
      .attr('r', 1e-6)
      .style("fill", function(d) {
          return d._children ? "lightsteelblue" : "#fff";
      });

  // Add labels for the nodes
  nodeEnter.append('text')
      .attr("dy", ".35em")
      .attr("x", function(d) {
          return d.children || d._children ? -13 : 13;
      })
      .attr("text-anchor", function(d) {
          return d.children || d._children ? "end" : "start";
      })
      .text(function(d) { return d.data.name; });

  // UPDATE
  var nodeUpdate = nodeEnter.merge(node);

  // Transition to the proper position for the node
  nodeUpdate.transition()
    .duration(duration)
    .attr("transform", function(d) { 
        return "translate(" + d.y + "," + d.x + ")";
     });

  // Update the node attributes and style
  nodeUpdate.select('circle.node')
    .attr('r', 10)
    .style("fill", function(d) {
        return d._children ? "lightsteelblue" : "#fff";
    })
    .attr('cursor', 'pointer');


  // Remove any exiting nodes
  var nodeExit = node.exit().transition()
      .duration(duration)
      .attr("transform", function(d) {
          return "translate(" + source.y + "," + source.x + ")";
      })
      .remove();

  // On exit reduce the node circles size to 0
  nodeExit.select('circle')
    .attr('r', 1e-6);

  // On exit reduce the opacity of text labels
  nodeExit.select('text')
    .style('fill-opacity', 1e-6);

  // ****************** links section ***************************

  // Update the links...
  var link = svg.selectAll('path.link')
      .data(links, function(d) { return d.id; });

  // Enter any new links at the parent's previous position.
  var linkEnter = link.enter().insert('path', "g")
      .attr("class", "link")
      .attr('d', function(d){
        var o = {x: source.x0, y: source.y0}
        return diagonal(o, o)
      });

  // UPDATE
  var linkUpdate = linkEnter.merge(link);

  // Transition back to the parent element position
  linkUpdate.transition()
      .duration(duration)
      .attr('d', function(d){ return diagonal(d, d.parent) });

  // Remove any exiting links
  var linkExit = link.exit().transition()
      .duration(duration)
      .attr('d', function(d) {
        var o = {x: source.x, y: source.y}
        return diagonal(o, o)
      })
      .remove();

  // Store the old positions for transition.
  nodes.forEach(function(d){
    d.x0 = d.x;
    d.y0 = d.y;
  });

  // Creates a curved (diagonal) path from parent to the child nodes
  function diagonal(s, d) {

    path = `M ${s.y} ${s.x}
            C ${(s.y + d.y) / 2} ${s.x},
              ${(s.y + d.y) / 2} ${d.x},
              ${d.y} ${d.x}`

    return path
  }

  // Toggle children on click.
  function click(d) {
    if (d.children) {
        d._children = d.children;
        d.children = null;
      } else {
        d.children = d._children;
        d._children = null;
      }
    update(d);
  }
}
}

/*------------------------------------------------*/

/*-------------Sets repos information-------------*/
function showAllrepos(information){
    console.log(information);
    var node=document.getElementById("repos");
    var info=JSON.stringify(information);
    for(var i=0;i<information.length;i++)
    {
    var user = JSON.stringify(information[i]);
    var insert = document.createElement("div");
    insert.innerHTML=user+"<br><br><br>";
    node.appendChild(insert);
    }
}
/*------------------------------------------------*/