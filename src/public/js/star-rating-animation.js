document.addEventListener("DOMContentLoaded", function() {
  const stars = document.querySelectorAll(".star-rating i");
  const ratingText = document.getElementById("rating-text");
  let currentRating = 0;

  stars.forEach(star => {
    
    star.addEventListener("mouseenter", () => {
      const value = parseInt(star.getAttribute("data-value"));
      highlightStars(value);
    });

    
    star.addEventListener("mouseleave", () => {
      highlightStars(currentRating);
    });

    
    star.addEventListener("click", () => {
      currentRating = parseInt(star.getAttribute("data-value"));
      highlightStars(currentRating);
      ratingText.textContent = `You rated this course ${currentRating}⭐`;
    });
  });

  
  function highlightStars(count) {
    stars.forEach((s, index) => {
      if (index < count) {
        s.classList.remove("bi-star");
        s.classList.add("bi-star-fill", "text-warning");
      } else {
        s.classList.add("bi-star");
        s.classList.remove("bi-star-fill", "text-warning");
      }
    });
  }
});
