/**
 * Rewrite settings to be exported from the design doc
 */


module.exports = [

    //{from: "/diebruecke/*", to: "../../*" },
    
    //{from: "*", to: "../../*" },
    
    //{from: '/getById/json/:id/*',  to: '../../:id/*' }, 
    
    //http://localhost:5984/diebruecke/_design/b2/_rewrite/start
    //http://localhost:5984/diebruecke/_design/b2/_list/list_Personen/personen/#login
    {from: '/start',  to: '_list/list_Personen/personen'},
    
    {from: '/episode',  to: '_list/list_currentepisode/settings/'},
    
    //http://localhost:5984/diebruecke/_design/b2/_list/getDatajsonVote/personen/
    {from: '/stimmen.json',  to: '_list/getDatajsonVote/personen/'},


    //http://localhost:5984/diebruecke/_design/b2/_rewrite/getPersonMedia/json/alexander
    //http://localhost:5984/diebruecke/_design/b2/_view/media?startkey=["media","alexander",0,0]&endkey=["media","alexander",{},{}]
    {from: '/getPersonMedia/json/:id',  to: '_view/media/', query: { startkey: ["media",":id",0,0], endkey: ["media",":id",{},{}] }}, 


    //http://localhost:5984/diebruecke/_design/b2/_rewrite/edit/alexander
    //http://localhost:5984/diebruecke/_design/b2/_show/detail_view_edit/alexander
    {from: '/edit/:id',  to: '_show/detail_view_edit/:id'}, 
    

    



    {from: '/index.html', to: 'index.html'},
    {from: '/vote.html', to: 'vote.html'},
    {from: '/styles/*', to: 'styles/*'},
    {from: '/js/*', to: 'js/*'},
    {from: '/img/*', to: 'img/*'},
    {from: "/*", to: "../../*" },
    //{from: "/*", to: "../*" },
    {from: '/', to: 'index.html'}

    // list:
    // http://localhost:5984/epgservice/_design/epgservice/_list/getNow_list/getAllWithTimeStamp?accept=xml&startkey=["ZDF",-24]&endkey=["ZDF",24]      
    // http://localhost:5984/epgservice/_design/epgservice/_list/getToday_list/getAllWithTimeStamp?accept=xml&startkey=["ZDF",-24]&endkey=["ZDF",24]

    // show:
    // http://localhost:5984/epgservice/_design/epgservice/_show/getByID/dbc2a00ab9ef7d59b252a8c166a17c19?accept=json


                               //_list/getNowByStation_list/getNowByStation_view?descending=false&station=zdf
    
    // {from: '/zdf/now', 		to: '_list/getNowByStation_list/getNowByStation_view', method: 'get', query: { descending: 'false', station: 'zdf'}},
    /*
    {from: '/zdfneo/now',   to: '_list/getNowByStation/getNowByStation?descending=false&station=zdfneo'},
    {from: '/zdfinfo/now',  to: '_list/getNowByStation/getNowByStation?descending=false&station=zdfinfo'},
    {from: '/zdfkultur/now',to: '_list/getNowByStation/getNowByStation?descending=false&station=zdf.kultur'},
    */


    // {from: '/static/*', to: 'static/*'},
    // {from: '/static/*', to: 'static/*'},
    // {from: '/static/*', to: 'static/*'},
    // {from: '/getnow', to: '_show/getnow'},
    // {from: '/', to: '_list/homepage'},
    // {from: '*', to: '_show/not_found'}
];