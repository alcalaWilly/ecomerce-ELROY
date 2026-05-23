(async function () {
  const baseUrl = window.API_BASE_URL || "";

  const msg = document.getElementById("msg");
  const err = document.getElementById("err");

  // URL: /activate/<uid>/<token>
  const parts = window.location.pathname.split("/").filter(Boolean);
  const activateIndex = parts.indexOf("activate");

  if (activateIndex === -1 || parts.length < activateIndex + 3) {
    msg.innerText = "";
    err.style.display = "block";
    err.innerText = "Link de activación inválido.";
    return;
  }

  const uid = parts[activateIndex + 1];
  const token = parts[activateIndex + 2];

  try {
    const res = await fetch(`${baseUrl}/auth/users/activation/`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ uid, token })
    });

    if (res.ok) {
      msg.innerText = "✅ Cuenta activada. Redirigiendo al login...";
      setTimeout(() => {
        window.location.href = "/login"; // o tu ruta real
      }, 1200);
      return;
    }

    // leer error DRF
    const contentType = res.headers.get("content-type") || "";
    const data = contentType.includes("application/json") ? await res.json() : { detail: await res.text() };

    msg.innerText = "";
    err.style.display = "block";
    err.innerText =
      data?.detail ||
      Object.entries(data).map(([k, v]) => `${k}: ${Array.isArray(v) ? v.join(", ") : v}`).join("\n") ||
      "No se pudo activar la cuenta.";

  } catch (e) {
    msg.innerText = "";
    err.style.display = "block";
    err.innerText = "Error de conexión al activar la cuenta.";
  }
})();