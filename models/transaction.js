const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const transactionSchema = new Schema({
  name: {
    type: String,
    trim: true,
    required: "Enter a name",
  },
  timein: {
    type: Number,
    required: "Enter a time in",
  },
  timeout: {
    type: Number,
    required: "Enter a time out",
  },
  value: {
    type: Number,
    required: "Enter an amount",
  },
  date: {
    type: Date,
    default: Date.now,
  },
});

const Transaction = mongoose.model("Transaction", transactionSchema);

module.exports = Transaction;
