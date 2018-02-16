/**
 * @author Oren Shepes <oshepes@gmail.com>
 * @since 2/13/18
 */

var mongoose = require('mongoose');

var projectSchema = mongoose.Schema({
    title: {
        type: String,
        unique: true
    },
    status: {
        type: Number, 
        default: 1    
    },
    created: { 
        type: Date, 
        default: Date.now 
    },
}, {collection: "projects"});

module.exports = mongoose.model('Project', projectSchema);
