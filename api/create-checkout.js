// api/create-checkout.js
// Vercel Serverless Function — crea checkout SumUp Hosted Checkout.
// Deploy: este archivo va en /api/ del repo de la web PSR (Vercel).
//
// Lo llama: public/pago.html (fetch POST /api/create-checkout) — frontend del widget.
// Llama a: SumUp Checkouts API POST https://api.sumup.com/v0.1/checkouts (Bearer API Key).
// Auth: process.env.SUMUP_API_KEY (API Key de me.sumup.com/settings/developer; SOLO en
//       env de Vercel, JAMAS en el repo ni en el frontend).
// Devuelve al frontend SOLO: { checkout_id, hosted_checkout_url }.
//
// Atribucion (cierra señal-venta + fuente_cliente del pipeline): el frontend puede mandar
// `ref` (reel_code / utm / wa_ref) leido de la URL → lo metemos en checkout_reference
// (`PSR-<ref>-<ts>`). sumup_sync.py lo lee de la transaccion y bookings_sync lo atribuye.

const SUMUP_CHECKOUTS_URL = "https://api.sumup.com/v0.1/checkouts";
const REDIRECT_OK = "https://www.patagoniasimracing.cl/pago-exitoso";
const MIN_CLP = 1000;
const MAX_CLP = 500000;

// checkout_reference solo admite alfanumerico + algunos signos → sanea el ref del cliente.
function safeRef(raw) {
  if (!raw) return "";
  return String(raw).replace(/[^a-zA-Z0-9._-]/g, "").slice(0, 32);
}

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  // Guard: sin API key no se puede cobrar (evita mandar "Bearer undefined" a SumUp).
  const apiKey = process.env.SUMUP_API_KEY;
  if (!apiKey) {
    console.error("Falta SUMUP_API_KEY en el entorno de Vercel.");
    return res.status(500).json({ error: "Cobro no configurado. Contactanos por WhatsApp." });
  }
  // merchant_code: env primero (no es secreto, pero mejor no hardcodear). Fallback = el de PSR.
  const merchantCode = process.env.SUMUP_MERCHANT_CODE || "MWJ5R05S";

  const { amount, description, customerEmail, ref } = req.body || {};

  const amountNum = parseInt(amount, 10);
  if (!amountNum || amountNum < MIN_CLP || amountNum > MAX_CLP) {
    return res.status(400).json({
      error: `Monto invalido. Minimo $${MIN_CLP.toLocaleString("es-CL")} CLP, maximo $${MAX_CLP.toLocaleString("es-CL")} CLP.`,
    });
  }

  // Referencia unica. Con ref de campaña → PSR-<ref>-<ts>; sin ref → PSR-<ts>.
  const r = safeRef(ref);
  const checkoutRef = r ? `PSR-${r}-${Date.now()}` : `PSR-${Date.now()}`;

  // Email: NO va como customer_id (eso es una referencia de cliente SumUp, no un email →
  // puede dar 400). Lo dejamos en description para que aparezca en el dashboard del comercio.
  let desc = (description ? String(description) : "Sesion Patagonia SimRacing").slice(0, 120);
  if (customerEmail) {
    const em = String(customerEmail).slice(0, 80);
    desc = `${desc} · ${em}`.slice(0, 120);
  }

  try {
    const response = await fetch(SUMUP_CHECKOUTS_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        checkout_reference: checkoutRef,
        amount: amountNum,
        currency: "CLP",
        merchant_code: merchantCode,
        description: desc,
        hosted_checkout: { enabled: true },
        redirect_url: REDIRECT_OK,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error("SumUp error:", response.status, data);
      return res.status(response.status).json({
        error: "Error al crear el pago. Intenta nuevamente.",
        detail: data,
      });
    }

    return res.status(200).json({
      checkout_id: data.id,
      hosted_checkout_url: data.hosted_checkout_url,
    });
  } catch (err) {
    console.error("Server error:", err);
    return res.status(500).json({ error: "Error interno del servidor." });
  }
}
