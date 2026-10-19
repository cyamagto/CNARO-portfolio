const form = document.querySelector("#contact-form");
const formStatus = document.querySelector("#form-status");

document.querySelector("#current-year").textContent = new Date().getFullYear();

document.querySelectorAll(".faq-item").forEach((item) => {
  item.addEventListener("toggle", () => {
    if (!item.open) return;
    document.querySelectorAll(".faq-item[open]").forEach((openItem) => {
      if (openItem !== item) openItem.open = false;
    });
  });
});

const validationMessage = (field) => {
  const value = field.value.trim();
  if (field.name === "consent") return field.checked ? "" : "個人情報の取り扱いへの同意が必要です。";
  if (!value) return "入力してください。";
  if (field.name === "phone" && !/^[0-9+().\-\s]{9,20}$/.test(value)) return "電話番号をご確認ください。";
  if (field.name === "email" && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) return "メールアドレスをご確認ください。";
  return "";
};

form.querySelectorAll("input, textarea").forEach((field) => {
  field.addEventListener("input", () => {
    field.removeAttribute("aria-invalid");
    field.closest(".form-field")?.querySelector(".field-error")?.replaceChildren();
    formStatus.textContent = "";
  });
  field.addEventListener("change", () => {
    if (field.name === "consent") formStatus.textContent = "";
  });
});

form.addEventListener("submit", (event) => {
  event.preventDefault();
  formStatus.textContent = "";
  let firstInvalid = null;

  form.querySelectorAll("[required]").forEach((field) => {
    const message = validationMessage(field);
    const error = field.closest(".form-field")?.querySelector(".field-error");
    if (message) {
      field.setAttribute("aria-invalid", "true");
      if (error) error.textContent = message;
      firstInvalid ??= field;
    } else {
      field.removeAttribute("aria-invalid");
      if (error) error.textContent = "";
    }
  });

  if (firstInvalid) {
    firstInvalid.focus();
    formStatus.textContent = "入力内容をご確認ください。";
    return;
  }

  formStatus.textContent = "入力内容を確認しました。現在はデモ表示のため、実際の送信は行われません。お電話またはLINEからご相談ください。";
});