
document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("registry-form");
  const notice = document.getElementById("form-notice");
  const otherFamily = document.getElementById("otherFamily");
  const otherFamilyField = document.getElementById("other-family-field");
  const otherFamilyName = document.getElementById("otherFamilyName");
  const year = document.getElementById("year");

  const FUNCTION_URL =
    "https://gyykcufggbzwknfohssc.supabase.co/functions/v1/submit-registration";

  if (year) year.textContent = new Date().getFullYear();

  function updateOtherFamilyField() {
    const show = otherFamily?.value === "true";

    if (otherFamilyField) {
      otherFamilyField.hidden = !show;
    }

    if (otherFamilyName) {
      otherFamilyName.required = show;
      if (!show) otherFamilyName.value = "";
    }
  }

  otherFamily?.addEventListener("change", updateOtherFamilyField);
  updateOtherFamilyField();

  const birthday = document.getElementById("birthday");
  if (birthday) {
    birthday.max = new Date().toISOString().split("T")[0];
  }

  const instagram = document.getElementById("instagram");
  instagram?.addEventListener("blur", () => {
    instagram.value = instagram.value.trim().replace(/^@/, "");
  });

  function showNotice(message, success = false) {
    if (!notice) return;
    notice.textContent = message;
    notice.hidden = false;
    notice.setAttribute("role", "status");
    notice.setAttribute("aria-live", "polite");
    notice.dataset.status = success ? "success" : "error";
  }

  form?.addEventListener("submit", async (event) => {
    event.preventDefault();

    if (!form.reportValidity()) return;

    const submitButton = form.querySelector('[type="submit"]');
    if (submitButton) {
      submitButton.disabled = true;
      submitButton.textContent = "Submitting…";
    }

    const data = new FormData(form);

    const payload = {
      fullName: String(data.get("fullName") || "").trim(),
      preferredName: String(data.get("preferredName") || "").trim(),
      birthday: String(data.get("birthday") || ""),
      instagram: String(data.get("instagram") || "").trim().replace(/^@/, ""),
      councilPosition: String(data.get("councilPosition") || ""),
      familyRole: String(data.get("familyRole") || ""),
      otherFamily: data.get("otherFamily") === "true",
      otherFamilyName: String(data.get("otherFamilyName") || "").trim(),
      activityLevel: String(data.get("activityLevel") || ""),
      skills: String(data.get("skills") || "").trim(),
      introduction: String(data.get("introduction") || "").trim(),
      accuracyConfirm: data.has("accuracyConfirm"),
      recordAcknowledgement: data.has("recordAcknowledgement"),
    };

    try {
      const response = await fetch(FUNCTION_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const result = await response.json().catch(() => ({}));

      if (!response.ok || !result.success) {
        throw new Error(
          result.error || "Submission failed. Please try again."
        );
      }

      showNotice(
        "Your registration was submitted successfully. Thank you.",
        true
      );
      form.reset();
      updateOtherFamilyField();
    } catch (error) {
      console.error("Registration submission failed:", error);
      showNotice(
        error.message ||
          "We couldn't submit your registration. Please try again."
      );
    } finally {
      if (submitButton) {
        submitButton.disabled = false;
        submitButton.textContent = "Submit Registration";
      }
    }
  });
});
