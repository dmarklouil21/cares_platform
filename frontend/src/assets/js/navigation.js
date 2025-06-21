// src/assets/js/navigation.js

export function dropdownFunction() {
  const dropdownButton = document.getElementById("dropdownButton");
  const dropdownMenu = document.getElementById("dropdownMenu");
  const dropdownArrow = document.getElementById("dropdownArrow");

  if (!dropdownButton || !dropdownMenu || !dropdownArrow) return;

  dropdownButton.addEventListener("click", function (e) {
    e.stopPropagation();
    const isOpen = !dropdownMenu.classList.contains("hidden");

    if (!isOpen) {
      dropdownMenu.classList.remove("hidden");
      dropdownArrow.classList.add("rotate-180");
    } else {
      dropdownMenu.classList.add("hidden");
      dropdownArrow.classList.remove("rotate-180");
    }
  });

  document.addEventListener("click", function (e) {
    if (
      !dropdownMenu.contains(e.target) &&
      !dropdownButton.contains(e.target)
    ) {
      dropdownMenu.classList.add("hidden");
      dropdownArrow.classList.remove("rotate-180");
    }
  });
}
