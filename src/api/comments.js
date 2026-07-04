import commentAxios from "./commentAxios";

export const getFoodComments = (foodId) =>
    commentAxios.get(`/food/${foodId}`).then((r) => r.data);

export const createComment = ({ foodId, rating, text }) =>
    commentAxios.post("", { foodId, rating, text }).then((r) => r.data);

export const toggleCommentLike = ({ commentId, target = "comment" }) =>
    commentAxios.post("/like", { commentId, target }).then((r) => r.data);