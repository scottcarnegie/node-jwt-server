const mongoose = require('mongoose');

const { Schema, SchemaTypes } = mongoose;

const userSchema = new Schema({
  email: {
    type: SchemaTypes.String,
    unique: true,
    required: true,
  },
  password: SchemaTypes.String,
  status: SchemaTypes.Boolean,
}, {
  timestamps: true,
});

const User = mongoose.model('User', userSchema);

module.exports = User;
