import { defaultTemplateStyles } from "./styles.js";

const placeholderPattern = /\{\{\s*([a-zA-Z0-9_.-]+)\s*\}\}/g;

const getBaseUrl = () => (process.env.API_URL || "").replace(/\/$/, "");

const escapeRegex = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

const buildTrackingUrls = ({
  trackingId,
  subject,
  campaignName,
  campaignType,
  templateId,
  templateSlug
}) => {
  const baseUrl = getBaseUrl();
  const query = new URLSearchParams({
    subject: subject || "",
    campaignName: campaignName || "",
    campaignType: campaignType || ""
  });

  if (templateId) {
    query.set("templateId", templateId);
  }

  if (templateSlug) {
    query.set("templateSlug", templateSlug);
  }

  const formHtmlUrl = `${baseUrl}/track/form/${trackingId}?${query.toString()}`;
  const formClickQuery = new URLSearchParams({
    url: formHtmlUrl,
    subject: subject || "",
    campaignName: campaignName || "",
    campaignType: campaignType || ""
  });

  return {
    baseUrl,
    openHtmlUrl: `${baseUrl}/track/open-html/${trackingId}?${query.toString()}`,
    openAmpUrl: `${baseUrl}/track/open-amp/${trackingId}?${query.toString()}`,
    unsubscribeUrl: `${baseUrl}/track/unsubscribe/${trackingId}`,
    formHtmlUrl: `${baseUrl}/track/click/${trackingId}?${formClickQuery.toString()}`,
    directFormHtmlUrl: formHtmlUrl,
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
    campaignType,
    templateId: template._id?.toString(),
    templateSlug: template.slug
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
    directFormHtmlUrl: urls.directFormHtmlUrl,
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

const defaultFormHtml = ({
  trackingId,
  subject,
  campaignName,
  campaignType,
  formActionUrl,
  values
}) => {
  return `<!doctype html>
<html amp>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width,minimum-scale=1,initial-scale=1">
  <title>${values.formTitle || "Campaign Form"}</title>
  <script async src="https://cdn.ampproject.org/v0.js"></script>
  <script async custom-element="amp-form" src="https://cdn.ampproject.org/v0/amp-form-0.1.js"></script>
  <script async custom-template="amp-mustache" src="https://cdn.ampproject.org/v0/amp-mustache-0.2.js"></script>
  <style amp-boilerplate>body{-webkit-animation:-amp-start 8s steps(1,end) 0s 1 normal both;animation:-amp-start 8s steps(1,end) 0s 1 normal both}@-webkit-keyframes -amp-start{from{visibility:hidden}to{visibility:visible}}@keyframes -amp-start{from{visibility:hidden}to{visibility:visible}}</style>
  <noscript><style amp-boilerplate>body{-webkit-animation:none;animation:none}</style></noscript>
  <style amp-custom>
    body{margin:0;background:#f8fafc;font-family:Arial,sans-serif;padding:24px}
    .container{max-width:560px;margin:0 auto;background:#fff;border:1px solid #e5e7eb;border-radius:8px;padding:24px}
    h1{margin:0 0 16px;color:#111827;font-size:24px}
    label{display:block;margin:14px 0 6px;color:#374151;font-weight:700;font-size:14px}
    input,textarea,select{width:100%;box-sizing:border-box;border:1px solid #d1d5db;border-radius:6px;padding:12px;font-size:15px}
    button{width:100%;margin-top:20px;border:0;border-radius:6px;background:#178218;color:#fff;padding:13px;font-size:16px;font-weight:700}
  </style>
</head>
<body>
  <form class="container" method="post" action-xhr="${formActionUrl}" target="_top">
    <h1>${values.formTitle || "Check Your Eligibility"}</h1>
    <label>Company Name *</label>
    <input type="text" name="company" required>
    <label>Mobile No *</label>
    <input type="tel" name="mobile" required>
    <input type="hidden" name="trackingid" value="${trackingId}">
    <input type="hidden" name="subject" value="${subject || ""}">
    <input type="hidden" name="campaignName" value="${campaignName || ""}">
    <input type="hidden" name="campaignType" value="${campaignType || ""}">
    <button type="submit">${values.buttonText || "Apply Now"}</button>
    <div submit-success>
      <template type="amp-mustache">
        <p style="color:#178218;text-align:center;font-weight:700;">Submitted successfully.</p>
      </template>
    </div>
    <div submit-error>
      <template type="amp-mustache">
        <p style="color:#dc2626;text-align:center;font-weight:700;">Submission failed.</p>
      </template>
    </div>
  </form>
</body>
</html>`;
};

const isAmpFormPage = (html) => {
  return /<html[^>]*(\samp|⚡)/i.test(html) || /<style\s+amp-custom/i.test(html);
};

const ensureFormAction = (html, formActionUrl, useAmpAction = false) => {
  if (!/<form\b/i.test(html)) {
    return html;
  }

  if (useAmpAction) {
    let nextHtml = html
      .replace(/\saction-xhr=(["'])(.*?)\1/gi, "")
      .replace(/\saction=(["'])(.*?)\1/gi, "");

    nextHtml = nextHtml.replace(
      /<form\b([^>]*)>/i,
      `<form$1 action-xhr="${formActionUrl}">`
    );

    if (!/<form\b[^>]*\starget=/i.test(nextHtml)) {
      nextHtml = nextHtml.replace(
        /<form\b([^>]*)>/i,
        `<form$1 target="_top">`
      );
    }

    return nextHtml;
  }

  if (/<form\b[^>]*\saction=/i.test(html)) {
    return html.replace(
      /<form\b([^>]*)\saction=(["'])(.*?)\2([^>]*)>/i,
      `<form$1 action="${formActionUrl}"$4>`
    );
  }

  return html.replace(/<form\b([^>]*)>/i, `<form$1 action="${formActionUrl}">`);
};

const ensurePostMethod = (html) => {
  if (!/<form\b/i.test(html)) {
    return html;
  }

  if (/<form\b[^>]*\smethod=/i.test(html)) {
    return html.replace(
      /<form\b([^>]*)\smethod=(["'])(.*?)\2([^>]*)>/i,
      `<form$1 method="post"$4>`
    );
  }

  return html.replace(/<form\b([^>]*)>/i, `<form$1 method="post">`);
};

const ensureFormEnctype = (html) => {
  if (!/<form\b/i.test(html)) {
    return html;
  }

  if (/<form\b[^>]*\senctype=/i.test(html)) {
    return html.replace(
      /<form\b([^>]*)\senctype=(["'])(.*?)\2([^>]*)>/i,
      `<form$1 enctype="application/x-www-form-urlencoded"$4>`
    );
  }

  return html.replace(
    /<form\b([^>]*)>/i,
    `<form$1 enctype="application/x-www-form-urlencoded">`
  );
};

const ensureHiddenField = (html, name, value) => {
  if (new RegExp(`name=(["'])${escapeRegex(name)}\\1`, "i").test(html)) {
    return html;
  }

  const input = `<input type="hidden" name="${name}" value="${value || ""}">`;

  if (/<\/form>/i.test(html)) {
    return html.replace(/<\/form>/i, `${input}</form>`);
  }

  return `${html}${input}`;
};

export const renderTrackedFormTemplate = ({
  template,
  trackingId,
  email,
  subject,
  campaignName,
  campaignType,
  variables = {}
}) => {
  const baseUrl = getBaseUrl();
  const formActionUrl = `${baseUrl}/track/form-html/${trackingId}`;
  const values = {
    ...variables,
    trackingId,
    email,
    subject,
    campaignName,
    campaignType,
    baseUrl,
    formActionUrl
  };

  const rawFormHtml = template?.formHtml
    ? replacePlaceholders(template.formHtml, values)
    : defaultFormHtml({
        trackingId,
        subject,
        campaignName,
        campaignType,
        formActionUrl,
        values
      });

  const ampFormPage = isAmpFormPage(rawFormHtml);

  let html = ensureFormEnctype(
    ensurePostMethod(
      ensureFormAction(rawFormHtml, formActionUrl, ampFormPage)
    )
  );

  html = ensureHiddenField(html, "trackingid", trackingId);
  html = ensureHiddenField(html, "subject", subject);
  html = ensureHiddenField(html, "campaignName", campaignName);
  html = ensureHiddenField(html, "campaignType", campaignType);

  return html;
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
