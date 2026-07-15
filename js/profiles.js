document.addEventListener("DOMContentLoaded", function () {
    const profileCards = document.querySelectorAll(
        ".profile-card[data-profile]"
    );

    const profileMessage =
        document.getElementById("profileMessage");

    profileCards.forEach(function (card) {
        card.addEventListener("click", function () {
            const name = card.dataset.profile;
            const isKids = card.dataset.kids === "true";

            const activeProfile = {
                name: name,
                isKids: isKids,
                selectedAt: new Date().toISOString()
            };

            localStorage.setItem(
                "novaPlusActiveProfile",
                JSON.stringify(activeProfile)
            );

            if (profileMessage) {
                profileMessage.textContent =
                    "Welcome, " +
                    name +
                    ". Loading Nova+...";
            }

            setTimeout(function () {
                window.location.href =
                    "../entertainment/streaming.html";
            }, 500);
        });
    });
});