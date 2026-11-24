/** Solar equipment catalogue records (Back office → Solar products).
 * Stored in the shared content record as `products`. When the field is absent the website shows
 * the built-in catalogue in site/catalogue.js, so saving is never required for the site to work.
 */
export const productCategories = ["panels", "inverters", "batteries"];

/** Validates the products list; `tools` supplies the worker's text/image validators and fail(). */
export function validateProducts(input, { text, image, fail }) {
  if (!Array.isArray(input) || input.length > 60) fail(400, "Keep the catalogue to 60 products or fewer.");
  const ids = new Set();
  return input.map((p) => {
    if (!p || typeof p !== "object" || Array.isArray(p)) fail(400, "Invalid product.");
    if (typeof p.id !== "string" || !/^[a-zA-Z0-9_-]{1,100}$/.test(p.id) || ids.has(p.id))
      fail(400, "Each product needs a unique valid ID.");
    ids.add(p.id);
    if (!productCategories.includes(p.category)) fail(400, "Choose panels, inverters or batteries.");
    if (!["draft", "published"].includes(p.status)) fail(400, "Invalid publication status.");
    const title = text(p.title, 120).trim();
    if (!title) fail(400, "Each product needs a name.");
    if (p.specs !== undefined && (!Array.isArray(p.specs) || p.specs.length > 8))
      fail(400, "Use up to eight specification lines.");
    const specs = (p.specs || []).map((s) => text(s, 200).trim()).filter(Boolean);
    // Uploaded product images are resized in the browser; keep each well under the row limit.
    const picture = image(p.image || "");
    if (picture.startsWith("data:") && picture.length > 700_000)
      fail(400, "That product image is too large. Use a smaller image.");
    const pdf = text(p.pdf || "", 400).trim();
    if (
      pdf &&
      !(
        (/^assets\/[^\0-\x1f<>"\\]+\.pdf$/i.test(pdf) && !pdf.includes("..")) ||
        /^https:\/\/[^\s<>"]+$/.test(pdf)
      )
    )
      fail(400, "The datasheet must be a PDF on this website or an https:// link.");
    const imageSource = text(p.imageSource || "", 400).trim();
    if (imageSource && !/^https:\/\/[^\s<>"]+$/.test(imageSource))
      fail(400, "The image source must be an https:// link.");
    return {
      id: p.id,
      category: p.category,
      status: p.status,
      title,
      subtitle: text(p.subtitle || "", 160).trim(),
      capacity: text(p.capacity || "", 80).trim(),
      specs,
      image: picture,
      websiteModel: text(p.websiteModel || "", 80).trim(),
      imageSource,
      pdf,
      // The back office stamps a product when it is edited; other saves keep its date.
      updatedAt:
        typeof p.updatedAt === "string" && p.updatedAt.length <= 40 && !Number.isNaN(Date.parse(p.updatedAt))
          ? p.updatedAt
          : new Date().toISOString(),
    };
  });
}
