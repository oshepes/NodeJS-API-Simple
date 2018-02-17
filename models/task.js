/**
 * @author Oren Shepes <oshepes@gmail.com>
 * @since 2/13/18
 */

var mongoose = require('mongoose');

var taskSchema = mongoose.Schema({
    userid: {
        type: String
    },
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
    summary: {
        type: String
    },
    description: {
        type: String
    },
    priority: {
        type: Number
    },
    due_date: {
        type: String
    }
}, {collection: "tasks"});

module.exports = mongoose.model('Task', taskSchema);
