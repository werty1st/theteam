/*
 * Values exported from this module will automatically be used to generate
 * the design doc pushed to CouchDB.
 */





module.exports = {
    updates: require('./updates'),
    shows: require('./shows'),
    views: require('./views'),
    lists: require('./lists'),
    rewrites: require('./rewrites'),
    validate_doc_update: require('./validate'),
	//http://localhost:5984/diebruecke/_design/b2/_view/byType

};





/*
// updates: require('./updates'),
// filters: require('./filters'),
// validate_doc_update: require('./validate')
//types: require('./types'),
// bind event handlers
// require('./events');*/