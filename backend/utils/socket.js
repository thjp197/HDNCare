let ioInstance = null;

const getStylistRoom = (styId) => `stylist:${styId}`;

const setSocketServer = (io) => {
  ioInstance = io;
};

const emitStylistSlotsUpdated = (styId, payload = {}) => {
  if (!ioInstance || !styId) return;

  ioInstance.to(getStylistRoom(styId)).emit("stylist-slots-updated", {
    styId: String(styId),
    serverTime: Date.now(),
    ...payload,
  });
};

const emitUserAppointmentsUpdated = (userId, payload = {}) => {
  if (!ioInstance || !userId) return;

  ioInstance.emit("user-appointments-updated", {
    userId: String(userId),
    serverTime: Date.now(),
    ...payload,
  });
};

export { setSocketServer, emitStylistSlotsUpdated, emitUserAppointmentsUpdated, getStylistRoom };
