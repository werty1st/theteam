/**
 * Rewrite settings to be exported from the design doc
 */


module.exports = [


    {from: '/start',  to: '_list/list_Personen/personen'},
    {from: '/episode',  to: '_list/list_currentepisode/settings/'},
    {from: '/stimmen.json',  to: '_list/getDatajsonVote/personen/'},
    {from: '/getPersonMedia/json/:id',  to: '_view/media/', query: { startkey: ["media",":id",0,0], endkey: ["media",":id",{},{}] }}, 
    {from: '/edit/:id',  to: '_show/detail_view_edit/:id'},
    {from: '/index.html', to: 'index.html'},
    {from: '/vote.html', to: 'vote.html'},
    {from: '/styles/*', to: 'styles/*'},
    {from: '/js/*', to: 'js/*'},
    {from: '/img/*', to: 'img/*'},
    {from: "/*", to: "../../*" },
    {from: '/', to: 'index.html'}

   
];