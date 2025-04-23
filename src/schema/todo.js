const Mongoose = require("mongoose");

const todoSchema = new Mongoose.Schema({
    id: {type: Object},
    isUser: {type: String, require: true},
    title: {type: String, require: true},
    completed: {type: Boolean, require: true},
});

module.exports = Mongoose.model("Todo", todoSchema);