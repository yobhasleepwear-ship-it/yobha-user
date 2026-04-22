const IMAGES_PER_COLOR = 4;
let cachedCartJson = null;
let cachedCartItems = [];
let cachedVariantIndex = new Map();
let cachedVariantFallbackIndex = new Map();

const normalize = (value) => String(value || "").trim().toLowerCase();

const getItemColor = (item) => (
  item?.color ||
  item?.variantColor ||
  item?.desiredColor ||
  item?.product?.variantColor ||
  item?.product?.desiredColor ||
  ""
);

const getAvailableColors = (item) => {
  if (Array.isArray(item?.availableColors)) return item.availableColors;
  if (Array.isArray(item?.product?.availableColors)) return item.product.availableColors;
  if (Array.isArray(item?.colors)) return item.colors;
  if (Array.isArray(item?.product?.colors)) return item.product.colors;
  return [];
};

const imageUrlFromObject = (image) => {
  if (!image) return "";
  if (typeof image === "string") return image;
  return image.thumbnailUrl || image.url || image.imageUrl || "";
};

export const getCartIdentityKey = (item) => {
  const productKey =
    item?.productId ||
    item?.productObjectId ||
    item?.id ||
    item?._id ||
    item?.cartItemId ||
    "";
  return [
    normalize(productKey),
    normalize(item?.size || item?.variantSize || item?.variantSku),
    normalize(getItemColor(item)),
  ].join("::");
};

export const buildProductDetailUrl = (item) => {
  const productKey =
    item?.productObjectId ||
    item?.product?.productObjectId ||
    item?.id ||
    item?._id ||
    item?.productId ||
    item?.product?._id ||
    item?.product?.productId;
  if (!productKey) {
    return "/products";
  }

  const params = new URLSearchParams();
  const availableColors = getAvailableColors(item);
  const color =
    getItemColor(item) ||
    availableColors[0];
  if (color) {
    params.set("color", color);
  }

  const query = params.toString();
  return query
    ? `/productDetail/${productKey}?${query}`
    : `/productDetail/${productKey}`;
};

const getStoredCart = () => {
  try {
    const rawCart = localStorage.getItem("cart") || "[]";
    if (rawCart === cachedCartJson) {
      return cachedCartItems;
    }

    const parsed = JSON.parse(rawCart);
    cachedCartJson = rawCart;
    cachedCartItems = Array.isArray(parsed) ? parsed : [];
    cachedVariantIndex = new Map();
    cachedVariantFallbackIndex = new Map();

    cachedCartItems.forEach((item) => {
      const baseKeys = [
        normalize(item?.productId),
        normalize(item?.id),
      ].filter(Boolean);

      const sizes = [normalize(item?.size)];
      const colors = [normalize(item?.color)];

      baseKeys.forEach((productKey) => {
        sizes.forEach((sizeKey) => {
          colors.forEach((colorKey) => {
            if (!colorKey) return;
            const exactKey = `${productKey}::${sizeKey}::${colorKey}`;
            const fallbackKey = `${productKey}::${sizeKey}`;

            cachedVariantIndex.set(exactKey, item);
            cachedVariantFallbackIndex.set(
              fallbackKey,
              [...(cachedVariantFallbackIndex.get(fallbackKey) || []), item]
            );
          });
        });
      });
    });

    return cachedCartItems;
  } catch {
    cachedCartJson = null;
    cachedCartItems = [];
    cachedVariantIndex = new Map();
    cachedVariantFallbackIndex = new Map();
    return [];
  }
};

const findStoredVariantMatch = ({ productId, productObjectId, size, color }) => {
  getStoredCart();
  const normalizedSize = normalize(size);
  const normalizedColor = normalize(color);
  const productKeys = [
    normalize(productId),
    normalize(productObjectId),
  ].filter(Boolean);
  const lookupKeys = normalizedColor
    ? productKeys.map((productKey) => `${productKey}::${normalizedSize}::${normalizedColor}`)
    : [];

  for (const key of lookupKeys) {
    if (cachedVariantIndex.has(key)) {
      return cachedVariantIndex.get(key);
    }
  }

  if (!normalizedColor) {
    const fallbackKeys = productKeys.map((productKey) => `${productKey}::${normalizedSize}`);

    for (const key of fallbackKeys) {
      const candidates = cachedVariantFallbackIndex.get(key) || [];
      const uniqueColors = new Set(candidates.map((item) => normalize(item?.color)).filter(Boolean));
      if (candidates.length === 1 || uniqueColors.size === 1) {
        return candidates[0];
      }
    }
  }

  return null;
};

export const mergeCartItemWithStoredVariant = (item) => {
  const normalizedItem = {
    ...(item || {}),
    color: getItemColor(item || {}),
  };
  const storedMatch = findStoredVariantMatch(normalizedItem);
  if (!storedMatch) return item;

  return {
    ...item,
    color: getItemColor(item) || storedMatch?.color || "",
    availableColors:
      Array.isArray(item?.availableColors) && item.availableColors.length > 0
        ? item.availableColors
        : storedMatch?.availableColors || [],
    images:
      Array.isArray(item?.images) && item.images.length > 1
        ? item.images
        : storedMatch?.images || item?.images || [],
    thumbnailUrl:
      item?.thumbnailUrl ||
      imageUrlFromObject(storedMatch?.images?.[0]) ||
      storedMatch?.thumbnailUrl ||
      "",
  };
};

export const getColorAwareProductImage = (item) => {
  const images = Array.isArray(item?.images) ? item.images : [];
  if (images.length === 0) {
    return item?.thumbnailUrl || item?.image || "";
  }

  const availableColors = getAvailableColors(item);
  const selectedColor = getItemColor(item);
  const colorIndex = availableColors.findIndex(
    (color) => normalize(color) === normalize(selectedColor)
  );

  if (colorIndex >= 0 && images.length >= (colorIndex * IMAGES_PER_COLOR) + 1) {
    const preferredImage = images[colorIndex * IMAGES_PER_COLOR];
    return imageUrlFromObject(preferredImage) || item?.thumbnailUrl || item?.image || "";
  }

  return item?.thumbnailUrl || imageUrlFromObject(images[0]) || item?.image || "";
};
