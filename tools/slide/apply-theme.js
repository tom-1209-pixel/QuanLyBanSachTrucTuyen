// Ghi bang mau va ten theme cua nhom vao ppt/theme/theme1.xml.
// pptxgenjs chi ghi duoc hai font, con bang mau thi giu nguyen palette mac dinh cua Office,
// nen moi mau scheme (C.accent1...) van ra mau xanh/cam cua Office neu khong chay buoc nay.
const fs = require("fs");

// jszip di kem pptxgenjs; tim tu cho pptxgenjs duoc cai (node_modules canh script nay).
const JSZip = require(require.resolve("jszip", { paths: [require.resolve("pptxgenjs")] }));

const SLOTS = ["dk1", "lt1", "dk2", "lt2", "accent1", "accent2", "accent3",
  "accent4", "accent5", "accent6", "hlink", "folHlink"];

function themeXml(xml, theme) {
  if (!theme || !theme.name) throw new Error("Thieu theme.name");
  const name = String(theme.name)
    .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F]/g, "")
    .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
  const colors = theme.colors || theme;
  for (const k of SLOTS) {
    if (!/^[0-9A-Fa-f]{6}$/.test(String(colors[k]))) {
      throw new Error(`theme.colors.${k} = ${JSON.stringify(colors[k])}: phai la 6 chu so hex, khong co dau #`);
    }
  }
  const scheme = `<a:clrScheme name="${name}">` +
    SLOTS.map((k) => `<a:${k}><a:srgbClr val="${String(colors[k]).toUpperCase()}"/></a:${k}>`).join("") +
    "</a:clrScheme>";
  const out = xml
    .replace(/<a:clrScheme\b[\s\S]*?<\/a:clrScheme>/, () => scheme)
    .replace(/(<a:(?:theme|fontScheme)\b[^>]*?\bname=")[^"]*"/g, (_, head) => `${head}${name}"`);
  if (!out.includes(scheme)) throw new Error("Khong tim thay <a:clrScheme> trong theme1.xml");
  return out;
}

async function applyTheme(deckPath, theme, outPath = deckPath) {
  const zip = await JSZip.loadAsync(fs.readFileSync(deckPath));
  const part = "ppt/theme/theme1.xml";
  if (!zip.file(part)) throw new Error(`${deckPath} khong co ${part}`);
  zip.file(part, themeXml(await zip.file(part).async("string"), theme));

  // Mau scheme bi truyen nham vao mot tuy chon chi nhan hex se thanh <a:srgbClr val="bg2"/>.
  // pptxgenjs khong bao loi, nen chan o day.
  for (const name of Object.keys(zip.files)) {
    if (!name.endsWith(".xml")) continue;
    const bad = (await zip.file(name).async("string"))
      .match(/<a:srgbClr val="((?![0-9A-Fa-f]{6}")[^"]*)"/);
    if (bad) throw new Error(`${name}: <a:srgbClr val="${bad[1]}"> khong phai 6 chu so hex – ` +
      "co mot mau scheme bi truyen vao tuy chon chi nhan hex (valGridLine.color, shadow.color, chartColors...)");
  }
  fs.writeFileSync(outPath, await zip.generateAsync({ type: "nodebuffer", compression: "DEFLATE" }));
}

module.exports = { applyTheme };
