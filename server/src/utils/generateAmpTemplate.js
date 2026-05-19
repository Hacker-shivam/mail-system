import { defaultTemplateStyles } from "./styles.js";

const placeholderPattern = /\{\{\s*([a-zA-Z0-9_.-]+)\s*\}\}/g;

const getBaseUrl = () => (process.env.API_URL || "").replace(/\/$/, "");

const escapeRegex = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

const buildTrackingUrls = ({
  trackingId,
  subject,
  campaignName,
  campaignType
}) => {
  const baseUrl = getBaseUrl();
  const query = new URLSearchParams({
    subject: subject || "",
    campaignName: campaignName || "",
    campaignType: campaignType || ""
  });

  return {
    baseUrl,
    openHtmlUrl: `${baseUrl}/track/open-html/${trackingId}?${query.toString()}`,
    openAmpUrl: `${baseUrl}/track/open-amp/${trackingId}?${query.toString()}`,
    unsubscribeUrl: `${baseUrl}/track/unsubscribe/${trackingId}`,
    formHtmlUrl: `${baseUrl}/track/form/${trackingId}?${query.toString()}`,
    formAmpUrl: `${baseUrl}/track/form-amp/${trackingId}`
  };
};

const replacePlaceholders = (template, values) => {
  return template.replace(placeholderPattern, (_, key) => {
    const value = values[key];
    return value === undefined || value === null ? "" : String(value);
  });
};

const shouldTrackHref = (href, baseUrl) => {
  if (!href || href.startsWith("#")) {
    return false;
  }

  const lowerHref = href.toLowerCase();

  if (
    lowerHref.startsWith("mailto:") ||
    lowerHref.startsWith("tel:") ||
    lowerHref.startsWith("javascript:")
  ) {
    return false;
  }

  if (baseUrl && lowerHref.startsWith(baseUrl.toLowerCase())) {
    return false;
  }

  return /^https?:\/\//i.test(href);
};

const trackLinks = (html, trackingId, context) => {
  const { baseUrl } = context.urls;

  return html.replace(
    /href=(["'])(.*?)\1/gi,
    (match, quote, href) => {
      if (!shouldTrackHref(href, baseUrl)) {
        return match;
      }

      const query = new URLSearchParams({
        url: href,
        subject: context.subject || "",
        campaignName: context.campaignName || "",
        campaignType: context.campaignType || ""
      });

      return `href=${quote}${baseUrl}/track/click/${trackingId}?${query.toString()}${quote}`;
    }
  );
};

const injectBeforeBodyEnd = (html, markup) => {
  if (/<\/body>/i.test(html)) {
    return html.replace(/<\/body>/i, `${markup}</body>`);
  }

  return `${html}${markup}`;
};

const injectStyle = (html) => {
  if (html.includes("tracking-footer")) {
    return html;
  }

  const style = `<style>${defaultTemplateStyles}</style>`;

  if (/<\/head>/i.test(html)) {
    return html.replace(/<\/head>/i, `${style}</head>`);
  }

  return `${style}${html}`;
};

const hasTrackingToken = (template, tokenName, url) => {
  return (
    new RegExp(`\\{\\{\\s*${escapeRegex(tokenName)}\\s*\\}\\}`, "i").test(template) ||
    template.includes(url)
  );
};

const addHtmlTracking = (html, originalTemplate, urls) => {
  let nextHtml = injectStyle(html);

  if (!hasTrackingToken(originalTemplate, "openPixelHtml", urls.openHtmlUrl)) {
    nextHtml = injectBeforeBodyEnd(
      nextHtml,
      `<img src="${urls.openHtmlUrl}" width="1" height="1" alt="" style="display:none;" />`
    );
  }

  if (!hasTrackingToken(originalTemplate, "unsubscribeUrl", urls.unsubscribeUrl)) {
    nextHtml = injectBeforeBodyEnd(
      nextHtml,
      `<div class="tracking-footer"><a href="${urls.unsubscribeUrl}">Unsubscribe</a></div>`
    );
  }

  return nextHtml;
};

const addAmpTracking = (amp, originalTemplate, urls) => {
  let nextAmp = amp;

  if (!hasTrackingToken(originalTemplate, "openPixelAmp", urls.openAmpUrl)) {
    nextAmp = injectBeforeBodyEnd(
      nextAmp,
      `<amp-img src="${urls.openAmpUrl}" width="1" height="1" layout="fixed"></amp-img>`
    );
  }

  if (!hasTrackingToken(originalTemplate, "unsubscribeUrl", urls.unsubscribeUrl)) {
    nextAmp = injectBeforeBodyEnd(
      nextAmp,
      `<div style="text-align:center;font-size:12px;margin-top:16px;"><a href="${urls.unsubscribeUrl}">Unsubscribe</a></div>`
    );
  }

  return nextAmp;
};

export const renderTrackedTemplate = ({
  template,
  trackingId,
  email,
  subject,
  campaignName,
  campaignType,
  variables = {}
}) => {
  const urls = buildTrackingUrls({
    trackingId,
    subject,
    campaignName,
    campaignType
  });

  const values = {
    ...variables,
    trackingId,
    email,
    subject,
    campaignName,
    campaignType,
    baseUrl: urls.baseUrl,
    openPixelHtml: `<img src="${urls.openHtmlUrl}" width="1" height="1" alt="" style="display:none;" />`,
    openPixelAmp: `<amp-img src="${urls.openAmpUrl}" width="1" height="1" layout="fixed"></amp-img>`,
    unsubscribeUrl: urls.unsubscribeUrl,
    formHtmlUrl: urls.formHtmlUrl,
    formAmpUrl: urls.formAmpUrl
  };

  const htmlWithValues = replacePlaceholders(template.html, values);
  const ampWithValues = template.amp
    ? replacePlaceholders(template.amp, values)
    : "";

  const context = {
    subject,
    campaignName,
    campaignType,
    urls
  };

  return {
    subject: subject || template.subject,
    html: addHtmlTracking(
      trackLinks(htmlWithValues, trackingId, context),
      template.html,
      urls
    ),
    amp: ampWithValues
      ? addAmpTracking(
          trackLinks(ampWithValues, trackingId, context),
          template.amp,
          urls
        )
      : "",
    text: template.text
  };
};

export const extractTemplateVariables = (...templates) => {
  const variables = new Set();

  for (const template of templates) {
    if (!template) {
      continue;
    }

    for (const match of template.matchAll(placeholderPattern)) {
      variables.add(match[1]);
    }
  }

  return [...variables].sort();
};
