// src/utils/musicHubContract.js
export const MusicHubMethods = {
  JoinAsCustomer: "JoinAsCustomer",
  LeaveAsCustomer: "LeaveAsCustomer",
  JoinAsAdmin: "JoinAsAdmin",
  LeaveAsAdmin: "LeaveAsAdmin",
};

export const MusicHubEvents = {
  TrackRequested: "RequestCreated",
  TrackApproved: "RequestApproved",
  TrackRejected: "RequestRejected",
  PlaylistChanged: "PlaylistChanged",
  PlaybackChanged: "PlaybackChanged",
};
