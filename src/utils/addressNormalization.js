import { countryCodeOptions } from "../constants/commanConstant";

const COUNTRY_CODE_BY_NAME = countryCodeOptions.reduce((acc, option) => {
  acc[option.country.trim().toLowerCase()] = option.code;
  return acc;
}, {});

const COUNTRY_OPTION_BY_SHORT = countryCodeOptions.reduce((acc, option) => {
  acc[option.short.trim().toUpperCase()] = option;
  return acc;
}, {});

const COUNTRY_OPTION_BY_CODE = countryCodeOptions.reduce((acc, option) => {
  acc[option.code] = option;
  return acc;
}, {});

export const normalizeDigits = (value = "") => String(value).replace(/\D/g, "");

export const getCountryOptionFromStorefrontCode = (storefrontCode = "") => {
  const normalizedStorefrontCode = String(storefrontCode || "").trim().toUpperCase();

  if (!normalizedStorefrontCode) {
    return null;
  }

  return COUNTRY_OPTION_BY_SHORT[normalizedStorefrontCode]
    || (normalizedStorefrontCode === "GB" ? COUNTRY_OPTION_BY_SHORT.UK : null);
};

export const getStoredSelectedCountry = () => {
  if (typeof window === "undefined") {
    return null;
  }

  const savedCountry = window.localStorage.getItem("selectedCountry");
  if (!savedCountry) {
    return null;
  }

  try {
    const parsedCountry = JSON.parse(savedCountry);
    if (parsedCountry?.code) {
      return parsedCountry;
    }
  } catch (error) {
    return { code: savedCountry };
  }

  return null;
};

export const getCountryNameFromCode = (countryCode = "") => {
  const normalizedCountryCode = normalizeDigits(countryCode);
  return COUNTRY_OPTION_BY_CODE[normalizedCountryCode]?.country || "";
};

export const getDefaultAddressState = () => {
  const storefrontCode = getStoredSelectedCountry()?.code || "IN";
  const countryOption = getCountryOptionFromStorefrontCode(storefrontCode)
    || getCountryOptionFromStorefrontCode("IN");

  return {
    fullName: "",
    line1: "",
    line2: "",
    city: "",
    state: "",
    zip: "",
    countryCode: countryOption?.code || "91",
    country: countryOption?.country || "India",
    MobileNumnber: "",
    isDefault: false,
  };
};

export const normalizeCountryName = (country = "", countryCode = "") => {
  const trimmedCountry = String(country || "").trim();
  if (trimmedCountry && trimmedCountry !== "+91") {
    return trimmedCountry;
  }

  if (normalizeDigits(countryCode) === "91") {
    return "India";
  }

  return trimmedCountry;
};

export const inferCountryCode = (country = "", countryCode = "") => {
  const normalizedCountryCode = normalizeDigits(countryCode);
  if (normalizedCountryCode) {
    return normalizedCountryCode;
  }

  const normalizedCountry = normalizeCountryName(country, countryCode).toLowerCase();
  return COUNTRY_CODE_BY_NAME[normalizedCountry] || "";
};

export const toLocalPhone = (phone = "", countryCode = "") => {
  const digits = normalizeDigits(phone);
  const normalizedCountryCode = inferCountryCode("", countryCode);

  if (!digits || !normalizedCountryCode) {
    return digits;
  }

  return digits.startsWith(normalizedCountryCode)
    ? digits.slice(normalizedCountryCode.length)
    : digits;
};

export const toStoredPhone = (phone = "", countryCode = "") => {
  const digits = normalizeDigits(phone);
  const normalizedCountryCode = inferCountryCode("", countryCode);

  if (!digits || !normalizedCountryCode) {
    return digits;
  }

  return digits.startsWith(normalizedCountryCode)
    ? digits
    : `${normalizedCountryCode}${digits}`;
};

export const normalizeAccountAddressDraft = (addressDraft = {}) => {
  const countryCode = inferCountryCode(
    addressDraft.country,
    addressDraft.countryCode || addressDraft.CountryCode
  );
  const country = normalizeCountryName(addressDraft.country, countryCode)
    || getDefaultAddressState().country;
  const localPhone = toLocalPhone(
    addressDraft.MobileNumnber || addressDraft.mobileNumner || addressDraft.phone || "",
    countryCode
  );
  const storedPhone = toStoredPhone(localPhone, countryCode);

  return {
    ...addressDraft,
    countryCode,
    CountryCode: countryCode,
    country,
    MobileNumnber: storedPhone,
    mobileNumner: storedPhone,
    phone: localPhone,
  };
};
