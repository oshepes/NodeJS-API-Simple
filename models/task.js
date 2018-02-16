/**
 * @author Oren Shepes <oshepes@gmail.com>
 * @since 2/13/18
 */

var mongoose = require('mongoose');

var taskSchema = mongoose.Schema({
    project: {
        type: String
    },
    name: {
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
    description: {
        type: String
    },
    priority: {
        type: Number
    }
}, {collection: "tasks"});

module.exports = mongoose.model('Task', taskSchema);
