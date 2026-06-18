document.addEventListener("DOMContentLoaded", () => {
  const activitiesList = document.getElementById("activities-list");
  const activitySelect = document.getElementById("activity");
  const signupForm = document.getElementById("signup-form");
  const messageDiv = document.getElementById("message");

  async function unregisterParticipant(activityName, email) {
    try {
      const response = await fetch(
        `/activities/${encodeURIComponent(activityName)}/signup?email=${encodeURIComponent(email)}`,
        {
          method: "DELETE",
        }
      );

      const result = await response.json();

      if (response.ok) {
        messageDiv.textContent = result.message;
        messageDiv.className = "message success";
        await fetchActivities();
      } else {
        messageDiv.textContent = result.detail || "Failed to unregister participant.";
        messageDiv.className = "message error";
      }

      messageDiv.classList.remove("hidden");
      setTimeout(() => {
        messageDiv.classList.add("hidden");
      }, 5000);
    } catch (error) {
      messageDiv.textContent = "Failed to unregister participant. Please try again.";
      messageDiv.className = "message error";
      messageDiv.classList.remove("hidden");
      console.error("Error unregistering participant:", error);
    }
  }

  function createActivityCard(name, details) {
    const activityCard = document.createElement("div");
    activityCard.className = "activity-card";

    const spotsLeft = details.max_participants - details.participants.length;
    const participants = Array.isArray(details.participants) ? details.participants : [];

    const title = document.createElement("h4");
    title.textContent = name;

    const description = document.createElement("p");
    description.textContent = details.description;

    const schedule = document.createElement("p");
    schedule.innerHTML = `<strong>Schedule:</strong> ${details.schedule}`;

    const availability = document.createElement("p");
    availability.className = "availability-row";
    availability.innerHTML = `<strong>Availability:</strong> ${spotsLeft} spots left`;

    const participantsSection = document.createElement("div");
    participantsSection.className = "participants-section";

    const participantsHeading = document.createElement("p");
    participantsHeading.className = "participants-heading";
    participantsHeading.textContent = "Current participants";

    participantsSection.appendChild(participantsHeading);

    if (participants.length === 0) {
      const emptyState = document.createElement("p");
      emptyState.className = "participants-empty";
      emptyState.textContent = "No one has signed up yet.";
      participantsSection.appendChild(emptyState);
    } else {
      const participantsList = document.createElement("ul");
      participantsList.className = "participants-list";

      participants.forEach((participant) => {
        const participantItem = document.createElement("li");
        participantItem.className = "participant-item";

        const participantEmail = document.createElement("span");
        participantEmail.textContent = participant;

        const removeButton = document.createElement("button");
        removeButton.type = "button";
        removeButton.className = "participant-remove-button";
        removeButton.setAttribute("aria-label", `Unregister ${participant} from ${name}`);
        removeButton.innerHTML =
          '<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M9 3h6l1 2h4v2H4V5h4l1-2zm1 6h2v9h-2V9zm4 0h2v9h-2V9zM7 9h2v9H7V9z"/></svg>';
        removeButton.addEventListener("click", () => {
          unregisterParticipant(name, participant);
        });

        participantItem.append(participantEmail, removeButton);
        participantsList.appendChild(participantItem);
      });

      participantsSection.appendChild(participantsList);
    }

    activityCard.append(title, description, schedule, availability, participantsSection);
    return activityCard;
  }

  // Function to fetch activities from API
  async function fetchActivities() {
    try {
      const response = await fetch(`/activities?t=${Date.now()}`, {
        cache: "no-store",
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch activities: ${response.status}`);
      }

      const activities = await response.json();

      // Clear loading message
      activitiesList.innerHTML = "";
      activitySelect.innerHTML = '<option value="">-- Select an activity --</option>';

      // Populate activities list
      Object.entries(activities).forEach(([name, details]) => {
        activitiesList.appendChild(createActivityCard(name, details));

        // Add option to select dropdown
        const option = document.createElement("option");
        option.value = name;
        option.textContent = name;
        activitySelect.appendChild(option);
      });
    } catch (error) {
      activitiesList.innerHTML = "<p>Failed to load activities. Please try again later.</p>";
      console.error("Error fetching activities:", error);
    }
  }

  // Handle form submission
  signupForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    const email = document.getElementById("email").value;
    const activity = document.getElementById("activity").value;

    try {
      const response = await fetch(
        `/activities/${encodeURIComponent(activity)}/signup?email=${encodeURIComponent(email)}`,
        {
          method: "POST",
        }
      );

      const result = await response.json();

      if (response.ok) {
        messageDiv.textContent = result.message;
        messageDiv.className = "message success";
        signupForm.reset();
        await fetchActivities();
      } else {
        messageDiv.textContent = result.detail || "An error occurred";
        messageDiv.className = "message error";
      }

      messageDiv.classList.remove("hidden");

      // Hide message after 5 seconds
      setTimeout(() => {
        messageDiv.classList.add("hidden");
      }, 5000);
    } catch (error) {
      messageDiv.textContent = "Failed to sign up. Please try again.";
      messageDiv.className = "message error";
      messageDiv.classList.remove("hidden");
      console.error("Error signing up:", error);
    }
  });

  // Initialize app
  fetchActivities();
});
