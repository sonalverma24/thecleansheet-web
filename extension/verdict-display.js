/* What the popup shows next to the standing.

   The total out of 100 is shown only while the standing is derived from it. When the verdict carries the
   four pillar results (the pillar standing), the total no longer decides the standing, so showing it would
   contradict the label (a "Good Standing" next to a low number), and it is left out. Without `pillars`, exactly
   as before. Plain script so the popup can load it and tests can require it. */
(function (root, factory) {
  if (typeof module === "object" && module.exports) module.exports = factory();
  else root.TCSVerdictDisplay = factory();
})(typeof self !== "undefined" ? self : this, function () {
  function showTotal(review, verdict) {
    var total = review && review.scores && review.scores.total;
    return typeof total === "number" && !(verdict && Array.isArray(verdict.pillars));
  }
  return { showTotal: showTotal };
});
