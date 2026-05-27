/**
 * Cloudflare Pages Function — Select (selectenv.com)
 *
 * Two responsibilities:
 *   1. Form submissions — POST /api/contact accepts form data, looks up
 *      recipients by the `_form` hidden field, forwards via the Resend API.
 *   2. Pass-through asset serving for everything else.
 *
 * Secrets — set in Cloudflare Pages → Settings → Environment variables:
 *   RESEND_API_KEY   (re-use the same key as the FCG/FCM project)
 */
export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    if (url.pathname === "/api/contact" && request.method === "POST") {
      return handleContactForm(request, env);
    }

    return env.ASSETS.fetch(request);
  },
};

// =============================================================================
// Form-submission handler
// =============================================================================

// One row per form. Each value is the recipient list for that form.
// Adding a new form: add a row here AND set <input name="_form" value="..."> in the page.
const FORM_ROUTING = {
  "select-contact": ["dispatch@selectenv.com", "Adam.Hostetter@firstcallgroup.com"],
};

const FORM_LABELS = {
  "select-contact": "Select contact form",
};

// The "from" address must be on a domain verified in Resend. firstcallgroup.com
// is already verified for the FCG/FCM project — reusing it here means no extra
// DNS setup. Reply-to is set to the submitter's email, so replies still route
// back to the customer.
const FROM_EMAIL = "Select <noreply@firstcallgroup.com>";

async function handleContactForm(request, env) {
  try {
    const ct = request.headers.get("content-type") || "";
    const data = ct.includes("application/json")
      ? await request.json()
      : Object.fromEntries((await request.formData()).entries());

    // Honeypot: bots fill hidden fields. Pretend success, don't email.
    if (data._honeypot) {
      return jsonResp({ ok: true });
    }

    const formId = String(data._form || "").trim();
    const to = FORM_ROUTING[formId];
    if (!to) {
      return jsonResp({ error: `Unknown form id: ${formId}` }, 400);
    }

    const subject = buildSubject(formId, data);
    const html = renderEmailHTML(formId, data);
    const text = renderEmailText(formId, data);
    const replyTo =
      typeof data.email === "string" && /@/.test(data.email) ? data.email : undefined;

    const resp = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${env.RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: FROM_EMAIL,
        to,
        reply_to: replyTo,
        subject,
        html,
        text,
      }),
    });

    if (!resp.ok) {
      const errText = await resp.text();
      console.error("Resend failure:", resp.status, errText);
      return jsonResp({ error: "Email delivery failed. Please try again or contact us directly." }, 502);
    }

    return jsonResp({ ok: true });
  } catch (e) {
    console.error("Form handler error:", e && e.stack || e);
    return jsonResp({ error: "Server error. Please try again." }, 500);
  }
}

function jsonResp(body, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "content-type": "application/json; charset=utf-8" },
  });
}

function buildSubject(formId, data) {
  const label = FORM_LABELS[formId] || formId;
  const name = typeof data.name === "string" && data.name.trim() ? ` — ${data.name.trim()}` : "";
  return `[Web] ${label}${name}`;
}

function renderEmailHTML(formId, data) {
  const rows = Object.entries(data)
    .filter(([k]) => !k.startsWith("_"))
    .map(([k, v]) => `
      <tr>
        <td style="padding:6px 16px 6px 0; vertical-align:top; color:#5a6371; font-weight:600; white-space:nowrap">${esc(prettyLabel(k))}</td>
        <td style="padding:6px 0; vertical-align:top; white-space:pre-wrap; word-break:break-word">${esc(String(v ?? ""))}</td>
      </tr>`).join("");
  const label = FORM_LABELS[formId] || formId;
  return `<!DOCTYPE html><html><body style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;color:#1a2331;max-width:640px;margin:0 auto;padding:24px;background:#fcfbf7">
<div style="background:#fff;border:1px solid #e5e1d2;border-radius:12px;padding:24px;box-shadow:0 1px 3px rgba(15,42,31,0.06)">
<h2 style="margin:0 0 4px 0;font-weight:700">New form submission</h2>
<p style="color:#5a6371;margin:0 0 16px 0;font-size:13px">${esc(label)} &mdash; <code style="background:#f4f2ea;padding:2px 6px;border-radius:4px">${esc(formId)}</code></p>
<table style="border-collapse:collapse;border-top:1px solid #e5e1d2;padding-top:12px;width:100%;font-size:14px">${rows}</table>
</div>
</body></html>`;
}

function renderEmailText(formId, data) {
  const label = FORM_LABELS[formId] || formId;
  const lines = [`New form submission`, label, `(${formId})`, ""];
  for (const [k, v] of Object.entries(data)) {
    if (k.startsWith("_")) continue;
    lines.push(`${prettyLabel(k)}: ${v}`);
  }
  return lines.join("\n");
}

function prettyLabel(k) {
  return k.replace(/[-_]/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

function esc(s) {
  return String(s).replace(/[&<>"']/g, (m) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[m]));
}
