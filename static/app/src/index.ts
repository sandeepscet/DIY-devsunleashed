// @ts-nocheck
/* eslint-disable */

import { invoke } from '@forge/bridge';
import { view } from '@forge/bridge';

let forgeData = [];
let gameForgeData ={};
let issueMainKey = '';
const context = await view.getContext();
const accountId = context.accountId;
const currentDate = new Date(Date.now()).toLocaleString();

/*
forgeData = [{"category" : "BLOCK" , "count" : 50 } , {"category" : "BAR" , "count" : 20 } , {"category" : "SPECIAL" , "count" : 10 }];

for (let index = 0;index < forgeData.length;index++) {
  gameForgeData[forgeData[index].category] =  {"cart" : forgeData[index].count , "total" : forgeData[index].count}
}
$( document ).ready(function() {
    initGame();  
  });
  
*/


  

invoke('getStorage', { key: 'diyconfig' }).then((config: any) => {
    
  if(!config || Object.keys(config).length === 0)
  {
    alert('App Config Pending, Please check with your admin');
  }else
  {
    issueMainKey = config.issue;
    const rows = config.rows;

    const invokeArr = [];
    for (const element of rows) {

      if(element.type === 'jql')
      { 
        const invokePromise = invoke('jiraIssues' , { jql : element.ql}).then((returnedData: any) => {
            if (returnedData.status.status === 200) {
                
                const data  = JSON.parse(returnedData.data);
                return {"category" : element.category, "count" : (data && data.issues &&  data.issues.length ? data.issues.length : 1) * element.multiple };
            }
            return [];
        }); 
        invokeArr.push(invokePromise);
      } 
      else if(element.type === 'cql')
      { 
        const invokePromise = invoke('confluenceData' , { cql : element.ql}).then((returnedData: any) => {
           
            if (returnedData && returnedData.results &&  returnedData.results.length> 0) {  
                return {"category" : element.category, "count" : (returnedData && returnedData.results &&  returnedData.results.length ? returnedData.results.length : 1) * element.multiple };
            }
            return [];
        }); 
        invokeArr.push(invokePromise);
      }
      
    }

    Promise.all(invokeArr).then((values) => {
        forgeData  = values
        console.log({forgeData})
        for (let index = 0;index < forgeData.length;index++) {
            gameForgeData[forgeData[index].category] =  {"cart" : forgeData[index].count , "total" : forgeData[index].count}
        }
        initGame();  
    });

  }
  
});


const $game= $('#game');
const Engine = Matter.Engine,
Render = Matter.Render,
Runner = Matter.Runner,
MouseConstraint = Matter.MouseConstraint,
Mouse = Matter.Mouse,
Common = Matter.Common,
Composite = Matter.Composite,
Vertices = Matter.Vertices,
Bodies = Matter.Bodies,
Events = Matter.Events,
Svg = Matter.Svg;



const engine = Engine.create(),   
world = engine.world;
const BLOCKS_CATEGORY = { "BLOCK" : "BLOCK" , "BAR" : "BAR" , "SPECIAL" : "SPECIAL"};
const BLOCKS_TYPE = { "BLOCK" : [ "SQUARE" , "CIRCLE" , "TRAPEZOID" , "TRIANGLE" , "POLYGON" , "HEXAGON" , "HALFCIRCLE"] , "BAR" : [ "WALL3" , "WALL5" , "PLUS"  ] , "SPECIAL" : ["HEART" , "PUZZLE" , 'STAR', 'DOM']};
const COLORS_CODE = {"RED" : "#BE3455" ,"BLUE" : "#0F4C81","GREEN" : "#abbd81" ,"YELLOW" : "#f8b26a","BLACK" : "black","WHITE" : "white", "PERI" : "#6667AB" , "GRAY" : "#a7a5a6" , "CORAL" : "#ff6f61" , "VIOLATE" : "#604c8d"};
const COLORS = [COLORS_CODE.RED , COLORS_CODE.BLUE , COLORS_CODE.GREEN , COLORS_CODE.YELLOW, COLORS_CODE.PERI, COLORS_CODE.GRAY, COLORS_CODE.CORAL, COLORS_CODE.VIOLATE, COLORS_CODE.BLACK, COLORS_CODE.WHITE ];


function initGame() {
    console.log({"gameForgeData" : gameForgeData });
    $('#loader').remove();
    const render = renderGame();
    addInitBlocks();
    addMouseEvents(render);
    $game.show();
    $('.controls').removeClass('d-none');    
    addActionButtonEvents();
  }

function addActionButtonEvents(){
  $('#add').click(function(){

    let toolsHtml = ``;

    for (let key of Object.keys(BLOCKS_CATEGORY)) {
      let selectHtml = '';
      for (const [blockKey, blockValue] of Object.entries(BLOCKS_TYPE[key])) {
        selectHtml += `<option value="${blockValue}">${blockValue}</option>`;
      }
      const categoryData = gameForgeData[key];
      

      toolsHtml += `<div class="row" id="${key}">
                            <div class="col-6"> 
                                <div class="input-group mb-3">
                                    <span class="input-group-text">${key}</span>
                                    <select class="form-select type blockType">
                                        ${selectHtml}
                                      </select>
                                </div>                               
                          </div>
                          <div class="col-5"> 
                            <div class="input-group mb-3" >
                                <input type="number" class="form-control blockCount" ${(categoryData.cart) ?  "" : "disabled"} placeholder="How Many ?" min="0" max="${(categoryData.cart) ?  categoryData.cart : 0}">
                                <span class="input-group-text">Out Of &nbsp;<span class="spare">${(categoryData.cart) ?  categoryData.cart : 0}</span></span>
                              </div>
                        </div>
                      </div>
                      `;
                      
    }

    toolsHtml += `<div class="row">
              <a type="button" id="couponLink" aria-expanded="false" aria-controls="collapseExample">
                Coupons?
              </a>
              <div class="collapse" id="collapseExample">
              <div class="card card-body">
                  <div class="row mb-3">
                    <div class="col-3"> 
                        JIRA Key:
                    </div>
                    <div class="col-5"> 
                      <input type="text" class="form-control" id="issueKey"/>  
                    </div>
                    <div class="col-2"> 
                      <button type="button" class="btn btn-dark" id="validateCoupon">Validate</button>
                    </div>
                  </div>
                  <div class="row mb-3">
                    <div class="col-5"> 
                      Your Coupon Code : 
                      </div>
                      <div class="col-4" id="couponCode" style="background-color:#cfcfcf"> 
                          Loading
                      </div>
                  </div>
                  <div class="row mb-3">
                    <div class="col" id="couponMsg"> 
                      You can ask someone to comment this code in JIRA issue and validate jira key to get extra special tools <br />
                    </div>
                  </div>
              </div>
             </div>
            </div>
            <div class="modal-footer">
                  <button type="button" class="btn btn-secondary" data-bs-dismiss="modal" data-bs-target="#toolModal">Close</button>
                  <button type="submit" class="btn btn-primary" id="addToCanvas">Add to Canvas</button>
                </div>`;

    $('#toolsForm').html(toolsHtml);

    $('#toolModal #validateCoupon').click(function(){
        const issueKey = $('#issueKey').val();
    
        if(issueKey)
        {
            try {      
                invoke('getAllCommentsByIssueKey', { issueKey: issueKey }).then((commentsResponse: any) => {
                    if (commentsResponse.status.status !== 200 || !commentsResponse.data) {
                        $('#couponMsg').html('<span class="text-danger">Comment with Mentioned Copon Code not Found<span>').animate({'opacity': 1}, 400);
                    }
                    else
                    {
                        const data  = JSON.parse(commentsResponse.data);
                        const comments = data.comments;
                        const currentCouponcode = $('#couponCode').text();
                        console.log({isExist: isCouponCodeExist(comments, currentCouponcode)});
                        if(isCouponCodeExist(comments, currentCouponcode)){
                            let selectedTools = [];
                            selectedTools.push({"category"  : "SPECIAL","type" : "" , "count" : -1});
                            gameForgeData['SPECIAL']['cart'] = gameForgeData['SPECIAL']['cart'] + 1;
                            updateform(selectedTools);

                            $('#validateCoupon').html('Added').attr('disabled');
                            $('#couponMsg').html('<span class="text-success">Special Tool Added<span>').animate({'opacity': 1}, 400);

                            setTimeout(function(){ 
                                getCouponCode(true).then(function(couponCode) {
                                    $('#couponCode').text(couponCode);
                                    $('#validateCoupon').html('Validate').attr('disabled'); 
                                });                               
                            } , 2000);
                        }
                        else{
                            $('#couponMsg').html('<span class="text-danger">Comment with Mentioned Copon Code not Found<span>').animate({'opacity': 1}, 400);
                        }
                    }    
                });
            }
            catch (error) {
                   // TODO No comment found     
            }
        }

    });

    $('#toolModal #couponLink').click(function(){
        const collapseExample = $("#collapseExample");  
        new bootstrap.Collapse(collapseExample[0])    
        getCouponCode().then(function(couponCode) {
            $('#couponCode').text(couponCode);       
        });
    });    

    $('#toolModal #addToCanvas').click(function(){

      let selectedTools = [];

      let isValid = true;
      $('#toolsForm').find('.row').each((index, element) => {
        const blockCategory = $(element).attr('id');
        if(!blockCategory) {return;}
        const blockType = $(element).find('.blockType').val();
        const blockCountVal = $(element).find('.blockCount').val();
        const blockCount = blockCountVal ? parseInt(blockCountVal , 10) : 0;

        if(blockCount > gameForgeData[blockCategory]['cart'])
        {
          isValid = isValid && false;
        }

        if (blockCount !== 0) {
          selectedTools.push({"category"  : blockCategory,"type" : blockType , "count" : blockCount});
        }
      });

      if(isValid)
      {
        updateCart(selectedTools);
        updateform(selectedTools);
        addBlocksToCanvas(selectedTools);
      }
      else
      {
        selectedTools = [];
      }
    });

    $('#toolModal .btn-secondary').click(function(){
      $('#toolModal').hide();
    }); 

    $('#toolModal').modal({
      backdrop: 'static'
    }).show();
  });

  const upparWallBody = Bodies.rectangle(600, 0, 1200, 50, { isStatic: true , "changecolor" : false,  "toolType" : 'CEILINGWALL' ,render: {      fillStyle: 'black',           lineWidth: 1   } });
    
  Events.on(world, 'afterAdd', function(obj) {
    if(obj && obj.object && obj.object[0] && obj.object[0]['toolType'] === 'CEILINGWALL')
    {
      setTimeout(function(){
        if (navigator.share) {
          const $canvas = $('#game').find('canvas');        
          const canvasEle = $canvas[0];
          const title = 'My DIY';
          const text = `DIY Creation of ${currentDate}. Click on DIY app to try from your data.`;
          const image = canvasEle.toDataURL("image/png");

          const blob = convertBase64ToBlob(image);
          const file = new File([blob], 'image.png', { type: 'image/png' });
            
            navigator.share({  title: title,   text: text, files: [file] })
                .then(() => console.log('Successful shared'))
                .catch((error) => console.log('Error sharing', error));
          };

        //Composite.remove(world, [         upparWallBody       ]);
      } , 10);       
          
    }
  });

  $('#capture').click(function(){
    if (navigator.share) {
        Composite.add(world, [ upparWallBody   ]);    
    }
    else
    {
        alert('Browser Do not Support, Please try in latest browser');
    }
  });

  $('#info').click(function(){
    $('#infoModal').modal({      backdrop: 'static'    }).show();
  });

  $('#infoModal  .btnClose').click(function(){
    $('#infoModal').hide();
  });

 


  $('#toolModal .btn-close').click(function(){
    $('#toolModal').hide();
  });  
}

function updateform(selectedTools){
    for (let index = 0;index < selectedTools.length;index++) {
      $('#'+selectedTools[index].category).find('.blockCount').val('');
      $('#'+selectedTools[index].category).find('.blockCount').attr('max' , gameForgeData[selectedTools[index].category]['cart']);
      $('#'+selectedTools[index].category).find('.spare').text(gameForgeData[selectedTools[index].category]['cart']);
    }   
}

function updateCart(selectedTools){
  let selectedToolsByCategory ={};
    for (let index = 0;index < selectedTools.length;index++) {
      selectedToolsByCategory[selectedTools[index].category] =  selectedTools[index].count;
    }

  for (const category in selectedToolsByCategory) {
    if (Object.hasOwnProperty.call(selectedToolsByCategory, category)) {
      const spare = gameForgeData[category]['cart']  - selectedToolsByCategory[category];
      gameForgeData[category]['cart'] =  spare < 0 ? 0: spare;
      
    }
  }
}

function addBlocksToCanvas(selectedTools){
  let bodies = [];
  for (let index = 0;index < selectedTools.length;index++) {
    for (let bodyCountIndex = 0;bodyCountIndex < selectedTools[index]['count'];bodyCountIndex++) {
      bodies.push(getBody(selectedTools[index]['type'] ,60,60));
    }
  }

  if(bodies.length)
  {
      Composite.add(world, bodies);
  }

}

function  getBody(type,x,y){

  let body = '';
  switch (type) {
    case 'SQUARE':
      body = Bodies.rectangle(x, y, 30, 30, { frictionAir: 0.05 , "changecolor" : true , "lastColor" : 0 , enableStatic : true, deletable : true,  render: {   fillStyle: COLORS[0] , strokeStyle : 'black' , lineWidth : 1 } });
      break;
    case 'CIRCLE':
      body = Bodies.circle(x, y, 15, { frictionAir: 0.05,"changecolor" : true ,  "lastColor" : 0 , enableStatic : true , deletable : true,render: {  fillStyle: COLORS[0]  , strokeStyle : 'black' , lineWidth : 1 } });
      break;
    case 'TRAPEZOID':
      body = Bodies.trapezoid(x, y, 30, 30,0.5, { frictionAir: 0.05 , "changecolor" : true , "lastColor" : 0 , enableStatic : true, deletable : true,  render: {   fillStyle: COLORS[0] , strokeStyle : 'black' , lineWidth : 1 } });
      break;
    case 'TRIANGLE':
      body = Bodies.polygon(x, y, 3, 20, { frictionAir: 0.05 ,"changecolor" : true,  "lastColor" : 0 , enableStatic : true ,deletable : true,  render: {    fillStyle: COLORS[0], strokeStyle : 'black' , lineWidth : 1 } });
      break;
    case 'POLYGON':
      body = Bodies.polygon(x, y, 5, 20, { frictionAir: 0.05 ,"changecolor" : true,  "lastColor" : 0 , enableStatic : true ,deletable : true,  render: {    fillStyle: COLORS[0], strokeStyle : 'black' , lineWidth : 1 } });
      break;
    case 'HEXAGON':
      body = Bodies.polygon(x, y, 6, 20, { frictionAir: 0.05 ,"changecolor" : true,  "lastColor" : 0 , enableStatic : true , deletable : true, render: {    fillStyle: COLORS[0], strokeStyle : 'black' , lineWidth : 1 } });
      break;
    case 'WALL3':
      body = Bodies.rectangle(x, y, 30, 90, { frictionAir: 0.05 ,"changecolor" : true,  "lastColor" : 0 , enableStatic : true ,deletable : true,  render: {    fillStyle: COLORS[0], strokeStyle : 'black' , lineWidth : 1 } });
      break;
    case 'WALL5':
      body = Bodies.rectangle(x, y, 30, 150, { frictionAir: 0.05 ,"changecolor" : true,  "lastColor" : 0 , enableStatic : true , deletable : true, render: {    fillStyle: COLORS[0], strokeStyle : 'black' , lineWidth : 1 } });
      break;
    case 'STAR':
      loadSvg('assets/images/svgs/STAR.svg').then(function(root) {
        const vertexSets = select(root, 'path').map(function(path) { return Svg.pathToVertices(path, 30); });
        Composite.add(world, Bodies.fromVertices(x, y, vertexSets, { frictionAir: 0.05 ,"changecolor" : true,  "lastColor" : 0 , enableStatic : true ,deletable : true,  render: {    fillStyle: COLORS[0], strokeStyle : 'black'  } }));
     });
      break;
    case 'HEART':
      loadSvg('assets/images/svgs/HEART.svg').then(function(root) {
        const vertexSets = select(root, 'path').map(function(path) { return Svg.pathToVertices(path, 30); });
        Composite.add(world, Bodies.fromVertices(x, y, vertexSets, { frictionAir: 0.05 ,"changecolor" : true,  "lastColor" : 0 , enableStatic : true ,deletable : true, deletable : true, render: {    fillStyle: COLORS[0], strokeStyle : 'black' } }));
     });
      break;
    case 'PLUS':
      loadSvg('assets/images/svgs/PLUS.svg').then(function(root) {
        const vertexSets = select(root, 'path').map(function(path) { return Svg.pathToVertices(path, 30); });
        Composite.add(world, Bodies.fromVertices(x, y, vertexSets, { frictionAir: 0.05 ,"changecolor" : true,  "lastColor" : 0 , enableStatic : true ,deletable : true,  render: {    fillStyle: COLORS[0], strokeStyle : 'black'  } }));
      });      
    case 'PUZZLE':
      loadSvg('assets/images/svgs/PUZZLE.svg').then(function(root) {
        const vertexSets = select(root, 'path').map(function(path) { return Svg.pathToVertices(path, 30); });
        Composite.add(world, Bodies.fromVertices(x, y, vertexSets, { frictionAir: 0.05 ,"changecolor" : true,  "lastColor" : 0 , enableStatic : true ,deletable : true,  render: {    fillStyle: COLORS[0], strokeStyle : 'black'  } }));
      });
      break;
    case 'DOM':
      const domvertexSets =  [ [   
          {   "x": 116,  "y": 240 },
        {   "x": 195,  "y": 240 },
        { "x": 196, "y": 220 },
        { "x": 158,  "y":200 },
        { "x": 117, "y": 220 }
        ] ]; 
        body =  Bodies.fromVertices(x, y, domvertexSets, { frictionAir: 0.05 ,"changecolor" : true,  "lastColor" : 0 , enableStatic : true , deletable : true, render: {    fillStyle: COLORS[0], strokeStyle : 'black' , lineWidth : 1 } })
      break;
    case 'HALFCIRCLE':
      const hcertexSets =  [{"x":8.10198974609375,"y":27.8690185546875},{"x":9.243560791015625,"y":27.872772216796875},{"x":10.384597778320312,"y":27.87652587890625},{"x":11.525177001953125,"y":27.8802490234375},{"x":12.096054077148438,"y":27.88214111328125},{"x":13.807540893554688,"y":27.88775634765625},{"x":14.378280639648438,"y":27.889617919921875},{"x":15.519271850585938,"y":27.89337158203125},{"x":16.660263061523438,"y":27.897125244140625},{"x":17.230758666992188,"y":27.89898681640625},{"x":18.373703002929688,"y":27.902740478515625},{"x":19.51470947265625,"y":27.906494140625},{"x":20.656387329101562,"y":27.910247802734375},{"x":21.798538208007812,"y":27.913970947265625},{"x":22.369033813476562,"y":27.915863037109375},{"x":23.510025024414062,"y":27.91961669921875},{"x":24.652877807617188,"y":27.92333984375},{"x":25.793869018554688,"y":27.927093505859375},{"x":26.934860229492188,"y":27.93084716796875},{"x":28.075851440429688,"y":27.934600830078125},{"x":29.216842651367188,"y":27.938323974609375},{"x":29.787338256835938,"y":27.940216064453125},{"x":30.92950439453125,"y":27.9439697265625},{"x":32.07049560546875,"y":27.94769287109375},{"x":33.20198059082031,"y":27.951416015625},{"x":34.34297180175781,"y":27.955169677734375},{"x":34.91346740722656,"y":27.95703125},{"x":36.05445861816406,"y":27.960784912109375},{"x":37.19544982910156,"y":27.96453857421875},{"x":38.33717346191406,"y":27.968292236328125},{"x":38.909820556640625,"y":27.97015380859375},{"x":40.05194091796875,"y":27.973907470703125},{"x":41.196258544921875,"y":27.9776611328125},{"x":41.766754150390625,"y":27.979522705078125},{"x":42.907745361328125,"y":27.9832763671875},{"x":44.048736572265625,"y":27.987030029296875},{"x":45.189727783203125,"y":27.99078369140625},{"x":46.33073425292969,"y":27.9945068359375},{"x":47.47172546386719,"y":27.998260498046875},{"x":47.891693115234375,"y":27.396942138671875},{"x":47.69001770019531,"y":26.273895263671875},{"x":47.58917236328125,"y":25.712371826171875},{"x":47.38749694824219,"y":24.58935546875},{"x":47.185821533203125,"y":23.46630859375},{"x":46.98414611816406,"y":22.34326171875},{"x":46.78245544433594,"y":21.220245361328125},{"x":46.68162536621094,"y":20.658721923828125},{"x":46.27220153808594,"y":19.625152587890625},{"x":45.5947265625,"y":18.707061767578125},{"x":44.917236328125,"y":17.788970947265625},{"x":44.5784912109375,"y":17.329925537109375},{"x":43.907470703125,"y":16.42059326171875},{"x":43.229339599609375,"y":15.501617431640625},{"x":42.511749267578125,"y":14.6138916015625},{"x":42.1519775390625,"y":14.171142578125},{"x":41.43241882324219,"y":13.285614013671875},{"x":40.71287536621094,"y":12.400115966796875},{"x":39.827117919921875,"y":11.707794189453125},{"x":38.83622741699219,"y":11.14208984375},{"x":37.84535217285156,"y":10.57635498046875},{"x":37.34991455078125,"y":10.29351806640625},{"x":36.35902404785156,"y":9.727783203125},{"x":35.337005615234375,"y":9.24200439453125},{"x":34.22459411621094,"y":8.98822021484375},{"x":33.11216735839844,"y":8.734405517578125},{"x":32.55596923828125,"y":8.607513427734375},{"x":31.443557739257812,"y":8.353729248046875},{"x":30.331130981445312,"y":8.099945068359375},{"x":29.355438232421875,"y":8.03546142578125},{"x":28.142105102539062,"y":8.1153564453125},{"x":27.546066284179688,"y":8.154510498046875},{"x":26.313140869140625,"y":8.235260009765625},{"x":25.172256469726562,"y":8.30950927734375},{"x":23.92840576171875,"y":8.388397216796875},{"x":23.7039794921875,"y":8.4525146484375},{"x":22.555740356445312,"y":8.9813232421875},{"x":21.481430053710938,"y":9.4881591796875},{"x":20.37811279296875,"y":10.012359619140625},{"x":19.277801513671875,"y":10.537445068359375},{"x":18.391036987304688,"y":11.00341796875},{"x":17.902801513671875,"y":11.281890869140625},{"x":16.912521362304688,"y":11.8468017578125},{"x":15.923004150390625,"y":12.411224365234375},{"x":14.924240112304688,"y":12.98095703125},{"x":13.938644409179688,"y":13.54315185546875},{"x":13.011764526367188,"y":14.179840087890625},{"x":12.714401245117188,"y":14.660400390625},{"x":12.113632202148438,"y":15.63134765625},{"x":11.513626098632812,"y":16.601043701171875},{"x":10.913406372070312,"y":17.57110595703125},{"x":10.613571166992188,"y":18.055694580078125},{"x":10.0133056640625,"y":19.02581787109375},{"x":9.542648315429688,"y":20.048370361328125},{"x":9.289382934570312,"y":21.1607666015625},{"x":9.162368774414062,"y":21.7186279296875},{"x":8.909515380859375,"y":22.8292236328125},{"x":8.656204223632812,"y":23.94183349609375},{"x":8.403091430664062,"y":25.0535888671875},{"x":8.149749755859375,"y":26.166290283203125},{"x":8.045562744140625,"y":27.2908935546875},{"x":8.101211547851562,"y":27.86102294921875}];
      body =  Bodies.fromVertices(x, y, hcertexSets, { frictionAir: 0.05 ,"changecolor" : true,  "lastColor" : 0 , enableStatic : true , deletable : true, render: {    fillStyle: COLORS[0], strokeStyle : 'black' , lineWidth : 1 } })
      break;
    default:
      break;
  }
  return body;
}

function renderGame(){
    const render = Render.create({
      element: $game[0],
      engine: engine,
      options: {
          width: 600,
          height: 500,
    background: '#DEDEDE',
    wireframes:false
      }
  });

    Render.run(render);

    // create runner
    const runner = Runner.create();
    Runner.run(runner, engine);

    Render.lookAt(render, {
      min: { x: 0, y: 0 },
      max: { x: 600, y: 500 }
  });

  return render;
}

function addMouseEvents(render){
  const mouse = Mouse.create(render.canvas),
  mouseConstraint = MouseConstraint.create(engine, {
      mouse: mouse,
      constraint: {
          stiffness: 0.9,
          render: {
              visible: false
          }
      }
  });

  Composite.add(world, mouseConstraint);

  // keep the mouse in sync with rendering
  render.mouse = mouse;
  Matter.Events.on(mouseConstraint, "mousedown", () => {
    if (mouseConstraint.body) {
      console.log(mouseConstraint.body);
      // If double Clicked
      if(mouseConstraint.body.enableStatic && mouseConstraint.body.lastClick && new Date().getTime() - mouseConstraint.body.lastClick  < 300)
      {
        Matter.Body.setStatic(mouseConstraint.body, !mouseConstraint.body.isStatic);
      }

      mouseConstraint.body.lastClick = new Date().getTime()
    }	
  });


  Events.on(engine, 'collisionStart', (event) => {
      var pairs = event.pairs.slice(); // copy
      if(pairs)
      {

        // Color change
        const coloredCollision  = pairs.filter(function (obj) {     
              if((obj.bodyA && obj.bodyA.label == 'color') || (  obj.bodyB && obj.bodyB.label   == 'color') ) { return obj; }  
        });

        if(coloredCollision && coloredCollision.length)     
        {
          const colliedObj = coloredCollision[0].bodyA.label != 'color' ? coloredCollision[0].bodyA : coloredCollision[0].bodyB;
      
          if(colliedObj.changecolor)
          {
            let nextColorIndex =  colliedObj.lastColor !== undefined ?  colliedObj.lastColor + 1 : 0;
            if(nextColorIndex >= COLORS.length)
            { 
              // rotate
              nextColorIndex = 0;
            }
            colliedObj.render.fillStyle = COLORS[nextColorIndex];
            colliedObj.lastColor = nextColorIndex;
          }
        }

        // Delete change
        const deletedCollision  = pairs.filter(function (obj) { 
          if((obj.bodyA && obj.bodyA.label == 'delete') || (  obj.bodyB && obj.bodyB.label   == 'delete') ) { return obj; }  
        });
        //console.log({deletedCollision});

        if(deletedCollision && deletedCollision.length)     
        {
          
          const colliedObj = deletedCollision[0].bodyA.label != 'delete' ? deletedCollision[0].bodyA : deletedCollision[0].bodyB;
          console.log({colliedObj});;
      
          if(colliedObj.deletable)
          {
            Composite.remove(world, [         colliedObj       ]);
          }
        }


      }
  });



}

function addInitBlocks(){
  
  Composite.add(world, [
   
    Bodies.rectangle(550, 100, 30, 30,{  label:'color', frictionAir: 0.05 , isStatic:true, render: { sprite:{'texture' : 'assets/images/colorpicker.svg'},  fillStyle:'black' , strokeStyle : 'black' , lineWidth : 1 } }),
    Bodies.rectangle(550, 170, 20, 30, {  label:'delete', frictionAir: 0.05 , isStatic:true, render: { sprite:{'texture' : 'assets/images/delete.svg'},  fillStyle: 'black' , strokeStyle : 'black'  } }),

    Bodies.rectangle(200, 100, 30, 30, {  frictionAir: 0.05 , "changecolor" : true , "lastColor" : 0 , enableStatic : true, deletable : true,  render: {   fillStyle: COLORS[0] , strokeStyle : 'black' , lineWidth : 1 } }),
    Bodies.circle(400, 100, 15, {  frictionAir: 0.05,"changecolor" : true ,  "lastColor" : 0 , enableStatic : true , deletable : true, render: {  fillStyle: COLORS[0] , strokeStyle : 'black' , lineWidth : 1  } }),
    Bodies.polygon(500, 100, 5, 20, { frictionAir: 0.05 ,"changecolor" : true,  "lastColor" : 0 , enableStatic : true , deletable : true,  render: {    fillStyle: COLORS[0], strokeStyle : 'black' , lineWidth : 1 } }),
    Bodies.polygon(100, 100, 3, 20, { frictionAir: 0.05 ,"changecolor" : true,  "lastColor" : 0 , enableStatic : true ,deletable : true,  render: {    fillStyle: COLORS[0], strokeStyle : 'black' , lineWidth : 1 } }),

    // Walls
    Bodies.rectangle(600, 0, 1200, 50, { isStatic: true , "changecolor" : false,  render: {      fillStyle: 'black',           lineWidth: 1   } }),
    Bodies.rectangle(300, 500, 600, 50, { isStatic: true , "changecolor" : false,  render: {      fillStyle: 'black',           lineWidth: 1   } }),
    Bodies.rectangle(600, 300, 50, 600, { isStatic: true , "changecolor" : false,  render: {      fillStyle: 'black',           lineWidth: 1  } }),
    Bodies.rectangle(0, 300, 50, 600, { isStatic: true , "changecolor" : false,  render: {      fillStyle: 'black',           lineWidth: 1    } })
]);


}

var select = function(root, selector) {
  return Array.prototype.slice.call(root.querySelectorAll(selector));
};

var loadSvg = function(url) {
  return fetch(url)
      .then(function(response) { return response.text(); })
      .then(function(raw) { return (new window.DOMParser()).parseFromString(raw, 'image/svg+xml'); });
};

async function getCouponCode(isNew = false){
    const storeCouponCode = await invoke('getStorage', { key: 'couponCode' });
    if(!$.isEmptyObject(storeCouponCode) && isNew === false)
    {
        return storeCouponCode;
    }
    else
    {
        const newCouponCode = generateCouponCode();
        await invoke('setStorage', { key: 'couponCode' , value:newCouponCode });
        return newCouponCode;
    }
}


function generateCouponCode(){
  let  codeLength = 5;
  const textArray = ["🔴", "🔵" ,"⚫" ,"⚪","🔶","🔷","🔺","🔻","❤️","🧡","💛","💚","💙","🟥","🟧","🟦","🟩","💠","🟧", "⭐"];
  let couponCode = "";
  do {
   const randomIndex = Math.floor(Math.random() * textArray.length); 
   const randomElement = textArray[randomIndex];
   couponCode += randomElement;
   codeLength--;
  } while (codeLength > 0);
  return couponCode;  
}

function isCouponCodeExist(comments, couponCode){

    let isExist = false;
    for (const commentMeta of comments) {
       const contents = commentMeta.body && commentMeta.body.content ?  commentMeta.body.content  : '';
       if(contents)
       {
            for (const content of contents) {
                for (const fragment of content.content) {
                    if(fragment && fragment.text && fragment.text.indexOf(couponCode) >= 0)
                    {
                        isExist = true;
                        break;
                    }
            }
        }
        }
       if(isExist)
       {
        break;
       }
    }
    return isExist;
}

function convertBase64ToBlob(base64Image: string) {
  // Split into two parts
  const parts = base64Image.split(';base64,');

  // Hold the content type
  const imageType = parts[0].split(':')[1];

  // Decode Base64 string
  const decodedData = window.atob(parts[1]);

  // Create UNIT8ARRAY of size same as row data length
  const uInt8Array = new Uint8Array(decodedData.length);

  // Insert all character code into uInt8Array
  for (let i = 0; i < decodedData.length; ++i) {
    uInt8Array[i] = decodedData.charCodeAt(i);
  }

  // Return BLOB image after conversion
  return new Blob([uInt8Array], { type: imageType });
}


