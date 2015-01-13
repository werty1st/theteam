var handlebars = require('handlebars');
var baseurl = "/diebruecke";



//http://localhost:5984/diebruecke/_design/b2/_list/list_currentepisode/settings/
exports.list_currentepisode = function (head, req) {
    var header = {};
    
    header['Content-Type'] = 'application/json; charset=utf-8';
    start({code: 200, headers: header});

    var settings = getRow().value;

    var end1 = new Date(settings.end1);
    var end2 = new Date(settings.end2);
    var end3 = new Date(settings.end3);
    var end4 = new Date(settings.end4);
    var end5 = new Date(settings.end5);
    
    var ser = new Date();
        ser = ser.setDate(ser.getDate()+0)

    if (ser >= end5){
        send("5");
    } else if (ser >= end4){
        send("4");
    } else if (ser >= end3){
        send("3");
    } else if (ser >= end2){
        send("2");
    } else if (ser >= end1){
        send("1");
    } else {
        send("0");
    }    

}


//startseite backend
//http://localhost:5984/diebruecke/_design/b2/_list/list_Personen/personen/
exports.list_Personen = function (head, req) {
    var header = {};
    var items = [];
	
    header['Content-Type'] = 'text/html; charset=utf-8';
    start({code: 200, headers: header});

    var list = "empty";
    while(row = getRow()){
    	items.push(row.value);
    }
    list = handlebars.templates['list_item.html']({items: items, baseurl: baseurl});


    var context = {title: "Die Brücke 2 Backend Editor", knusper: list}
    html = handlebars.templates['base.html'](context);

    send(html); 
    //send(JSON.stringify(context));
    //send(list);
}

//personen ohne medien als json nur mit slug und voteId und stimmen
//http://localhost:5984/diebruecke/_design/b2/_list/getDatajsonVote/personen/
exports.getDatajsonVote = function (head, req) {
    var header = {};
    var items = {};
    
    header['Content-Type'] = 'application/json; charset=utf-8';
    start({code: 200, headers: header});


    while(row = getRow()){
        if (row.value.type == "person"){
            var slug = row.value.slug;
            delete row.value.text;
            delete row.value.longText;
            delete row.value.image;
            delete row.value.relations
            delete row.value.freischaltepisode
            delete row.value.entfernennachepisode
            row.value.stimmen = (row.value.stimmen=="")?0:parseInt(row.value.stimmen);

            items[slug] = row.value;
        }
    }

    send(JSON.stringify(items)); 

}


//personen ohne medien als json
//http://localhost:5984/diebruecke/_design/b2/_list/getDatajsonPerson/personen/
exports.getDatajsonPerson = function (head, req) {
    var header = {};
    var items = {};
    
    header['Content-Type'] = 'application/json; charset=utf-8';
    start({code: 200, headers: header});


    while(row = getRow()){
        if (row.value.type == "person"){
            var slug = row.value.slug;

            items[slug] = row.value;
        }
    }

    send(JSON.stringify(items)); 

}

//personen inkl ihrer medien
//http://localhost:5984/diebruecke/_design/b2/_list/getDatajsonPersonwithMedia/personwithmedia/
exports.getDatajsonPersonwithMedia = function (head, req) {
    var header = {};
    var personen = {};
    var media = {};
    var knusper = [];
    
    header['Content-Type'] = 'application/json; charset=utf-8';
    start({code: 200, headers: header});


    while(row = getRow()){       
        if (row.value.type == "person"){
            var p = row.value;
            personen[p.slug] = p;
        }

        if (row.value.type == "video" || row.value.type == "image"){
            var m = row.value;

            if (!media[m.ownerslug]) media[m.ownerslug]=[];
            media[m.ownerslug].push(m);
        }
        knusper.push(row);
    }

    for(var person in personen) {
        personen[person].media = media[person];
    }
    send(JSON.stringify(personen));
}


//media pro person
//http://localhost:5984/diebruecke/_design/b2/_list/getDatajsonMedia/media/
exports.getDatajsonMedia = function (head, req) {
    var header = {};
    var items = {};
    
    header['Content-Type'] = 'application/json; charset=utf-8';
    start({code: 200, headers: header});


    while(row = getRow()){
        if (row.value.type == "video" || row.value.type == "image"){
            var slug = row.value.ownerslug;

            if (items[slug] == undefined) items[slug] =  [];
            items[slug].push(row.value);
        }
    }

    send(JSON.stringify(items)); 

}