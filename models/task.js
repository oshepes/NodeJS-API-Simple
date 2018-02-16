/**
 * @author Oren Shepes <oshepes@gmail.com>
 * @since 2/13/18
 */

var mongoose = require('mongoose');

var taskSchema = mongoose.Schema({
    id: {
        type: Number, 
        unique: true
    },
    project: {
        type: Number,
        require: true;
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
}, {collection: "tasks"});

module.exports = mongoose.model('Task', taskSchema);
