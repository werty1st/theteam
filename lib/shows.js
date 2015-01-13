var handlebars = require('handlebars');
// var baseurl = "http://localhost:5984/diebruecke/_design/b2/";
var baseurl = "/diebruecke";
var imgbaseurl = baseurl +"/"+ "_design/b2/img/faces";
var mediabaseurl = baseurl +"/"+ "_design/b2";

handlebars.registerHelper('select', function(selected, options) {
    return options.fn(this).replace(
        new RegExp(' value=\"' + selected + '\"'),
        '$& selected="selected"');
});

handlebars.registerHelper('list', function(items, options) {
  var out = "<ul>";

  if (!items) return;
  for(var i=0, l=items.length; i<l; i++) {
    out = out + "<li>" + options.fn(items[i]) + "</li>";
  }

  return out + "</ul>";
});

exports.not_found = function (doc, req) {
    return {
        title: '404 - Not Found',
        content: templates.render('404.html', req, {})
    };
};

// exports.my_form = function (doc, req) {
//     var myForm = new Form (person);
//     return {
//       title : 'My First Form',
//       content: templates.render('form.html', req, {
//             form_title : 'My Form',
//             method : 'POST',
//             action : '../_update/update_my_form',
//             form : myForm.toHTML(req),
//             button: 'Validate'})
//     }
// };

exports.program_view_edit = function (doc, req) {

    var context = { doc: doc,
                    imgbaseurl: imgbaseurl,
                    baseurl: baseurl
                };


    //endzeit der folgen
    //ep1=20.03.2014 22:10
    //ep2=20.03.2014 22:10
    //ep3=27.03.2014 22:05 usw


    var user_details = handlebars.templates['details_item_edit.html'](context);

    var context = {title: "Die Brücke 2 Backend Editor", content: user_details}
    //var html    = templates.render('base.html', req, context);
    html = handlebars.templates['base.html'](context);

    return {
        body : html,
        headers : {
            "Content-Type" : "text/html; charset=utf-8"
            }
    } 
};

exports.detail_view_edit = function (doc, req) {

    var context = { doc: doc,
                    imgbaseurl: imgbaseurl,
                    mediabaseurl: mediabaseurl,
                    baseurl: baseurl
                };

    var user_details = handlebars.templates['details_item_edit.html'](context);

    var context = {title: "Die Brücke 2 Backend Editor", content: user_details}
    //var html    = templates.render('base.html', req, context);
    html = handlebars.templates['base.html'](context);

    return {
        body : html,
        headers : {
            "Content-Type" : "text/html; charset=utf-8"
            }
    } 
};

