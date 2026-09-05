import ownerCommentsAxios from "./ownerCommentsAxios";

export const getOwnerComments = (status = "pending") =>
    ownerCommentsAxios.get("", { params: { status } }).then((r) => r.data);

export const approveComment = (commentId, replyText = null) =>
    ownerCommentsAxios.post("/approve", { commentId, replyText }).then((r) => r.data);

export const rejectComment = (commentId, reason) =>
    ownerCommentsAxios.post("/reject", { commentId, reason }).then((r) => r.data);