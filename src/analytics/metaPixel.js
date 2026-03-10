const PIXEL_ID = process.env.REACT_APP_META_PIXEL_ID;

let isInitialized = false;

const canUseDom = () => typeof window !== "undefined" && typeof document !== "undefined";

function injectMetaPixelScript() {
  if (!canUseDom()) return false;
  if (!PIXEL_ID) return false;

  if (window.fbq) {
    return true;
  }

  /* eslint-disable */
  !(function (f, b, e, v, n, t, s) {
    if (f.fbq) return;
    n = f.fbq = function () {
      n.callMethod ? n.callMethod.apply(n, arguments) : n.queue.push(arguments);
    };
    if (!f._fbq) f._fbq = n;
    n.push = n;
    n.loaded = true;
    n.version = "2.0";
    n.queue = [];
    t = b.createElement(e);
    t.async = true;
    t.src = v;
    s = b.getElementsByTagName(e)[0];
    s.parentNode.insertBefore(t, s);
  })(window, document, "script", "https://connect.facebook.net/en_US/fbevents.js");
  /* eslint-enable */

  return true;
}

export function initMetaPixel() {
  if (isInitialized) return true;
  if (!injectMetaPixelScript()) return false;
  if (!window.fbq) return false;

  window.fbq("init", PIXEL_ID);
  isInitialized = true;
  return true;
}

export function trackMetaPageView() {
  if (!initMetaPixel()) return;
  window.fbq("track", "PageView");
}

export function trackMetaEvent(eventName, params = {}) {
  if (!eventName) return;
  if (!initMetaPixel()) return;
  window.fbq("track", eventName, params);
}

export function trackMetaCustomEvent(eventName, params = {}) {
  if (!eventName) return;
  if (!initMetaPixel()) return;
  window.fbq("trackCustom", eventName, params);
}

const normalizeCurrency = (currency) => {
  if (!currency) return "INR";
  return String(currency).toUpperCase();
};

export function trackAddToCartMeta({ productId, productName, quantity = 1, value, currency } = {}) {
  const safeQuantity = Number(quantity) > 0 ? Number(quantity) : 1;
  const safeValue = Number(value);

  trackMetaEvent("AddToCart", {
    content_ids: productId ? [String(productId)] : [],
    content_name: productName || undefined,
    content_type: "product",
    num_items: safeQuantity,
    value: Number.isFinite(safeValue) ? safeValue : undefined,
    currency: normalizeCurrency(currency),
  });
}

export function trackPurchaseMeta({ orderId, value, currency, productIds = [], itemCount } = {}) {
  const safeValue = Number(value);

  trackMetaEvent("Purchase", {
    content_ids: Array.isArray(productIds) ? productIds.map((id) => String(id)) : [],
    content_type: "product",
    order_id: orderId ? String(orderId) : undefined,
    num_items: Number(itemCount) > 0 ? Number(itemCount) : undefined,
    value: Number.isFinite(safeValue) ? safeValue : undefined,
    currency: normalizeCurrency(currency),
  });
}
