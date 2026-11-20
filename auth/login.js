
(function () {
    "use strict";

    var loginForm = document.getElementById("loginForm");
    var usernameInput = document.getElementById("username");
    var roleSelect = document.getElementById("role");
    var errorMessage = document.getElementById("errorMessage");

    var PROFILE_KEY = "sams_athlete_profile_v1";
    var USER_KEY = "sams_logged_in_user_v1";

    loginForm.addEventListener("submit", function (event) {
        event.preventDefault();

        var username = usernameInput.value.trim();
        var role = roleSelect.value;

        errorMessage.textContent = "";
        errorMessage.classList.remove("visible");

        if (!username) {
            showError("Please enter your username.");
            usernameInput.focus();
            return;
        }

        if (!role) {
            showError("Please select your role.");
            roleSelect.focus();
            return;
        }

        var user = {
            username: username,
            role: role
        };

        try {
            // Store the current demonstration login.
            sessionStorage.setItem(USER_KEY, JSON.stringify(user));

            // Keep the athlete's profile name aligned with the login username.
            if (role === "athlete") {
                var existingProfile = {};

                try {
                    existingProfile = JSON.parse(
                        localStorage.getItem(PROFILE_KEY) || "{}"
                    ) || {};
                } catch (error) {
                    existingProfile = {};
                }

                existingProfile.name = username;

                localStorage.setItem(
                    PROFILE_KEY,
                    JSON.stringify(existingProfile)
                );

                window.location.href = "../athlete/dashboard.html";
            } else if (role === "admin") {
                window.location.href = "../admin/dashboard.html";
            }
        } catch (error) {
            showError(
                "Unable to save your session in this browser. Please enable browser storage and try again."
            );
        }
    });

    function showError(message) {
        errorMessage.textContent = message;
        errorMessage.classList.add("visible");
    }
})();
