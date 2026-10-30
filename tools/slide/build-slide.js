// Sinh slide bao cao GD1 - Nhom 12
// Chay: node build-slide.js [duong-dan-file-ra.pptx]
const path = require("path");
const pptxgen = require("pptxgenjs");

const { applyTheme } = require("./apply-theme.js");

const IMG = (n) => path.join(__dirname, "..", "bao-cao", "img", n + ".png");
const OUT = process.argv[2] || path.join(__dirname, "..", "..", "Slide_GD1_Nhom12.pptx");

const THEME = {
  name: "Nha sach truc tuyen - Nhom 12",
  headFontFace: "Cambria",
  bodyFontFace: "Calibri",
  colors: {
    dk1: "2A1A1E", lt1: "FFFFFF",
    dk2: "6D2E46", lt2: "F7F1E8",
    accent1: "6D2E46", // berry - mau chu dao
    accent2: "A26769", // hong tram
    accent3: "C98B5E", // cam dat - diem nhan
    accent4: "4A6670", // xanh xam - phan Desktop
    accent5: "8A7F86", // xam phu
    accent6: "E7DCCB", // kem
    hlink: "6D2E46", folHlink: "A26769",
  },
};

const pres = new pptxgen();
pres.layout = "LAYOUT_WIDE"; // 13.33 x 7.5
pres.theme = { headFontFace: THEME.headFontFace, bodyFontFace: THEME.bodyFontFace };
pres.author = "Nhom 12";
pres.company = "Truong Dai hoc Sai Gon";
pres.title = "He thong quan ly va ban sach truc tuyen - Bao cao GD1";
const C = pres.SchemeColor;

const W = 13.33, H = 7.5, M = 0.7;

/* ----------------------------------------------------------- Layouts */
pres.defineSlideMaster({
  title: "TITLE",
  background: { color: C.accent1 },
  objects: [
    { text: { text: "", options: { x: 0, y: 0, w: W, h: H, fill: { color: C.accent1 } } } },
    { placeholder: { options: { name: "eyebrow", type: "body", x: M, y: 1.55, w: 9, h: 0.4,
        color: C.accent6, fontSize: 15, bold: true, charSpacing: 2, margin: 0 } } },
    { placeholder: { options: { name: "title", type: "title", x: M, y: 2.05, w: 11.3, h: 1.9,
        color: C.background1, fontSize: 42, bold: true, valign: "top", margin: 0 } } },
    { placeholder: { options: { name: "body", type: "body", x: M, y: 4.2, w: 11.3, h: 2.4,
        color: C.accent6, fontSize: 15, margin: 0 } } },
  ],
});

pres.defineSlideMaster({
  title: "DIVIDER",
  background: { color: C.text1 },
  objects: [
    { placeholder: { options: { name: "eyebrow", type: "body", x: M, y: 2.75, w: 9, h: 0.5,
        color: C.accent3, fontSize: 17, bold: true, charSpacing: 3, margin: 0 } } },
    { placeholder: { options: { name: "title", type: "title", x: M, y: 3.25, w: 10.5, h: 1.1,
        color: C.background1, fontSize: 40, bold: true, margin: 0 } } },
    { placeholder: { options: { name: "body", type: "body", x: M, y: 4.45, w: 9.5, h: 1.2,
        color: C.accent6, fontSize: 15, margin: 0 } } },
  ],
});

const footer = (bgDark) => ([
  { text: { text: "Nhóm 12 · Báo cáo GD1 · Hệ thống quản lý và bán sách trực tuyến",
      options: { x: M, y: H - 0.52, w: 8.5, h: 0.3, fontSize: 10,
        color: bgDark ? C.accent5 : C.accent5, margin: 0, isTextBox: true } } },
  { placeholder: { options: { name: "slideNumber", type: "sldNum", x: W - 1.1, y: H - 0.52,
      w: 0.5, h: 0.3, fontSize: 10, color: C.accent5, align: "right" } } },
]);

pres.defineSlideMaster({
  title: "BASE",
  background: { color: C.background1 },
  objects: [
    { placeholder: { options: { name: "title", type: "title", x: M, y: 0.45, w: 12, h: 0.75,
        color: C.accent1, fontSize: 32, bold: true, valign: "middle", margin: 0 } } },
    { placeholder: { options: { name: "body", type: "body", x: M, y: 1.45, w: 12, h: 5.2,
        color: C.text1, fontSize: 15, margin: 0 } } },
    ...footer(false),
  ],
});

pres.defineSlideMaster({
  title: "TINT",
  background: { color: C.background2 },
  objects: [
    { placeholder: { options: { name: "title", type: "title", x: M, y: 0.45, w: 12, h: 0.75,
        color: C.accent1, fontSize: 32, bold: true, valign: "middle", margin: 0 } } },
    { placeholder: { options: { name: "body", type: "body", x: M, y: 1.45, w: 12, h: 5.2,
        color: C.text1, fontSize: 15, margin: 0 } } },
    ...footer(false),
  ],
});

/* ------------------------------------------------------ Helper dung chung */
let n = 0;
const card = (s, o) => {
  s.addShape(pres.ShapeType.roundRect, {
    x: o.x, y: o.y, w: o.w, h: o.h, rectRadius: 0.08,
    fill: { color: o.fill || C.background2 },
    line: { color: o.line || C.accent6, width: 1 },
    objectName: o.name || "card" + ++n,
  });
};
const tx = (s, t, o) => s.addText(t, Object.assign({ isTextBox: true, margin: 0 }, o));

// Danh sach gach dau dong
const bullets = (items, o = {}) =>
  items.map((t, i) => ({
    text: t,
    options: Object.assign({ bullet: true, breakLine: i !== items.length - 1 }, o.each || {}),
  }));

// Khung chu cua pptxgenjs mac dinh can giua theo chieu doc, nen danh sach bi day xuong
// giua khung. Moi danh sach deu dung helper nay de chu bat dau tu dong tren cung.
const list = (s, items, o) =>
  s.addText(bullets(items), Object.assign(
    { valign: "top", paraSpaceAfter: 10, isTextBox: true, margin: 0, color: C.text1 }, o));

// Anh canh giua trong mot khung cho truoc, giu dung ty le
const fitImage = (s, name, ratio, box) => {
  let w = box.w, h = w / ratio;
  if (h > box.h) { h = box.h; w = h * ratio; }
  s.addImage({ path: IMG(name), x: box.x + (box.w - w) / 2, y: box.y + (box.h - h) / 2,
    w, h, objectName: "hinh-" + name });
  return { w, h };
};

/* ===================================================== 1. Trang bia */
pres.addSection({ title: "Mở đầu" });
{
  const s = pres.addSlide({ masterName: "TITLE", sectionTitle: "Mở đầu" });
  tx(s, "ĐỒ ÁN MÔN NGÔN NGỮ LẬP TRÌNH C#  ·  GIAI ĐOẠN 1", { placeholder: "eyebrow" });
  tx(s, "Hệ thống quản lý và bán sách trực tuyến", { placeholder: "title" });
  s.addShape(pres.ShapeType.line, { x: M, y: 4.0, w: 2.2, h: 0,
    line: { color: THEME.colors.accent3, width: 2.5 }, objectName: "gach-bia" });
  tx(s, [
    { text: "Nhóm 12", options: { bold: true, fontSize: 17, color: "FFFFFF", breakLine: true } },
    { text: "Phạm Hoàng Sang – 3124411256", options: { breakLine: true } },
    { text: "Võ Trần Hải Đăng – 3124411069", options: { breakLine: true } },
    { text: "Ngô Hồ Đăng Khoa – 3124411130", options: { breakLine: true } },
    { text: " ", options: { breakLine: true, fontSize: 8 } },
    { text: "GVGD: TS. Đỗ Như Tài", options: { bold: true } },
  ], { placeholder: "body" });
  tx(s, "Trường Đại học Sài Gòn · Khoa Công nghệ Thông tin · Tháng 10/2026",
    { x: M, y: H - 0.85, w: 9, h: 0.3, fontSize: 11, color: THEME.colors.accent6 });
  s.addNotes("Chao thay va cac ban. Nhom 12 bao cao giai doan 1 de tai He thong quan ly va ban sach truc tuyen. Nhom gom 3 thanh vien.");
}

/* ===================================================== 2. Noi dung */
{
  const s = pres.addSlide({ masterName: "BASE", sectionTitle: "Mở đầu" });
  tx(s, "Nội dung trình bày", { placeholder: "title" });
  const items = [
    ["01", "Tổng quan hệ thống", "Bài toán đặt ra, mục tiêu, đối tượng sử dụng và phạm vi của hệ thống"],
    ["02", "Khảo sát công nghệ liên quan", "Lựa chọn công nghệ cho từng thành phần và kiến trúc tổng thể"],
    ["03", "Phân tích hệ thống", "Nghiệp vụ, chức năng, dữ liệu ba mức và giao diện"],
  ];
  items.forEach(([num, ten, mo], i) => {
    const y = 1.7 + i * 1.62;
    card(s, { x: M, y, w: 12, h: 1.35, name: "muc" + num });
    s.addShape(pres.ShapeType.ellipse, { x: M + 0.4, y: y + 0.33, w: 0.7, h: 0.7,
      fill: { color: C.accent1 }, line: { color: C.accent1, width: 0 }, objectName: "tron" + num });
    tx(s, num, { x: M + 0.4, y: y + 0.33, w: 0.7, h: 0.7, align: "center", valign: "middle",
      fontSize: 16, bold: true, color: "FFFFFF" });
    tx(s, ten, { x: M + 1.35, y: y + 0.3, w: 10, h: 0.4, fontSize: 19, bold: true, color: C.accent1 });
    tx(s, mo, { x: M + 1.35, y: y + 0.73, w: 10.2, h: 0.4, fontSize: 13, color: C.accent5 });
  });
  s.addNotes("Bai bao cao gom ba chuong theo dung yeu cau cua thay cho giai doan 1.");
}

/* ===================================================== Chuong 1 */
pres.addSection({ title: "Chương 1 – Tổng quan" });
{
  const s = pres.addSlide({ masterName: "DIVIDER", sectionTitle: "Chương 1 – Tổng quan" });
  tx(s, "CHƯƠNG 1", { placeholder: "eyebrow" });
  tx(s, "Tổng quan hệ thống", { placeholder: "title" });
  tx(s, "Bài toán · Mục tiêu · Đối tượng sử dụng · Phạm vi", { placeholder: "body" });
}

{
  const s = pres.addSlide({ masterName: "BASE", sectionTitle: "Chương 1 – Tổng quan" });
  tx(s, "Bài toán đặt ra", { placeholder: "title" });

  const cols = [
    { x: M, w: 5.85, mau: C.accent2, tieu: "Nhà sách truyền thống",
      ds: ["Khách phải đến tận cửa hàng, tự tìm sách trên kệ hoặc nhờ nhân viên tra cứu",
           "Hết sách thì khách quay lại lần sau hoặc để số điện thoại chờ gọi",
           "Đơn đặt qua điện thoại, mạng xã hội do nhân viên tự ghi, tự tính tiền",
           "Tồn kho, doanh thu theo dõi bằng sổ sách và bảng tính, dễ sai lệch"] },
    { x: M + 6.1, w: 5.85, mau: C.accent1, tieu: "Hệ thống cần xây dựng",
      ds: ["Khách tìm và đặt sách trực tuyến bất kể thời gian, địa điểm",
           "Tồn kho hiển thị theo thời gian thực, trừ ngay khi đơn được tạo",
           "Đơn hàng vào thẳng hệ thống, nhân viên xử lý theo quy trình thống nhất",
           "Báo cáo doanh thu, tồn kho tổng hợp tự động từ dữ liệu phát sinh"] },
  ];
  cols.forEach((c) => {
    card(s, { x: c.x, y: 1.6, w: c.w, h: 4.6, fill: C.background1, line: C.accent6 });
    s.addShape(pres.ShapeType.roundRect, { x: c.x, y: 1.6, w: c.w, h: 0.75, rectRadius: 0.08,
      fill: { color: c.mau }, line: { color: c.mau, width: 0 }, objectName: "dau-" + c.tieu });
    tx(s, c.tieu, { x: c.x + 0.35, y: 1.6, w: c.w - 0.7, h: 0.75, valign: "middle",
      fontSize: 18, bold: true, color: "FFFFFF" });
    list(s, c.ds, { x: c.x + 0.35, y: 2.6, w: c.w - 0.7, h: 3.4, fontSize: 14, paraSpaceAfter: 14 });
  });
  s.addNotes("Ben trai la cach lam hien tai cua nha sach, ben phai la nhung gi he thong giai quyet.");
}

{
  const s = pres.addSlide({ masterName: "TINT", sectionTitle: "Chương 1 – Tổng quan" });
  tx(s, "Hai thành phần dùng chung một cơ sở dữ liệu", { placeholder: "title" });

  const boxes = [
    { x: M, mau: C.accent1, ten: "Trang Web bán sách", ai: "Khách vãng lai · Khách hàng",
      cn: ["Trang chủ, danh mục, tìm kiếm và lọc sách", "Xem chi tiết sách, thêm vào giỏ hàng",
           "Đặt hàng, thanh toán VNPay hoặc COD", "Theo dõi đơn, sổ địa chỉ giao hàng"] },
    { x: M + 6.1, mau: C.accent4, ten: "Ứng dụng quản trị Desktop", ai: "Nhân viên · Quản lý",
      cn: ["Quản lý sách, loại sách, tác giả, nhà xuất bản", "Xử lý đơn hàng theo từng trạng thái",
           "Quản lý kho, lập phiếu nhập từ nhà cung cấp", "Dashboard, báo cáo thống kê, xuất Excel"] },
  ];
  boxes.forEach((b) => {
    card(s, { x: b.x, y: 1.55, w: 5.85, h: 3.5, fill: C.background1 });
    tx(s, b.ten, { x: b.x + 0.35, y: 1.8, w: 5.15, h: 0.4, fontSize: 19, bold: true, color: b.mau });
    tx(s, b.ai, { x: b.x + 0.35, y: 2.22, w: 5.15, h: 0.3, fontSize: 12, bold: true, color: C.accent5 });
    list(s, b.cn, { x: b.x + 0.35, y: 2.7, w: 5.15, h: 2.2, fontSize: 13.5, paraSpaceAfter: 10 });
  });

  card(s, { x: M, y: 5.25, w: 11.95, h: 1.05, fill: C.accent6, line: C.accent6 });
  tx(s, [
    { text: "Dùng chung một CSDL SQL Server: ", options: { bold: true } },
    { text: "sách do Quản lý cập nhật trên Desktop hiển thị ngay trên Web; đơn khách đặt trên Web được Nhân viên xử lý trên Desktop; hai nơi dùng chung bảng tài khoản và vai trò." },
  ], { x: M + 0.35, y: 5.25, w: 11.25, h: 1.05, valign: "middle", fontSize: 13.5, color: C.text1 });
  s.addNotes("Day la yeu cau bat buoc cua de bai: hai thanh phan, mot co so du lieu chung.");
}

{
  const s = pres.addSlide({ masterName: "BASE", sectionTitle: "Chương 1 – Tổng quan" });
  tx(s, "Đối tượng sử dụng và phân quyền", { placeholder: "title" });
  s.addTable(
    [[
      { text: "Tác nhân", options: { bold: true, color: "FFFFFF", fill: { color: THEME.colors.accent1 } } },
      { text: "Thành phần", options: { bold: true, color: "FFFFFF", fill: { color: THEME.colors.accent1 } } },
      { text: "Vai trò chính", options: { bold: true, color: "FFFFFF", fill: { color: THEME.colors.accent1 } } },
    ],
    ["Khách vãng lai", "Trang Web", "Xem sách, tìm kiếm, đăng ký tài khoản"],
    ["Khách hàng", "Trang Web", "Đặt hàng, thanh toán, theo dõi đơn, quản lý địa chỉ giao hàng"],
    ["Nhân viên", "Ứng dụng quản trị", "Xử lý đơn hàng, cập nhật sách, lập phiếu nhập kho"],
    ["Quản lý", "Ứng dụng quản trị", "Toàn quyền của Nhân viên, thêm quản lý nhân viên và xem báo cáo"],
    ["Cổng thanh toán", "Hệ thống ngoài", "Nhận yêu cầu thanh toán và trả kết quả giao dịch về hệ thống"]],
    { x: M, y: 1.6, w: 11.95, colW: [2.4, 2.6, 6.95], rowH: 0.68, fontSize: 14,
      color: THEME.colors.dk1, border: { type: "solid", color: THEME.colors.accent6, pt: 1 },
      align: "left", valign: "middle", margin: 0.1, autoPage: false }
  );
  tx(s, "Quản lý kế thừa toàn bộ quyền của Nhân viên. Tài khoản có vai trò Khách hàng bị từ chối ngay khi đăng nhập ứng dụng quản trị.",
    { x: M, y: 5.9, w: 11.95, h: 0.5, fontSize: 13.5, italic: true, color: C.accent5 });
  s.addNotes("Ba vai tro trong he thong: KHACH HANG, NHAN VIEN, QUAN LY. Quan ly ke thua quyen cua nhan vien.");
}

/* ===================================================== Chuong 2 */
pres.addSection({ title: "Chương 2 – Công nghệ" });
{
  const s = pres.addSlide({ masterName: "DIVIDER", sectionTitle: "Chương 2 – Công nghệ" });
  tx(s, "CHƯƠNG 2", { placeholder: "eyebrow" });
  tx(s, "Khảo sát công nghệ liên quan", { placeholder: "title" });
  tx(s, "So sánh và lựa chọn công nghệ · Kiến trúc hệ thống · Khảo sát hệ thống tương tự", { placeholder: "body" });
}

{
  const s = pres.addSlide({ masterName: "BASE", sectionTitle: "Chương 2 – Công nghệ" });
  tx(s, "Công nghệ đã lựa chọn", { placeholder: "title" });
  const head = (t) => ({ text: t, options: { bold: true, color: "FFFFFF", fill: { color: THEME.colors.accent1 } } });
  s.addTable(
    [[head("Thành phần"), head("Phương án khác"), head("Nhóm chọn"), head("Lý do")],
     ["Ứng dụng quản trị", "WinForms", "WinUI 3", "Giao diện Fluent hiện đại, hỗ trợ XAML và mô hình MVVM"],
     ["Trang Web", "ASP.NET Core MVC", "Blazor Server", "Viết toàn bộ bằng C#, cập nhật giỏ hàng không cần JavaScript"],
     ["Truy xuất dữ liệu", "ADO.NET", "EF Core 8", "Code First, Migrations, LINQ thay cho câu lệnh SQL thủ công"],
     ["Kết nối Desktop", "Nối thẳng CSDL", "Web API + JWT", "Không đặt chuỗi kết nối trên máy nhân viên, kiểm tra quyền tập trung"],
     ["Xác thực Web", "Tự viết", "ASP.NET Core Identity", "Có sẵn băm mật khẩu, khóa tài khoản, đặt lại mật khẩu qua email"]],
    { x: M, y: 1.6, w: 11.95, colW: [2.3, 2.3, 2.5, 4.85], rowH: 0.62, fontSize: 13.5,
      color: THEME.colors.dk1, border: { type: "solid", color: THEME.colors.accent6, pt: 1 },
      align: "left", valign: "middle", margin: 0.1, autoPage: false }
  );
  tx(s, "Các lựa chọn đều nằm trong danh mục điểm sáng tạo của đề bài: WinUI 3, Blazor, EF Core, Web API, DI, Unit Test.",
    { x: M, y: 5.55, w: 11.95, h: 0.5, fontSize: 13.5, italic: true, color: C.accent5 });
  s.addNotes("Moi lua chon deu co ly do, khong chon theo cam tinh. Cac cong nghe nay cung nam trong muc diem sang tao cua de bai.");
}

{
  const s = pres.addSlide({ masterName: "TINT", sectionTitle: "Chương 2 – Công nghệ" });
  tx(s, "Kiến trúc hệ thống", { placeholder: "title" });
  fitImage(s, "kientruc", 1.33, { x: 0.8, y: 1.5, w: 6.4, h: 5.0 });
  const ds = [
    ["BookStore.Domain", "Entity và enum trạng thái"],
    ["BookStore.Data", "EF Core DbContext, Migrations"],
    ["BookStore.Services", "Nghiệp vụ, validation, DTO"],
    ["BookStore.Api", "Web API cho Desktop, JWT"],
    ["BookStore.Web", "Blazor – trang khách hàng"],
    ["BookStore.Admin", "WinUI 3 – ứng dụng quản trị"],
    ["BookStore.Tests", "xUnit cho tầng Services"],
  ];
  tx(s, "Monolith phân lớp, 7 project", { x: 7.55, y: 1.55, w: 5.1, h: 0.4, fontSize: 18, bold: true, color: C.accent1 });
  ds.forEach(([ten, mo], i) => {
    const y = 2.08 + i * 0.6;
    tx(s, ten, { x: 7.55, y, w: 2.6, h: 0.3, fontSize: 13, bold: true, color: C.accent4 });
    tx(s, mo, { x: 7.55, y: y + 0.26, w: 5.1, h: 0.28, fontSize: 12, color: C.accent5 });
  });
  tx(s, "Mỗi tầng chỉ phụ thuộc vào interface của tầng dưới, đăng ký qua Dependency Injection.",
    { x: 7.55, y: 6.3, w: 5.1, h: 0.5, fontSize: 12, italic: true, color: C.accent5 });
  s.addNotes("Nhom chon kien truc phan lop don gian, khong dung microservices vi vua suc nhom 3 nguoi.");
}

{
  const s = pres.addSlide({ masterName: "BASE", sectionTitle: "Chương 2 – Công nghệ" });
  tx(s, "Khảo sát các hệ thống tương tự", { placeholder: "title" });
  const ds = [
    ["Fahasa.com.vn", "Nhà sách trực tuyến lớn tại Việt Nam",
      "Danh mục nhiều cấp, bộ lọc theo nhà xuất bản và khoảng giá, trang chi tiết sách đầy đủ thông số"],
    ["Tiki.vn", "Sàn thương mại điện tử có ngành hàng sách",
      "Giỏ hàng giữ lại sau khi đăng nhập, nhiều hình thức thanh toán, trang theo dõi trạng thái đơn rõ ràng"],
  ];
  ds.forEach(([ten, loai, hoc], i) => {
    const y = 1.6 + i * 1.5;
    card(s, { x: M, y, w: 11.95, h: 1.25 });
    tx(s, ten, { x: M + 0.4, y: y + 0.26, w: 3.4, h: 0.35, fontSize: 17, bold: true, color: C.accent1 });
    tx(s, loai, { x: M + 0.4, y: y + 0.66, w: 3.4, h: 0.35, fontSize: 12, color: C.accent5 });
    tx(s, hoc, { x: M + 4.1, y: y + 0.26, w: 7.5, h: 0.75, fontSize: 14, color: C.text1, valign: "top" });
  });
  card(s, { x: M, y: 4.75, w: 11.95, h: 1.35, fill: C.accent6, line: C.accent6 });
  tx(s, [
    { text: "Nhóm kế thừa: ", options: { bold: true } },
    { text: "cách tổ chức danh mục nhiều cấp, bộ lọc kết hợp nhiều tiêu chí, luồng giỏ hàng – đặt hàng – theo dõi đơn. " },
    { text: "Nhóm lược bỏ: ", options: { bold: true } },
    { text: "sàn nhiều người bán, khuyến mãi và đánh giá sách, vì vượt quá phạm vi một đồ án môn học." },
  ], { x: M + 0.4, y: 4.75, w: 11.15, h: 1.35, valign: "middle", fontSize: 13.5, color: C.text1 });
  s.addNotes("Nhom khao sat hai he thong thuc te de hoc cach to chuc chuc nang, khong sao chep giao dien.");
}

/* ===================================================== Chuong 3 */
pres.addSection({ title: "Chương 3 – Phân tích" });
{
  const s = pres.addSlide({ masterName: "DIVIDER", sectionTitle: "Chương 3 – Phân tích" });
  tx(s, "CHƯƠNG 3", { placeholder: "eyebrow" });
  tx(s, "Phân tích hệ thống", { placeholder: "title" });
  tx(s, "Nghiệp vụ · Chức năng · Dữ liệu ba mức · Giao diện", { placeholder: "body" });
}

{
  const s = pres.addSlide({ masterName: "BASE", sectionTitle: "Chương 3 – Phân tích" });
  tx(s, "Sơ đồ ngữ cảnh hệ thống", { placeholder: "title" });
  fitImage(s, "context", 1.66, { x: 1.3, y: 1.45, w: 7.1, h: 4.9 });
  tx(s, "Bốn tác nhân ngoài", { x: 8.9, y: 1.6, w: 3.8, h: 0.4, fontSize: 17, bold: true, color: C.accent1 });
  list(s, [
    "Khách hàng gửi yêu cầu tìm sách, đặt hàng và nhận thông tin đơn",
    "Nhân viên xử lý đơn, cập nhật sách và nhập kho",
    "Quản lý xem báo cáo thống kê, quản lý nhân viên",
    "Cổng thanh toán VNPay nhận yêu cầu và trả kết quả giao dịch",
  ], { x: 8.9, y: 2.15, w: 3.75, h: 3.3, fontSize: 13, paraSpaceAfter: 12 });
  s.addNotes("So do ngu canh dat he thong o giua, cho thay luong thong tin trao doi voi ben ngoai.");
}

{
  const s = pres.addSlide({ masterName: "TINT", sectionTitle: "Chương 3 – Phân tích" });
  tx(s, "Vòng đời đơn hàng", { placeholder: "title" });
  fitImage(s, "state_donhang", 2.08, { x: M, y: 1.5, w: 11.95, h: 3.0 });
  const trang = ["0 · Chờ thanh toán", "1 · Chờ xác nhận", "2 · Đã xác nhận", "3 · Đang giao", "4 · Hoàn thành", "5 · Đã hủy"];
  trang.forEach((t, i) => {
    const x = M + i * 2.0;
    card(s, { x, y: 4.85, w: 1.85, h: 0.6, fill: i === 5 ? C.accent2 : C.accent1, line: i === 5 ? C.accent2 : C.accent1 });
    tx(s, t, { x, y: 4.85, w: 1.85, h: 0.6, align: "center", valign: "middle", fontSize: 11.5, bold: true, color: "FFFFFF" });
  });
  tx(s, "Đơn giao thất bại chuyển sang trạng thái Đã hủy, lý do lưu ở ghi chú và lịch sử đơn hàng; tồn kho được hoàn lại theo quy tắc BR03.",
    { x: M, y: 5.65, w: 11.95, h: 0.5, fontSize: 13, italic: true, color: C.accent5 });
  s.addNotes("Sau trang thai cua don hang. Don COD bo qua trang thai 0, vao thang trang thai 1.");
}

{
  const s = pres.addSlide({ masterName: "BASE", sectionTitle: "Chương 3 – Phân tích" });
  tx(s, "Quy tắc nghiệp vụ tiêu biểu", { placeholder: "title" });
  const brs = [
    ["BR01", "Thêm sách vào giỏ hàng bắt buộc đã đăng nhập; khách chưa đăng nhập được chuyển sang trang Đăng nhập rồi quay lại thao tác đang dở"],
    ["BR02", "Tồn kho bị trừ ngay khi đơn hàng được tạo, nằm trong cùng một transaction để không bán vượt số lượng còn lại"],
    ["BR03", "Đơn bị hủy hoặc giao thất bại thì hoàn lại đúng số lượng đã trừ vào tồn kho"],
    ["BR04", "Đơn thanh toán VNPay quá 30 phút chưa thanh toán sẽ tự động hủy"],
    ["BR06", "Phiếu nhập chỉ cộng vào tồn kho khi chuyển sang trạng thái Hoàn thành, sau đó không được sửa hay xóa"],
    ["BR10", "Phí vận chuyển 25.000đ, miễn phí cho đơn từ 300.000đ trở lên"],
  ];
  brs.forEach(([ma, noi], i) => {
    const x = i % 2 === 0 ? M : M + 6.1;
    const y = 1.6 + Math.floor(i / 2) * 1.5;
    card(s, { x, y, w: 5.85, h: 1.25 });
    s.addShape(pres.ShapeType.roundRect, { x: x + 0.3, y: y + 0.3, w: 0.95, h: 0.42, rectRadius: 0.06,
      fill: { color: C.accent3 }, line: { color: C.accent3, width: 0 }, objectName: "ma" + ma });
    tx(s, ma, { x: x + 0.3, y: y + 0.3, w: 0.95, h: 0.42, align: "center", valign: "middle",
      fontSize: 12, bold: true, color: "FFFFFF" });
    tx(s, noi, { x: x + 1.4, y: y + 0.25, w: 4.2, h: 1.0, fontSize: 12.5, color: C.text1, valign: "top" });
  });
  tx(s, "Hệ thống có 10 quy tắc nghiệp vụ BR01 – BR10, là căn cứ để viết luồng xử lý và kiểm thử ở giai đoạn sau.",
    { x: M, y: 6.05, w: 11.95, h: 0.4, fontSize: 13, italic: true, color: C.accent5 });
  s.addNotes("Quy tac nghiep vu la phan nhom dac biet chu y vi no quyet dinh cach viet code o giai doan 2.");
}

{
  const s = pres.addSlide({ masterName: "TINT", sectionTitle: "Chương 3 – Phân tích" });
  tx(s, "Phân tích chức năng", { placeholder: "title" });
  fitImage(s, "phanra", 2.04, { x: M, y: 1.45, w: 11.95, h: 3.1 });
  const stats = [["10", "subsystem"], ["40", "use case"], ["24", "đặc tả use case"], ["7", "Epic user story"]];
  stats.forEach(([so, nhan], i) => {
    const x = M + i * 3.05;
    card(s, { x, y: 4.95, w: 2.8, h: 1.3, fill: C.background1 });
    tx(s, so, { x, y: 5.05, w: 2.8, h: 0.68, align: "center", fontSize: 40, bold: true, color: C.accent1 });
    tx(s, nhan, { x, y: 5.75, w: 2.8, h: 0.35, align: "center", fontSize: 13, color: C.accent5 });
  });
  s.addNotes("Chuc nang duoc chia thanh 5 subsystem ben Web va 5 subsystem ben Desktop, tong 40 use case.");
}

{
  const s = pres.addSlide({ masterName: "BASE", sectionTitle: "Chương 3 – Phân tích" });
  tx(s, "Phân tích dữ liệu – ba mức", { placeholder: "title" });
  fitImage(s, "erd", 0.73, { x: 0.75, y: 1.45, w: 3.6, h: 4.9 });
  const muc = [
    ["Mức ý niệm", "Sơ đồ ERD với đầy đủ thực thể, thuộc tính, khóa chính và thuộc tính của quan hệ nhiều – nhiều"],
    ["Mức luận lý", "Chuyển ERD thành lược đồ quan hệ, tách quan hệ n–n thành bảng trung gian"],
    ["Mức vật lý", "19 bảng với kiểu dữ liệu, ràng buộc khóa chính, khóa ngoại, NOT NULL và UNIQUE cụ thể trên SQL Server"],
  ];
  muc.forEach(([ten, mo], i) => {
    const y = 1.55 + i * 1.3;
    tx(s, ten, { x: 5.1, y, w: 7.5, h: 0.35, fontSize: 18, bold: true, color: C.accent1 });
    tx(s, mo, { x: 5.1, y: y + 0.4, w: 7.5, h: 0.75, fontSize: 13.5, color: C.text1, valign: "top" });
  });
  card(s, { x: 5.1, y: 5.5, w: 7.55, h: 0.85, fill: C.accent6, line: C.accent6 });
  tx(s, [
    { text: "Đã kiểm tra 1NF, 2NF, 3NF. ", options: { bold: true } },
    { text: "Các cột đơn giá và tổng tiền lưu trong đơn hàng là dữ liệu lịch sử tại thời điểm đặt, không vi phạm 3NF." },
  ], { x: 5.45, y: 5.5, w: 6.85, h: 0.85, valign: "middle", fontSize: 12.5, color: C.text1 });
  s.addNotes("De bai bat buoc CSDL dat chuan 3NF. Nhom da kiem tra tung bang trong bao cao.");
}

{
  const s = pres.addSlide({ masterName: "TINT", sectionTitle: "Chương 3 – Phân tích" });
  tx(s, "Lược đồ cơ sở dữ liệu mức vật lý", { placeholder: "title" });
  fitImage(s, "db_vatly", 1.04, { x: 0.8, y: 1.45, w: 6.6, h: 4.9 });
  tx(s, "19 bảng dùng chung cho cả hai thành phần", { x: 7.75, y: 1.55, w: 4.9, h: 0.7, fontSize: 18, bold: true, color: C.accent1 });
  const nhom = [
    ["Tài khoản và người dùng", "VaiTro, TaiKhoan, KhachHang, DiaChiGiaoHang, NhanVien"],
    ["Sách và danh mục", "LoaiSach, TacGia, NhaXuatBan, Sach, Sach_TacGia"],
    ["Kho và nhập hàng", "NhaCungCap, PhieuNhap, CTPhieuNhap"],
    ["Bán hàng", "GioHang, CTGioHang, DonHang, CTDonHang, LichSuDonHang, ThanhToan"],
  ];
  nhom.forEach(([ten, bang], i) => {
    const y = 2.4 + i * 1.0;
    tx(s, ten, { x: 7.75, y, w: 4.9, h: 0.3, fontSize: 13.5, bold: true, color: C.accent4 });
    tx(s, bang, { x: 7.75, y: y + 0.28, w: 4.9, h: 0.6, fontSize: 11.5, color: C.accent5, valign: "top" });
  });
  s.addNotes("Ten bang dat bang tieng Viet khong dau theo kieu PascalCase cho thong nhat voi bao cao.");
}

{
  const s = pres.addSlide({ masterName: "BASE", sectionTitle: "Chương 3 – Phân tích" });
  tx(s, "Phân tích giao diện", { placeholder: "title" });
  const anh = [
    { n: "wf_home", t: "Trang chủ – Web Blazor", x: M },
    { n: "wf_dk_dashboard", t: "Dashboard – Desktop WinUI 3", x: M + 6.1 },
  ];
  anh.forEach((a) => {
    card(s, { x: a.x, y: 1.55, w: 5.85, h: 4.05, fill: C.background2 });
    fitImage(s, a.n, 1.49, { x: a.x + 0.25, y: 1.8, w: 5.35, h: 3.3 });
    tx(s, a.t, { x: a.x, y: 5.15, w: 5.85, h: 0.35, align: "center", fontSize: 13.5, bold: true, color: C.accent1 });
  });
  tx(s, "Toàn bộ 15 màn hình đã liệt kê đều có wireframe kèm mô tả: 8 màn hình trang Web và 7 màn hình ứng dụng quản trị.",
    { x: M, y: 5.85, w: 11.95, h: 0.5, fontSize: 13.5, italic: true, color: C.accent5 });
  s.addNotes("Wireframe ve o muc bo cuc, chua di vao mau sac. Giai doan 2 se dung lai theo Bootstrap 5 va Fluent Design.");
}

/* ===================================================== Ket qua */
pres.addSection({ title: "Kết luận" });
{
  const s = pres.addSlide({ masterName: "TINT", sectionTitle: "Kết luận" });
  tx(s, "Kết quả giai đoạn 1 và kế hoạch tiếp theo", { placeholder: "title" });

  card(s, { x: M, y: 1.55, w: 5.85, h: 4.75, fill: C.background1 });
  tx(s, "Đã hoàn thành", { x: M + 0.35, y: 1.8, w: 5.15, h: 0.4, fontSize: 19, bold: true, color: C.accent1 });
  list(s, [
    "Báo cáo phân tích 82 trang, 34 hình minh họa",
    "Xác định rõ phạm vi, tác nhân và phân quyền",
    "Chốt công nghệ và kiến trúc 7 project",
    "40 use case, 24 đặc tả, user story theo 7 Epic",
    "Thiết kế dữ liệu ba mức, 19 bảng đạt 3NF",
    "Wireframe đủ 15 màn hình của cả hai thành phần",
  ], { x: M + 0.35, y: 2.4, w: 5.15, h: 3.6, fontSize: 13.5, paraSpaceAfter: 14 });

  card(s, { x: M + 6.1, y: 1.55, w: 5.85, h: 4.75, fill: C.background1 });
  tx(s, "Giai đoạn 2", { x: M + 6.45, y: 1.8, w: 5.15, h: 0.4, fontSize: 19, bold: true, color: C.accent4 });
  const bb = [
    ["1", "Tạo solution và 7 project, dựng khung WinUI 3"],
    ["2", "Entity, DbContext, migration đầu tiên và dữ liệu mẫu"],
    ["3", "Web API đăng nhập JWT, CRUD sách và danh mục"],
    ["4", "Trang Web: danh mục, tìm kiếm, giỏ hàng, đặt hàng"],
    ["5", "Desktop: xử lý đơn, kho, khách hàng và nhân viên"],
    ["6", "Dashboard, xuất Excel, unit test và báo cáo cuối kỳ"],
  ];
  bb.forEach(([so, t], i) => {
    const y = 2.4 + i * 0.63;
    s.addShape(pres.ShapeType.ellipse, { x: M + 6.45, y: y + 0.03, w: 0.32, h: 0.32,
      fill: { color: C.accent4 }, line: { color: C.accent4, width: 0 }, objectName: "buoc" + so });
    tx(s, so, { x: M + 6.45, y: y + 0.03, w: 0.32, h: 0.32, align: "center", valign: "middle",
      fontSize: 10, bold: true, color: "FFFFFF" });
    tx(s, t, { x: M + 6.92, y, w: 4.7, h: 0.5, fontSize: 12.5, color: C.text1, valign: "top" });
  });
  s.addNotes("Giai doan 1 da xong phan phan tich. Giai doan 2 se lan luot cai dat theo sau buoc nay.");
}

{
  const s = pres.addSlide({ masterName: "TITLE", sectionTitle: "Kết luận" });
  tx(s, "NHÓM 12 · ĐỒ ÁN NGÔN NGỮ LẬP TRÌNH C#", { placeholder: "eyebrow" });
  tx(s, "Cảm ơn thầy và các bạn đã lắng nghe", { placeholder: "title" });
  tx(s, [
    { text: "Nhóm xin tiếp nhận câu hỏi và góp ý.", options: { fontSize: 17, breakLine: true } },
    { text: " ", options: { breakLine: true, fontSize: 10 } },
    { text: "Phạm Hoàng Sang · Võ Trần Hải Đăng · Ngô Hồ Đăng Khoa" },
  ], { placeholder: "body" });
  s.addNotes("Ket thuc phan trinh bay, moi thay va cac ban dat cau hoi.");
}

/* ----------------------------------------------------------- Ghi file */
(async () => {
  await pres.writeFile({ fileName: OUT });
  await applyTheme(OUT, THEME);
  console.log("Da tao:", OUT);
})();
