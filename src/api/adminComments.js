import adminCommentsAxios from "./adminCommentsAxios";

export const getAdminComments = (status = "pending") =>
    adminCommentsAxios.get("", { params: { status } }).then((r) => r.data);

export const approveComment = (commentId, replyText = null) =>
    adminCommentsAxios.post("/approve", { commentId, replyText }).then((r) => r.data);

export const rejectComment = (commentId, reason) =>
    adminCommentsAxios.post("/reject", { commentId, reason }).then((r) => r.data);