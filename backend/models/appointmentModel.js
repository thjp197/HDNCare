import mongoose from "mongoose";

const appointmentSchema = new mongoose.Schema({
    userId: {type: String, required: true},
    styId: {type: String, required: true},
    slotDate: {type: String, required: true},
    slotTime: {type: String, required: true},
    userData: {type: Object, required: true},
    styData: {type: Object, required: true},
    amount: {type: Number, required: true},
    date: {type: Number, required: true},
    selectedStyleImage: {type: String, default: null},
    cancelled: {type: Boolean, default: false},
    cancellationReasons: {type: Array, default: []},
    cancellationDetails: {type: String, default: ""},
    payment: {type: Boolean, required: false},
    paymentTransactionId: {type: String, default: null},
    paymentMethod: {type: String, default: null},
    isCompleted: {type: Boolean, default: false}
})

const appointmentModel = mongoose.models.appointment || mongoose.model("appointment", appointmentSchema);
export default appointmentModel;