const fs = require("fs");
const path = require("path");
const {
  Document, Packer, Paragraph, TextRun, ImageRun, Table, TableRow, TableCell, WidthType, ShadingType,
  AlignmentType, HeadingLevel, PageBreak, Footer, PageNumber, TableOfContents, LevelFormat, BorderStyle,
  VerticalAlign,
} = require("docx");
const UC = require("./usecases");

const IMG = path.join(__dirname, "img");
const OUT = process.argv[2] || path.join(__dirname, "out.docx");
const FONT = "Times New Roman";
const CONTENT_W = 9071; // A4 – lề trái 3cm, phải 2cm (DXA)

// ------------------------------------------------------------------ helpers
const run = (text, o = {}) => new TextRun({ text, font: FONT, ...o });

function P(text, o = {}) {
  const children = Array.isArray(text) ? text : [run(text, o.run || {})];
  return new Paragraph({
    children, alignment: o.align || AlignmentType.JUSTIFIED,
    spacing: { after: o.after ?? 100, before: o.before ?? 0, line: 312 },
    indent: o.indent === false ? undefined : { firstLine: o.firstLine ?? 567 },
    keepNext: o.keepNext,
  });
}
// "Nhãn: nội dung" with bold label
const PL = (label, text, o = {}) => P([run(label, { bold: true }), run(text)], o);

let chapter = 0, fig = 0, tbl = 0;
function H1(text) {
  chapter++; fig = 0; tbl = 0;
  return new Paragraph({ heading: HeadingLevel.HEADING_1, pageBreakBefore: true, alignment: AlignmentType.CENTER,
    children: [run(`CHƯƠNG ${chapter}. ${text}`)] });
}
const H2 = (t) => new Paragraph({ heading: HeadingLevel.HEADING_2, children: [run(t)] });
const H3 = (t) => new Paragraph({ heading: HeadingLevel.HEADING_3, children: [run(t)] });
const H4 = (t) => new Paragraph({ heading: HeadingLevel.HEADING_4, children: [run(t)] });

const bullet = (text, lvl = 0) => new Paragraph({
  numbering: { reference: "bullets", level: lvl }, alignment: AlignmentType.JUSTIFIED,
  spacing: { after: 60, line: 312 },
  children: Array.isArray(text) ? text : [run(text)],
});
const bulletL = (label, text) => bullet([run(label, { bold: true }), run(text)]);

function pngSize(file) {
  const b = fs.readFileSync(file);
  return { w: b.readUInt32BE(16), h: b.readUInt32BE(20) };
}
function figure(name, caption, maxW = 600, maxH = 820) {
  const file = path.join(IMG, name + ".png");
  const { w, h } = pngSize(file);
  let width = maxW, height = Math.round((h / w) * maxW);
  if (height > maxH) { height = maxH; width = Math.round((w / h) * maxH); }
  fig++;
  return [
    new Paragraph({ alignment: AlignmentType.CENTER, spacing: { before: 120, after: 60 }, keepNext: true,
      children: [new ImageRun({ type: "png", data: fs.readFileSync(file), transformation: { width, height },
        altText: { title: caption, description: caption, name } })] }),
    new Paragraph({ alignment: AlignmentType.CENTER, spacing: { after: 200 },
      children: [run(`Hình ${chapter}.${fig}. ${caption}`, { italics: true, size: 24 })] }),
  ];
}

const border = { style: BorderStyle.SINGLE, size: 4, color: "000000" };
const borders = { top: border, bottom: border, left: border, right: border };
function cellParas(content, o) {
  const lines = Array.isArray(content) ? content : [content];
  return lines.map((l) => new Paragraph({
    alignment: o.center ? AlignmentType.CENTER : AlignmentType.LEFT, spacing: { after: 30, line: 276 },
    children: typeof l === "string" ? [run(l, { bold: o.bold, size: o.size || 24 })] : l,
  }));
}
function cell(content, width, o = {}) {
  return new TableCell({
    borders, width: { size: width, type: WidthType.DXA }, verticalAlign: o.vAlign || VerticalAlign.TOP,
    shading: o.fill ? { fill: o.fill, type: ShadingType.CLEAR, color: "auto" } : undefined,
    margins: { top: 60, bottom: 60, left: 100, right: 100 }, columnSpan: o.span,
    children: cellParas(content, o),
  });
}
function caption(text) {
  tbl++;
  return new Paragraph({ alignment: AlignmentType.CENTER, spacing: { before: 120, after: 80 }, keepNext: true,
    children: [run(`Bảng ${chapter}.${tbl}. ${text}`, { bold: true, size: 24 })] });
}
function table(headers, rows, widths, capText) {
  const out = [];
  if (capText) out.push(caption(capText));
  out.push(new Table({
    width: { size: CONTENT_W, type: WidthType.DXA }, columnWidths: widths,
    rows: [
      new TableRow({ tableHeader: true, children: headers.map((h, i) => cell(h, widths[i], { bold: true, fill: "D9E2F3", center: true })) }),
      ...rows.map((r) => new TableRow({ cantSplit: true, children: r.map((c, i) => cell(c, widths[i])) })),
    ],
  }));
  out.push(new Paragraph({ spacing: { after: 120 }, children: [] }));
  return out;
}

// Đặc tả use case – bảng 2 cột "Thành phần | Nội dung" như báo cáo cũ
function ucSpec(u) {
  const W = [2300, CONTENT_W - 2300];
  const num = (arr) => arr.map((s, i) => `${i + 1}. ${s}`);
  const alt = u.thayThe.length
    ? u.thayThe.flatMap((t, k) => [
        [run(`${t.ma}. ${t.ten}`, { bold: true, size: 24 })], ...num(t.buoc), ...(k < u.thayThe.length - 1 ? [""] : [])])
    : [""];
  const post = u.sau.flatMap((s, k) => [[run(s.ten, { bold: true, size: 24 })], ...num(s.buoc), ...(k < u.sau.length - 1 ? [""] : [])]);
  const row = (label, content) => new TableRow({ children: [cell(label, W[0], { bold: true, fill: "F2F2F2" }), cell(content, W[1])] });
  return [
    new Paragraph({ alignment: AlignmentType.CENTER, spacing: { before: 200, after: 80 }, keepNext: true,
      children: [run(`ĐẶC TẢ USE CASE ${u.ten.toUpperCase()}`, { bold: true, size: 24 })] }),
    new Table({
      width: { size: CONTENT_W, type: WidthType.DXA }, columnWidths: W,
      rows: [
        new TableRow({ tableHeader: true, children: [cell("Thành phần", W[0], { bold: true, fill: "D9E2F3", center: true }), cell("Nội dung", W[1], { bold: true, fill: "D9E2F3", center: true })] }),
        row("Tên use case", u.ten), row("Tác nhân", u.tacNhan), row("Mô tả ngắn gọn", u.moTa),
        row("Điều kiện tiên quyết", num(u.dieuKien)), row("Luồng chính", num(u.chinh)),
        row("Luồng thay thế", alt), row("Điều kiện sau", post),
      ],
    }),
    new Paragraph({ spacing: { after: 160 }, children: [] }),
  ];
}

// ------------------------------------------------------------------ cover
const coverLine = (t, o = {}) => new Paragraph({ alignment: o.align || AlignmentType.CENTER,
  spacing: { after: o.after ?? 60, before: o.before ?? 0 }, indent: o.indent ? { left: o.indent } : undefined,
  children: [run(t, { bold: o.bold, size: o.size || 26 })] });
const MEMBERS = [
  ["PHẠM HOÀNG SANG", "3124411256"],
  ["VÕ TRẦN HẢI ĐĂNG", "3124411069"],
  ["NGÔ HỒ ĐĂNG KHOA", "3124411130"],
];
const cover = [
  coverLine("ỦY BAN NHÂN DÂN TP. HỒ CHÍ MINH", { bold: true, size: 28 }),
  coverLine("TRƯỜNG ĐẠI HỌC SÀI GÒN", { bold: true, size: 28 }),
  coverLine("KHOA CÔNG NGHỆ THÔNG TIN", { bold: true, size: 28, after: 1400 }),
  coverLine("BÁO CÁO ĐỒ ÁN", { bold: true, size: 40, after: 120 }),
  coverLine("MÔN NGÔN NGỮ LẬP TRÌNH C#", { bold: true, size: 32, after: 120 }),
  coverLine("GIAI ĐOẠN 1: TỔNG QUAN VÀ PHÂN TÍCH HỆ THỐNG", { bold: true, size: 26, after: 500 }),
  coverLine("Tên đề tài:", { bold: true, size: 28, after: 80 }),
  coverLine("HỆ THỐNG QUẢN LÝ VÀ BÁN SÁCH TRỰC TUYẾN", { bold: true, size: 36, after: 1200 }),
  coverLine("Nhóm thực hiện: 12", { align: AlignmentType.LEFT, indent: 2600, bold: true }),
  coverLine("Giảng viên hướng dẫn: TS. ĐỖ NHƯ TÀI",{ align: AlignmentType.LEFT, indent: 2600, bold: true }),
  coverLine("Sinh viên thực hiện:", { align: AlignmentType.LEFT, indent: 2600, bold: true }),
  ...MEMBERS.map(([ten, mssv], i) => coverLine(`${i + 1}. ${ten} – MSSV: ${mssv}`, { align: AlignmentType.LEFT, indent: 2900 })),
  coverLine("TP. HỒ CHÍ MINH, THÁNG 10 NĂM 2026", { bold: true, before: 1800 }),
];

// ------------------------------------------------------------------ Chương 1
const ch1 = [
  H1("TỔNG QUAN HỆ THỐNG"),
  H2("1.1. Giới thiệu đề tài"),
  H3("1.1.1. Tên đề tài"),
  P("HỆ THỐNG QUẢN LÝ VÀ BÁN SÁCH TRỰC TUYẾN", { run: { bold: true } }),
  P("Đề tài xây dựng hệ thống phục vụ hoạt động bán sách và quản lý của một nhà sách, gồm hai thành phần dùng chung một cơ sở dữ liệu Microsoft SQL Server: trang Web bán sách trực tuyến dành cho khách hàng và ứng dụng quản trị chạy trên Windows dành cho nhân viên và quản lý. Khách hàng tìm sách, đặt hàng và theo dõi đơn hàng trên trang Web; nhân viên và quản lý xử lý đơn hàng, quản lý sách, tồn kho, nhập hàng và xem báo cáo thống kê trên ứng dụng quản trị."),
  H3("1.1.2. Quy trình bán sách truyền thống"),
  P("Trong mô hình nhà sách truyền thống, khách hàng phải đến trực tiếp cửa hàng để tìm sách. Khách hàng tự tìm sách trên kệ hoặc nhờ nhân viên hỗ trợ tra cứu; khi không còn sách, khách hàng phải quay lại vào lần sau hoặc để lại số điện thoại để nhân viên liên hệ khi có hàng."),
  P("Một số nhà sách có nhận đặt hàng qua điện thoại hoặc mạng xã hội. Khi đó nhân viên phải tự ghi nhận thông tin sách, số lượng, địa chỉ giao hàng của khách hàng, tự kiểm tra tồn kho, tính tiền, liên hệ đơn vị vận chuyển và theo dõi tình trạng giao hàng bằng sổ sách hoặc bảng tính."),
  P("Đối với việc quản lý, Quản lý vẫn phải tự cập nhật thông tin sách, lập phiếu nhập khi nhập hàng từ nhà cung cấp, theo dõi tồn kho và tổng hợp số liệu doanh thu, sách bán chạy để phục vụ việc ra quyết định kinh doanh."),
  H3("1.1.3. Lý do chọn đề tài"),
  P("Nhà sách chỉ bán tại cửa hàng bị giới hạn bởi vị trí và giờ mở cửa: khách hàng ở xa hoặc không có thời gian đến cửa hàng gần như không mua được sách, trong khi thói quen mua sắm trực tuyến ngày càng phổ biến, đặc biệt với mặt hàng sách vốn có thông tin rõ ràng (tên sách, tác giả, nhà xuất bản, giá bán) và dễ vận chuyển. Một kênh bán hàng trực tuyến giúp nhà sách mở rộng phạm vi khách hàng và bán hàng liên tục mà không phát sinh thêm chi phí mặt bằng."),
  P("Cách nhận đơn qua điện thoại hoặc mạng xã hội rồi ghi chép thủ công dễ phát sinh sai sót: bán vượt số lượng tồn, ghi nhầm địa chỉ giao hàng, bỏ sót đơn hàng và không tra cứu lại được khi khách hàng khiếu nại. Khi đơn hàng được hệ thống ghi nhận và trừ số lượng tồn ngay trong cùng một giao dịch, các sai sót này được loại bỏ; khách hàng cũng tự theo dõi được trạng thái đơn hàng thay vì phải gọi điện hỏi nhân viên."),
  P("Dữ liệu bán hàng, sách, tồn kho và nhập hàng nằm rời rạc ở nhiều nơi khiến việc tổng hợp số liệu mất nhiều thời gian và khó ra quyết định nhập hàng. Vì vậy, nhóm lựa chọn đề tài “Hệ thống quản lý và bán sách trực tuyến”, trong đó hoạt động bán hàng trực tuyến được liên kết trực tiếp với dữ liệu sách, tồn kho và nhập hàng trên cùng một cơ sở dữ liệu, nhờ đó doanh thu và danh sách sách bán chạy được tổng hợp tự động."),
  H3("1.1.4. Bối cảnh và vấn đề cần giải quyết"),
  P("Nhà sách cần một kênh bán hàng trực tuyến hoạt động liên tục, cho phép khách hàng chủ động tìm sách, xem thông tin chi tiết, đặt hàng và thanh toán mà không cần liên hệ nhân viên. Đơn hàng sau khi được tạo cần được chuyển ngay đến nhân viên để xác nhận và giao hàng, đồng thời số lượng tồn kho phải được cập nhật chính xác để tránh bán vượt số lượng."),
  P("Về phía quản lý, dữ liệu bán hàng trực tuyến cần được tập trung cùng với dữ liệu sách, nhập hàng và khách hàng để Quản lý có thể theo dõi doanh thu, sách bán chạy và tình hình tồn kho trên cùng một hệ thống."),
  H2("1.2. Phân tích vấn đề hiện tại"),
  P("Trong quá trình bán sách và quản lý nhà sách theo cách truyền thống, nhà sách gặp các vấn đề sau:"),
  bulletL("Tiếp cận khách hàng: ", "khách hàng phải đến cửa hàng hoặc liên hệ trực tiếp mới biết sách còn hay hết, giá bán bao nhiêu; nhà sách không phục vụ được khách hàng ở xa hoặc ngoài giờ mở cửa."),
  bulletL("Tiếp nhận đơn hàng: ", "đơn hàng qua điện thoại, mạng xã hội được ghi nhận thủ công, dễ sai sót và khó tra cứu lại."),
  bulletL("Quản lý tồn kho: ", "số lượng tồn không được cập nhật ngay khi bán, dễ xảy ra tình trạng nhận đơn nhưng không còn hàng."),
  bulletL("Theo dõi giao hàng: ", "khách hàng không biết đơn hàng đang ở trạng thái nào, phải gọi điện hỏi nhân viên."),
  bulletL("Thanh toán: ", "chủ yếu thanh toán tiền mặt hoặc chuyển khoản thủ công, nhân viên phải tự đối soát."),
  bulletL("Báo cáo và thống kê: ", "Quản lý phải tự tổng hợp số liệu từ nhiều nguồn để biết doanh thu và sách bán chạy."),
  H2("1.3. Mục tiêu của hệ thống"),
  P("Mục tiêu của đề tài là xây dựng một hệ thống gồm trang Web bán sách và ứng dụng quản trị desktop liên kết với nhau qua cơ sở dữ liệu dùng chung, cụ thể:"),
  bullet("Trang Web cho phép khách hàng tìm kiếm, lọc, xem chi tiết sách, quản lý giỏ hàng, đặt hàng, thanh toán khi nhận hàng hoặc thanh toán trực tuyến và theo dõi đơn hàng; giao diện responsive trên máy tính và điện thoại."),
  bullet("Ứng dụng quản trị hỗ trợ nhân viên tiếp nhận, xác nhận và cập nhật trạng thái giao hàng của đơn hàng; lập và hoàn thành phiếu nhập; theo dõi tồn kho và cảnh báo sách sắp hết."),
  bullet("Ứng dụng quản trị hỗ trợ Quản lý quản lý sách, danh mục (loại sách, tác giả, nhà xuất bản, nhà cung cấp), tài khoản khách hàng và nhân viên; xem dashboard, báo cáo doanh thu, thống kê sách bán chạy, báo cáo nhập – xuất – tồn và xuất Excel."),
  bullet("Dữ liệu được đồng bộ tức thời giữa hai thành phần: sách Quản lý thêm trên ứng dụng desktop hiển thị ngay trên Web, đơn hàng khách đặt trên Web xuất hiện ngay trong ứng dụng quản trị; số lượng tồn kho luôn nhất quán với đơn hàng và phiếu nhập."),
  bullet("Phân quyền rõ ràng theo vai trò; mã nguồn tổ chức phân lớp, tái sử dụng tầng nghiệp vụ giữa các thành phần."),
  H2("1.4. Đối tượng sử dụng hệ thống"),
  ...table(["Đối tượng", "Ứng dụng sử dụng", "Mô tả"], [
    ["Khách vãng lai", "Trang Web", "Người truy cập trang Web nhưng chưa đăng nhập."],
    ["Khách hàng", "Trang Web", "Người đã đăng ký và đăng nhập tài khoản trên trang Web."],
    ["Nhân viên", "Ứng dụng quản trị Desktop", "Nhân viên của nhà sách."],
    ["Quản lý", "Ứng dụng quản trị Desktop", "Chủ hoặc quản lý nhà sách, có toàn bộ quyền của Nhân viên."],
  ], [1900, 2200, CONTENT_W - 4100], "Đối tượng sử dụng hệ thống"),
  P("Chức năng cụ thể của từng đối tượng được trình bày ở Chương 3."),
  H2("1.5. Phạm vi hệ thống"),
  P("Hệ thống gồm hai thành phần liên kết với nhau, cùng phục vụ nghiệp vụ của nhà sách và dùng chung một cơ sở dữ liệu Microsoft SQL Server:"),
  bulletL("Trang Web người dùng (Blazor): ", "trang chủ, menu chức năng, danh mục sách, tìm kiếm và lọc sách, chi tiết sách, giỏ hàng, đặt hàng, thanh toán khi nhận hàng (COD) hoặc thanh toán trực tuyến qua VNPay ở môi trường thử nghiệm, theo dõi đơn hàng và quản lý thông tin cá nhân."),
  bulletL("Ứng dụng quản trị Desktop (WinUI 3, chạy trên Windows): ", "đăng nhập và phân quyền Nhân viên/Quản lý; thêm, xóa, sửa, xem, tìm kiếm sách và các danh mục (loại sách, tác giả, nhà xuất bản, nhà cung cấp); xử lý đơn hàng; quản lý kho và nhập hàng; quản lý tài khoản khách hàng và nhân viên; dashboard, báo cáo thống kê và xuất Excel."),
  bulletL("Web API cho ứng dụng quản trị: ", "ứng dụng Desktop lấy dữ liệu và thực hiện nghiệp vụ qua Web API thay vì kết nối trực tiếp đến cơ sở dữ liệu. Trang Web và Web API dùng chung tầng nghiệp vụ và tầng truy cập dữ liệu, nhờ đó mỗi quy tắc nghiệp vụ chỉ được cài đặt một lần."),
  P("Trong phạm vi hiện tại, hệ thống chưa triển khai các chức năng được đưa vào giai đoạn phát triển sau:"),
  bullet("Tích hợp API của đơn vị vận chuyển (GHN, GHTK) để tính phí và theo dõi vận đơn tự động; hiện tại phí vận chuyển tính theo mức cố định và nhân viên cập nhật trạng thái giao hàng thủ công."),
  bullet("Chương trình khuyến mãi, mã giảm giá, khách hàng thân thiết, tích điểm, hạng thành viên."),
  bullet("Đánh giá và bình luận sách."),
  bullet("Bán sách điện tử (ebook), bán sản phẩm ngoài sách như văn phòng phẩm, quà tặng."),
  bullet("Ứng dụng di động, chatbot tư vấn, gợi ý sách theo hành vi người dùng."),
  bullet("Quản lý nhiều chi nhánh, nhiều kho hàng."),
];

// ------------------------------------------------------------------ Chương 2
const ch2 = [
  H1("KHẢO SÁT CÔNG NGHỆ LIÊN QUAN"),
  P("Theo yêu cầu của đề tài, hệ thống gồm hai thành phần liên kết với nhau và dùng chung một cơ sở dữ liệu Microsoft SQL Server: (1) ứng dụng quản trị chạy trên Windows dành cho Nhân viên và Quản lý, (2) trang Web dành cho khách hàng. Chương này trình bày các công nghệ được nhóm khảo sát cho từng thành phần, kiến trúc tổng thể được lựa chọn và khảo sát một số hệ thống bán sách trực tuyến hiện có."),
  H2("2.1. Ngôn ngữ C# và nền tảng .NET"),
  P("C# là ngôn ngữ lập trình hướng đối tượng, kiểu dữ liệu tĩnh, do Microsoft phát triển. C# hỗ trợ đầy đủ các đặc trưng của lập trình hướng đối tượng (đóng gói, kế thừa, đa hình, trừu tượng), cùng các tính năng hiện đại như LINQ, lập trình bất đồng bộ async/await, generic, record và pattern matching."),
  P(".NET là nền tảng mã nguồn mở, đa nền tảng. Nhóm sử dụng .NET 8 – phiên bản hỗ trợ dài hạn (LTS) – cho toàn bộ các thành phần, nhờ đó ứng dụng desktop, Web API và Web dùng chung được các thư viện lớp (class library) chứa entity và nghiệp vụ."),
  H2("2.2. Công nghệ cho ứng dụng quản trị Desktop"),
  H3("2.2.1. Windows Forms"),
  P("Windows Forms là công nghệ xây dựng ứng dụng desktop truyền thống của .NET, thiết kế giao diện bằng cách kéo thả control và xử lý sự kiện trong code-behind. Ưu điểm là đơn giản, ổn định, nhiều tài liệu; hạn chế là giao diện mang phong cách cũ, khó tách giao diện khỏi xử lý và khó áp dụng mô hình MVVM."),
  H3("2.2.2. WinUI 3"),
  P("WinUI 3 là framework giao diện native mới nhất cho Windows, thuộc Windows App SDK. Giao diện được khai báo bằng XAML theo phong cách Fluent Design của Windows 11, có sẵn các control hiện đại như NavigationView, CommandBar, ContentDialog, InfoBar, NumberBox, CalendarDatePicker. WinUI 3 hỗ trợ data binding (x:Bind), phù hợp với mô hình MVVM (Model – View – ViewModel)."),
  P("Nhóm lựa chọn WinUI 3 cho ứng dụng quản trị theo khuyến khích của đề tài. Ứng dụng tổ chức theo MVVM với thư viện CommunityToolkit.Mvvm (ObservableObject, RelayCommand), dùng Microsoft.Extensions.DependencyInjection để quản lý ViewModel và service, và CommunityToolkit.WinUI DataGrid để hiển thị danh sách dữ liệu."),
  ...table(["Tiêu chí", "Windows Forms", "WinUI 3"], [
    ["Mức yêu cầu của đề tài", "Bắt buộc tối thiểu", "Khuyến khích (điểm sáng tạo)"],
    ["Giao diện", "Phong cách cũ", "Fluent Design, hiện đại"],
    ["Tách giao diện – xử lý", "Code-behind, khó tách", "XAML + MVVM, binding"],
    ["Độ khó", "Thấp", "Trung bình – cao"],
  ], [2600, 3000, 3471], "So sánh Windows Forms và WinUI 3"),
  H2("2.3. Công nghệ cho trang Web người dùng"),
  H3("2.3.1. ASP.NET Core MVC và Razor Pages"),
  P("ASP.NET Core MVC và Razor Pages sinh giao diện HTML ở phía máy chủ bằng cú pháp Razor. Mỗi thao tác của người dùng thường gửi một yêu cầu và tải lại trang; để cập nhật giỏ hàng không tải lại trang cần viết thêm JavaScript/AJAX."),
  H3("2.3.2. Blazor"),
  P("Blazor là framework xây dựng giao diện Web tương tác bằng C# thay cho JavaScript. Giao diện được chia thành các component (.razor) có thể tái sử dụng như thẻ sách, giỏ hàng mini, bộ lọc. Nhóm sử dụng Blazor Web App của .NET 8 với chế độ Interactive Server: các trang danh mục, chi tiết sách được render sẵn ở máy chủ (tốt cho SEO và tốc độ tải trang đầu), còn các thao tác như thêm vào giỏ, cập nhật số lượng, lọc sách theo loại và giá được xử lý tương tác qua kết nối SignalR mà không tải lại trang."),
  P("Blazor được chọn vì toàn bộ trang Web viết bằng C#, gọi trực tiếp tầng nghiệp vụ dùng chung qua Dependency Injection, và nằm trong nhóm công nghệ được đề tài khuyến khích. Giao diện sử dụng Bootstrap 5 để hỗ trợ responsive."),
  ...table(["Tiêu chí", "ASP.NET Core MVC", "Blazor (Interactive Server)"], [
    ["Ngôn ngữ phía giao diện", "Razor + JavaScript", "Razor component + C#"],
    ["Cập nhật giao diện không tải lại trang", "Cần AJAX/jQuery", "Có sẵn"],
    ["Tái sử dụng giao diện", "Partial view, view component", "Component có tham số, sự kiện"],
    ["Dùng chung mã với các thành phần khác", "Có", "Có, kể cả logic giao diện"],
  ], [3000, 2800, 3271], "So sánh ASP.NET Core MVC và Blazor"),
  H2("2.4. ASP.NET Core Web API"),
  P("ASP.NET Core Web API dùng để xây dựng các dịch vụ RESTful trả về dữ liệu JSON. Trong hệ thống, Web API là cầu nối giữa ứng dụng quản trị WinUI 3 và cơ sở dữ liệu: ứng dụng desktop không kết nối trực tiếp tới SQL Server mà gọi API qua HttpClient. Cách làm này giúp không phải lưu chuỗi kết nối cơ sở dữ liệu trên máy nhân viên, tập trung kiểm tra quyền tại một nơi và tái sử dụng cùng tầng nghiệp vụ với trang Web."),
  P("Xác thực giữa ứng dụng desktop và API sử dụng JWT (JSON Web Token): khi đăng nhập thành công, API trả về token chứa Role; các endpoint quản trị được bảo vệ bằng [Authorize(Roles = \"NhanVien,QuanLy\")]. Tài liệu API được sinh tự động bằng Swagger (Swashbuckle) để kiểm thử."),
  H2("2.5. Entity Framework Core và Microsoft SQL Server"),
  P("Entity Framework Core (EF Core) là ORM chính thức của .NET, cho phép thao tác cơ sở dữ liệu thông qua các lớp C# và truy vấn LINQ. Nhóm dùng phương pháp Code First: định nghĩa entity và DbContext trong một thư viện dùng chung, sinh và cập nhật lược đồ bằng Migrations. EF Core hỗ trợ transaction, đảm bảo việc tạo đơn hàng và trừ tồn kho diễn ra trọn vẹn."),
  P("Microsoft SQL Server là hệ quản trị cơ sở dữ liệu quan hệ được đề tài yêu cầu. SQL Server hỗ trợ đầy đủ ràng buộc toàn vẹn (khóa chính, khóa ngoại, UNIQUE, CHECK), chỉ mục, transaction và kiểu NVARCHAR lưu tiếng Việt. Cả trang Web và ứng dụng desktop (thông qua Web API) đều đọc ghi trên cùng một cơ sở dữ liệu này."),
  H2("2.6. Xác thực và phân quyền"),
  bulletL("Trang Web: ", "ASP.NET Core Identity được cấu hình với kho người dùng (user store) tùy biến ánh xạ trực tiếp vào hai bảng TaiKhoan và VaiTro do nhóm thiết kế, thay cho bộ bảng AspNetUsers / AspNetRoles mặc định; nhờ đó dữ liệu tài khoản vẫn nằm trong lược đồ chung của hệ thống. Identity đảm nhiệm việc băm mật khẩu (PBKDF2), khóa tài khoản 5 phút sau 5 lần đăng nhập sai liên tiếp (các cột SoLanDangNhapSai, ThoiDiemHetKhoa) và đặt lại mật khẩu bằng token gửi qua email với thời hạn 15 phút (các cột TokenDatLaiMatKhau, HanToken); phiên đăng nhập được giữ bằng cookie."),
  bulletL("Ứng dụng desktop: ", "đăng nhập qua Web API, nhận JWT; ứng dụng lưu token trong bộ nhớ và gắn vào header Authorization của mỗi yêu cầu. Chỉ tài khoản có Role NHÂN VIÊN hoặc QUẢN LÝ mới được đăng nhập; các chức năng chỉ dành cho Quản lý (quản lý sách, danh mục, nhân viên, báo cáo) bị ẩn với Nhân viên và bị API từ chối nếu gọi trực tiếp."),
  P("Hai cơ chế dùng chung bảng TaiKhoan và VaiTro trong cơ sở dữ liệu, nên một tài khoản nhân viên bị khóa trên ứng dụng quản trị sẽ bị khóa ở mọi nơi."),
  H2("2.7. Kiến trúc phân lớp và Dependency Injection"),
  P("Mã nguồn được tổ chức thành một solution gồm các project tách theo lớp, các project dùng chung được tham chiếu bởi cả Web và API (Hình 2.1):"),
  ...table(["Project", "Loại", "Vai trò"], [
    ["BookStore.Domain", "Class library", "Các lớp entity (Sach, DonHang…), enum trạng thái"],
    ["BookStore.Data", "Class library", "DbContext, cấu hình EF Core, Migrations, dữ liệu mẫu"],
    ["BookStore.Services", "Class library", "Nghiệp vụ: đặt hàng, tồn kho, nhập hàng, báo cáo; validation; DTO"],
    ["BookStore.Api", "ASP.NET Core Web API", "Endpoint REST cho ứng dụng quản trị, JWT, Swagger"],
    ["BookStore.Web", "Blazor Web App", "Trang Web cho khách hàng, Identity"],
    ["BookStore.Admin", "WinUI 3 (Windows App SDK)", "Ứng dụng quản trị cho Nhân viên, Quản lý (MVVM)"],
    ["BookStore.Tests", "xUnit", "Kiểm thử đơn vị tầng Services (EF Core InMemory/SQLite)"],
  ], [2300, 2400, 4371], "Các project trong solution"),
  ...figure("kientruc", "Kiến trúc tổng thể hệ thống", 560),
  P("Các service được đăng ký qua Dependency Injection có sẵn của .NET (AddScoped) ở Web và API; ở ứng dụng WinUI 3, ViewModel và lớp gọi API được đăng ký qua Microsoft.Extensions.Hosting. Nhờ đó các lớp phụ thuộc vào interface (IOrderService, IBookService…), dễ thay thế khi kiểm thử."),
  H2("2.8. Các dịch vụ và thư viện tích hợp"),
  bulletL("Cổng thanh toán VNPay (sandbox): ", "tạo URL thanh toán có chữ ký HMAC-SHA512, nhận kết quả qua Return URL và IPN, kiểm tra chữ ký trước khi cập nhật đơn hàng."),
  bulletL("MailKit (SMTP): ", "gửi email xác nhận đơn hàng và liên kết đặt lại mật khẩu."),
  bulletL("ClosedXML: ", "xuất báo cáo doanh thu ra tệp Excel từ ứng dụng quản trị."),
  bulletL("LiveCharts2 (WinUI): ", "vẽ biểu đồ doanh thu trên dashboard của ứng dụng quản trị."),
  bulletL("xUnit: ", "kiểm thử đơn vị các quy tắc nghiệp vụ như trừ và hoàn tồn kho, tính phí vận chuyển theo ngưỡng miễn phí, chuyển trạng thái đơn hàng."),
  H2("2.9. Công cụ hỗ trợ phát triển"),
  ...table(["Công cụ", "Mục đích sử dụng"], [
    ["Visual Studio 2022 (workload .NET desktop, ASP.NET, Windows App SDK)", "Lập trình WinUI 3, Blazor, Web API"],
    ["SQL Server 2022, SQL Server Management Studio", "Cài đặt và quản lý cơ sở dữ liệu"],
    ["Git, GitHub", "Quản lý mã nguồn, làm việc nhóm"],
    ["StarUML, draw.io", "Vẽ sơ đồ Use Case, Activity, ERD"],
    ["Figma", "Thiết kế layout giao diện Web và Desktop"],
    ["Swagger UI, Postman", "Kiểm thử Web API và callback thanh toán"],
  ], [4400, CONTENT_W - 4400], "Công cụ hỗ trợ phát triển"),
  H2("2.10. Khảo sát các hệ thống tương tự"),
  ...table(["Chức năng", "Fahasa.com", "Tiki.vn", "Hệ thống của nhóm"], [
    ["Tìm kiếm, lọc theo loại sách, giá", "Có", "Có", "Có"],
    ["Giỏ hàng, đặt hàng", "Có", "Có", "Có"],
    ["Thanh toán COD, ví điện tử, thẻ", "Có", "Có", "COD và VNPay (sandbox)"],
    ["Mã giảm giá", "Có", "Có", "Giai đoạn sau"],
    ["Theo dõi trạng thái đơn hàng", "Có", "Có", "Có"],
    ["Đánh giá sách đã mua", "Có", "Có", "Giai đoạn sau"],
    ["Tích điểm thành viên", "Có", "Có", "Giai đoạn sau"],
    ["Tích hợp đơn vị vận chuyển", "Có", "Có (tự vận hành)", "Giai đoạn sau"],
  ], [3000, 1700, 1700, 2671], "Khảo sát chức năng các hệ thống tương tự"),
  P("Qua khảo sát, nhóm xác định các chức năng cốt lõi của trang Web gồm: trang chủ, danh mục, tìm kiếm, chi tiết sách, giỏ hàng, đặt hàng, thanh toán và theo dõi đơn hàng. Các chức năng còn lại như mã giảm giá, đánh giá sách, tích điểm thành viên được xếp vào giai đoạn phát triển sau để tập trung hoàn thiện luồng mua hàng chính. Phía quản trị của các hệ thống trên đều là ứng dụng web nội bộ; theo yêu cầu đề tài, nhóm xây dựng phần này thành ứng dụng desktop WinUI 3 với các chức năng quản lý sách, đơn hàng, tồn kho, nhập hàng và báo cáo."),
  H2("2.11. Kết luận lựa chọn công nghệ"),
  ...table(["Thành phần", "Công nghệ"], [
    ["Ngôn ngữ, nền tảng", "C# 12, .NET 8"],
    ["Ứng dụng quản trị Desktop", "WinUI 3 (Windows App SDK), MVVM – CommunityToolkit.Mvvm, LiveCharts2"],
    ["Trang Web người dùng", "Blazor Web App (Interactive Server), Bootstrap 5"],
    ["Chia sẻ nghiệp vụ, dữ liệu", "ASP.NET Core Web API, JWT, Swagger"],
    ["Truy cập dữ liệu", "Entity Framework Core 8 (Code First, Migrations)"],
    ["Cơ sở dữ liệu", "Microsoft SQL Server 2022 (dùng chung cho Web và Desktop)"],
    ["Kiến trúc", "Phân lớp Domain – Data – Services – Presentation, Dependency Injection"],
    ["Xác thực", "ASP.NET Core Identity (Web), JWT (Desktop)"],
    ["Tích hợp, kiểm thử", "VNPay sandbox, MailKit, ClosedXML, xUnit"],
  ], [3000, CONTENT_W - 3000], "Công nghệ sử dụng"),
];

// ------------------------------------------------------------------ Chương 3
const FUNCS = [
  ["3.2.2.1. Chức năng dùng chung (Web và Desktop)", [
    ["Đăng ký tài khoản", "Chức năng Đăng ký tài khoản cho phép Khách vãng lai tạo tài khoản khách hàng. Chức năng giúp khách hàng có thể đặt hàng và theo dõi đơn hàng."],
    ["Đăng nhập trang Web", "Chức năng cho phép Khách hàng đăng nhập trang Web bằng tài khoản đã đăng ký để mua hàng."],
    ["Đăng nhập ứng dụng quản trị", "Chức năng cho phép Nhân viên, Quản lý đăng nhập ứng dụng Desktop. Chức năng kiểm tra tài khoản, xác định Role và chỉ hiển thị các chức năng tương ứng với quyền."],
    ["Đăng xuất", "Chức năng Đăng xuất cho phép người dùng kết thúc phiên làm việc trên hệ thống."],
    ["Quên mật khẩu", "Chức năng Quên mật khẩu cho phép khách hàng đặt lại mật khẩu thông qua liên kết được gửi đến email đã đăng ký."],
    ["Đổi mật khẩu", "Chức năng Đổi mật khẩu cho phép người dùng thay đổi mật khẩu khi đã đăng nhập."],
  ]],
  ["3.2.2.2. Tìm kiếm và xem sách (Web)", [
    ["Xem danh sách sách", "Chức năng Xem danh sách sách cho phép người dùng xem các sách đang kinh doanh theo trang, theo loại sách hoặc sách mới, sách bán chạy."],
    ["Tra cứu sách", "Chức năng Tra cứu sách cho phép người dùng tìm sách theo tên sách, tác giả hoặc loại sách, hỗ trợ nhanh chóng xác định sách cần mua."],
    ["Lọc sách", "Chức năng Lọc sách cho phép người dùng lọc kết quả theo loại sách, khoảng giá, nhà xuất bản và sắp xếp theo giá, mới nhất hoặc bán chạy."],
    ["Xem chi tiết sách", "Chức năng Xem chi tiết sách cho phép người dùng xem đầy đủ thông tin của sách và tình trạng còn hàng."],
  ]],
  ["3.2.2.3. Giỏ hàng (Web)", [
    ["Xem giỏ hàng", "Chức năng Xem giỏ hàng cho phép Khách hàng xem các sách đã chọn, số lượng, thành tiền và tạm tính."],
    ["Thêm sách vào giỏ hàng", "Chức năng Thêm sách vào giỏ hàng cho phép Khách hàng chọn sách và số lượng muốn mua."],
    ["Cập nhật số lượng trong giỏ", "Chức năng Cập nhật số lượng cho phép Khách hàng thay đổi số lượng của sách trong giỏ hàng."],
    ["Xóa sách khỏi giỏ hàng", "Chức năng Xóa sách khỏi giỏ hàng cho phép Khách hàng bỏ sách không muốn mua."],
  ]],
  ["3.2.2.4. Đặt hàng và thanh toán (Web)", [
    ["Đặt hàng", "Chức năng Đặt hàng cho phép Khách hàng tạo đơn hàng từ giỏ hàng với thông tin giao hàng và phương thức thanh toán."],
    ["Thanh toán trực tuyến", "Chức năng Thanh toán trực tuyến cho phép Khách hàng thanh toán đơn hàng qua cổng VNPay."],
    ["Theo dõi đơn hàng", "Chức năng Theo dõi đơn hàng cho phép Khách hàng xem trạng thái và lịch sử xử lý của đơn hàng."],
    ["Xem lịch sử đơn hàng", "Chức năng Xem lịch sử đơn hàng cho phép Khách hàng xem danh sách các đơn hàng đã đặt."],
    ["Hủy đơn hàng", "Chức năng Hủy đơn hàng cho phép Khách hàng hủy đơn hàng khi đơn chưa được nhà sách xác nhận."],
  ]],
  ["3.2.2.5. Tài khoản khách hàng (Web)", [
    ["Xem, cập nhật thông tin cá nhân", "Chức năng cho phép Khách hàng xem và thay đổi họ tên, số điện thoại, ngày sinh, giới tính."],
    ["Quản lý địa chỉ giao hàng", "Chức năng cho phép Khách hàng thêm, sửa, xóa và chọn địa chỉ giao hàng mặc định."],
  ]],
  ["3.2.2.6. Quản lý sách và danh mục (Desktop)", [
    ["Thêm, cập nhật, tra cứu, xem thông tin, xóa, xem danh sách sách", "Các chức năng quản lý sách cho phép Quản lý lưu trữ, cập nhật và tra cứu thông tin sách được kinh doanh trên website. Sách đã phát sinh giao dịch chỉ được chuyển sang trạng thái Ngừng kinh doanh thay vì xóa."],
    ["Quản lý loại sách", "Chức năng cho phép Quản lý thêm, cập nhật, tra cứu, xóa loại sách dùng để phân loại sách."],
    ["Quản lý tác giả, nhà xuất bản", "Chức năng cho phép Quản lý quản lý danh mục tác giả và nhà xuất bản để gán cho sách."],
    ["Quản lý nhà cung cấp", "Chức năng cho phép Quản lý quản lý thông tin nhà cung cấp phục vụ việc lập phiếu nhập."],
  ]],
  ["3.2.2.7. Quản lý đơn hàng (Desktop)", [
    ["Xem danh sách, tra cứu, xem chi tiết đơn hàng", "Các chức năng cho phép Nhân viên theo dõi đơn hàng theo trạng thái, thời gian, khách hàng."],
    ["Xác nhận đơn hàng", "Chức năng Xác nhận đơn hàng cho phép Nhân viên kiểm tra và chấp nhận xử lý đơn hàng mới."],
    ["Cập nhật trạng thái giao hàng", "Chức năng cho phép Nhân viên cập nhật đơn hàng sang Đang giao hoặc Hoàn thành; trường hợp giao thất bại, đơn hàng được chuyển sang Đã hủy kèm lý do và số lượng tồn kho được hoàn lại."],
    ["Hủy đơn hàng", "Chức năng cho phép Nhân viên hủy đơn hàng không hợp lệ, hệ thống hoàn lại tồn kho."],
    ["In hóa đơn", "Chức năng In hóa đơn cho phép Nhân viên in hóa đơn bán hàng kèm theo gói hàng."],
  ]],
  ["3.2.2.8. Quản lý kho và nhập hàng (Desktop)", [
    ["Tra cứu tồn kho", "Chức năng Tra cứu tồn kho cho phép Nhân viên xem số lượng tồn hiện tại của sách."],
    ["Thiết lập ngưỡng và xem cảnh báo hết hàng", "Chức năng cho phép thiết lập ngưỡng tồn tối thiểu cho từng sách và xem danh sách sách dưới ngưỡng."],
    ["Lập, sửa, hoàn thành, tra cứu, xem, xóa phiếu nhập", "Các chức năng quản lý phiếu nhập. Phiếu nhập chỉ cộng vào tồn kho khi được Hoàn thành; phiếu đã hoàn thành không thể sửa hoặc xóa."],
  ]],
  ["3.2.2.9. Quản lý khách hàng và nhân viên (Desktop)", [
    ["Quản lý khách hàng", "Chức năng cho phép Quản lý xem danh sách, tra cứu, xem thông tin, lịch sử mua hàng và khóa/mở khóa tài khoản khách hàng."],
    ["Quản lý nhân viên", "Chức năng cho phép Quản lý thêm, cập nhật nhân viên, cấp tài khoản và khóa/mở khóa tài khoản nhân viên."],
  ]],
  ["3.2.2.10. Báo cáo và thống kê (Desktop)", [
    ["Xem báo cáo doanh thu", "Chức năng cho phép Quản lý xem doanh thu theo ngày, tháng, năm và xuất ra Excel."],
    ["Xem thống kê sách bán chạy", "Chức năng cho phép Quản lý xem danh sách sách có số lượng bán cao nhất."],
    ["Xem báo cáo nhập – xuất – tồn", "Chức năng cho phép Quản lý theo dõi số lượng nhập, bán và tồn của sách trong kỳ."],
    ["Xem thống kê đơn hàng theo trạng thái", "Chức năng cho phép Quản lý theo dõi số đơn hàng mới, đang giao, hoàn thành, đã hủy."],
  ]],
];

const SUBSYS = [
  ["uc_chung", "3.2.4.1. Chức năng dùng chung", "chung"],
  ["uc_timsach", "3.2.4.2. Subsystem Tìm kiếm và xem sách", "timsach"],
  ["uc_giohang", "3.2.4.3. Subsystem Giỏ hàng", "giohang"],
  ["uc_dathang", "3.2.4.4. Subsystem Đặt hàng và thanh toán", "dathang"],
  ["uc_taikhoan", "3.2.4.5. Subsystem Tài khoản khách hàng", "taikhoan"],
  ["uc_sach", "3.2.4.6. Subsystem Quản lý sách và danh mục", "sach"],
  ["uc_donhang", "3.2.4.7. Subsystem Quản lý đơn hàng", "donhang"],
  ["uc_kho", "3.2.4.8. Subsystem Quản lý kho và nhập hàng", "kho"],
  ["uc_nguoidung", "3.2.4.9. Subsystem Quản lý khách hàng và nhân viên", "nguoidung"],
  ["uc_baocao", "3.2.4.10. Subsystem Báo cáo và thống kê", "baocao"],
];
const UC_NOTE = {
  chung: "Đăng ký, Đăng nhập trang Web và Quên mật khẩu thực hiện trên trang Web; Đăng nhập ứng dụng quản trị thực hiện trên ứng dụng Desktop; Đăng xuất và Đổi mật khẩu có ở cả hai. Use case Quên mật khẩu mở rộng (extend) use case Đăng nhập trang Web.",
  timsach: "Các use case thực hiện trên trang Web. Use case Lọc sách mở rộng (extend) use case Tra cứu sách.",
  giohang: "Các use case thực hiện trên trang Web.",
  dathang: "Các use case thực hiện trên trang Web. Use case Thanh toán trực tuyến mở rộng (extend) use case Đặt hàng: chỉ thực hiện khi Khách hàng chọn phương thức thanh toán VNPay.",
  taikhoan: "Các use case thực hiện trên trang Web.",
  sach: "Các use case thực hiện trên ứng dụng quản trị Desktop.",
  donhang: "Các use case thực hiện trên ứng dụng quản trị Desktop. Quản lý kế thừa toàn bộ use case của Nhân viên nên cũng thực hiện được các use case trong subsystem này.",
  kho: "Các use case thực hiện trên ứng dụng quản trị Desktop. Quản lý kế thừa toàn bộ use case của Nhân viên nên cũng thực hiện được các use case trong subsystem này.",
  nguoidung: "Các use case thực hiện trên ứng dụng quản trị Desktop.",
  baocao: "Các use case thực hiện trên ứng dụng quản trị Desktop. Use case Xuất báo cáo ra Excel mở rộng (extend) use case Xem báo cáo doanh thu.",
};

const STORIES = [
  ["Epic 1: Tài khoản (trang Web)", [
    ["US01", "Là khách vãng lai, tôi muốn đăng ký tài khoản bằng email để có thể đặt mua sách.", "Email và tên đăng nhập không trùng; mật khẩu tối thiểu 8 ký tự; đăng ký xong chuyển sang trang Đăng nhập.", "Cao"],
    ["US02", "Là người dùng, tôi muốn đăng nhập để sử dụng các chức năng theo vai trò của mình.", "Sai thông tin hiển thị thông báo; tài khoản bị khóa không đăng nhập được; chuyển trang theo Role.", "Cao"],
    ["US03", "Là khách hàng, tôi muốn đặt lại mật khẩu qua email khi quên mật khẩu để không bị mất tài khoản.", "Liên kết đặt lại có hiệu lực 15 phút và chỉ dùng một lần.", "Trung bình"],
  ]],
  ["Epic 2: Danh mục và tìm kiếm sách (trang Web)", [
    ["US04", "Là khách hàng, tôi muốn tìm sách theo tên hoặc tác giả để nhanh chóng tìm được sách cần mua.", "Tìm không phân biệt hoa thường; kết quả có phân trang 20 sách/trang; chỉ hiển thị sách đang kinh doanh.", "Cao"],
    ["US05", "Là khách hàng, tôi muốn lọc sách theo loại và khoảng giá để thu hẹp kết quả.", "Có thể kết hợp nhiều bộ lọc với từ khóa tìm kiếm; có sắp xếp theo giá, mới nhất, bán chạy.", "Trung bình"],
    ["US06", "Là khách hàng, tôi muốn xem chi tiết sách để quyết định có mua hay không.", "Hiển thị giá, tình trạng còn hàng, mô tả, tác giả, nhà xuất bản, năm xuất bản.", "Cao"],
  ]],
  ["Epic 3: Giỏ hàng (trang Web)", [
    ["US07", "Là khách hàng, tôi muốn thêm sách vào giỏ hàng để mua nhiều sách trong một lần đặt.", "Sách đã có trong giỏ thì cộng dồn; không vượt quá số lượng tồn; biểu tượng giỏ cập nhật ngay.", "Cao"],
    ["US08", "Là khách hàng, tôi muốn thay đổi số lượng hoặc xóa sách trong giỏ để điều chỉnh đơn hàng trước khi đặt.", "Tạm tính được cập nhật không cần tải lại trang; giỏ hàng được lưu cho lần đăng nhập sau.", "Cao"],
  ]],
  ["Epic 4: Đặt hàng và thanh toán (trang Web)", [
    ["US09", "Là khách hàng, tôi muốn đặt hàng với địa chỉ giao hàng đã lưu để không phải nhập lại mỗi lần.", "Địa chỉ mặc định được điền sẵn; có thể chọn địa chỉ khác hoặc nhập mới.", "Cao"],
    ["US10", "Là khách hàng, tôi muốn thanh toán qua VNPay để không phải chuẩn bị tiền mặt.", "Thanh toán thành công thì đơn chuyển sang Chờ xác nhận; thất bại được thanh toán lại trong 30 phút.", "Trung bình"],
    ["US11", "Là khách hàng, tôi muốn nhận email xác nhận sau khi đặt hàng để lưu lại thông tin đơn.", "Email chứa mã đơn, danh sách sách, tổng tiền, địa chỉ giao hàng.", "Thấp"],
    ["US12", "Là khách hàng, tôi muốn theo dõi trạng thái đơn hàng để biết khi nào nhận được sách.", "Hiển thị trạng thái hiện tại và thời điểm của từng lần thay đổi trạng thái.", "Cao"],
    ["US13", "Là khách hàng, tôi muốn hủy đơn hàng chưa được xác nhận khi đổi ý.", "Chỉ hủy được ở trạng thái Chờ thanh toán, Chờ xác nhận; tồn kho được hoàn lại.", "Trung bình"],
  ]],
  ["Epic 5: Quản trị bán hàng (ứng dụng Desktop)", [
    ["US14", "Là nhân viên, tôi muốn xem danh sách đơn hàng mới để xử lý kịp thời.", "Lọc theo trạng thái, ngày đặt; đơn Chờ xác nhận được đánh dấu nổi bật.", "Cao"],
    ["US15", "Là nhân viên, tôi muốn xác nhận và cập nhật trạng thái giao hàng để khách hàng nắm được tiến độ.", "Chỉ cho phép chuyển trạng thái theo đúng quy trình; khách hàng nhận email khi trạng thái thay đổi.", "Cao"],
    ["US16", "Là quản lý, tôi muốn thêm và cập nhật sách để website luôn có thông tin chính xác.", "Giá bán lớn hơn 0; ảnh bìa định dạng JPG/PNG tối đa 2MB; giá mới không ảnh hưởng đơn đã đặt.", "Cao"],
  ]],
  ["Epic 6: Kho và nhập hàng (ứng dụng Desktop)", [
    ["US17", "Là nhân viên, tôi muốn được cảnh báo khi sách sắp hết để nhập hàng kịp thời.", "Danh sách cảnh báo gồm sách có tồn kho nhỏ hơn hoặc bằng ngưỡng cảnh báo.", "Trung bình"],
    ["US18", "Là nhân viên, tôi muốn lập phiếu nhập và chỉ cộng tồn kho khi đã nhận đủ hàng để tồn kho phản ánh đúng thực tế.", "Phiếu ở trạng thái Chờ nhập không ảnh hưởng tồn kho; phiếu Đã hoàn thành không sửa, xóa được.", "Cao"],
  ]],
  ["Epic 7: Báo cáo (ứng dụng Desktop)", [
    ["US19", "Là quản lý, tôi muốn xem doanh thu theo tháng để đánh giá tình hình kinh doanh.", "Chỉ tính đơn Hoàn thành; có biểu đồ và xuất được Excel.", "Cao"],
    ["US20", "Là quản lý, tôi muốn xem top sách bán chạy để lên kế hoạch nhập hàng.", "Chọn được khoảng thời gian, loại sách và số lượng Top N.", "Trung bình"],
  ]],
];

const RULES = [
  ["BR01", "Chỉ Khách hàng đã đăng nhập mới được thêm sách vào giỏ hàng và đặt hàng."],
  ["BR02", "Số lượng sách đặt mua không được vượt quá số lượng tồn kho tại thời điểm đặt hàng."],
  ["BR03", "Số lượng tồn kho được trừ ngay khi đơn hàng được tạo và được hoàn lại khi đơn hàng bị hủy hoặc giao thất bại."],
  ["BR04", "Đơn giá trong chi tiết đơn hàng được lưu tại thời điểm đặt; việc thay đổi giá bán sau đó không ảnh hưởng đơn đã đặt."],
  ["BR05", "Đơn thanh toán trực tuyến không được thanh toán trong 30 phút sẽ tự động chuyển sang Đã hủy."],
  ["BR06", "Khách hàng chỉ được hủy đơn hàng ở trạng thái Chờ thanh toán hoặc Chờ xác nhận."],
  ["BR07", "Phí vận chuyển cố định 25.000đ; miễn phí vận chuyển cho đơn hàng có tạm tính từ 300.000đ."],
  ["BR08", "Phiếu nhập chỉ cộng vào tồn kho khi được Hoàn thành; phiếu Đã hoàn thành không được sửa hoặc xóa."],
  ["BR09", "Sách đã phát sinh đơn hàng hoặc phiếu nhập không được xóa khỏi cơ sở dữ liệu, chỉ chuyển sang Ngừng kinh doanh."],
  ["BR10", "Doanh thu chỉ được tính từ các đơn hàng ở trạng thái Hoàn thành."],
];

// Mô hình vật lý: [cột, kiểu, ràng buộc, mô tả]
const PK = "PK, IDENTITY", NN = "NOT NULL";
const PHYS = [
  ["VaiTro", "Vai trò người dùng", [
    ["MaVaiTro", "INT", PK, "Mã vai trò"], ["TenVaiTro", "NVARCHAR(50)", "NOT NULL, UNIQUE", "KHÁCH HÀNG, NHÂN VIÊN, QUẢN LÝ"]]],
  ["TaiKhoan", "Tài khoản đăng nhập", [
    ["MaTaiKhoan", "INT", PK, "Mã tài khoản"], ["TenDangNhap", "VARCHAR(50)", "NOT NULL, UNIQUE", "Tên đăng nhập"],
    ["Email", "VARCHAR(100)", "NOT NULL, UNIQUE", "Email"], ["MatKhauHash", "VARCHAR(255)", NN, "Mật khẩu đã băm"],
    ["MaVaiTro", "INT", "FK → VaiTro, NOT NULL", "Vai trò"], ["TrangThai", "TINYINT", "NOT NULL, DEFAULT 1", "1: hoạt động, 0: bị khóa"],
    ["SoLanDangNhapSai", "TINYINT", "NOT NULL, DEFAULT 0", "Số lần đăng nhập sai liên tiếp"],
    ["ThoiDiemHetKhoa", "DATETIME2", "NULL", "Thời điểm hết khóa tạm (NULL nếu không bị khóa)"],
    ["TokenDatLaiMatKhau", "VARCHAR(255)", "NULL", "Token đặt lại mật khẩu gửi qua email"],
    ["HanToken", "DATETIME2", "NULL", "Thời hạn của token đặt lại mật khẩu"],
    ["NgayTao", "DATETIME2", "NOT NULL, DEFAULT GETDATE()", "Ngày tạo"]]],
  ["KhachHang", "Thông tin khách hàng", [
    ["MaKH", "INT", PK, "Mã khách hàng"], ["MaTaiKhoan", "INT", "FK → TaiKhoan, UNIQUE", "Tài khoản của khách hàng"],
    ["HoTen", "NVARCHAR(100)", NN, "Họ tên"], ["SoDienThoai", "VARCHAR(15)", NN, "Số điện thoại"],
    ["NgaySinh", "DATE", "NULL", "Ngày sinh"], ["GioiTinh", "NVARCHAR(10)", "NULL", "Giới tính"]]],
  ["DiaChiGiaoHang", "Địa chỉ giao hàng của khách hàng", [
    ["MaDiaChi", "INT", PK, "Mã địa chỉ"], ["MaKH", "INT", "FK → KhachHang, NOT NULL", "Khách hàng"],
    ["TenNguoiNhan", "NVARCHAR(100)", NN, "Tên người nhận"], ["SoDienThoai", "VARCHAR(15)", NN, "SĐT người nhận"],
    ["DiaChi", "NVARCHAR(255)", NN, "Số nhà, đường, phường/xã, quận/huyện, tỉnh/thành"], ["MacDinh", "BIT", "NOT NULL, DEFAULT 0", "Địa chỉ mặc định"]]],
  ["NhanVien", "Thông tin nhân viên", [
    ["MaNV", "INT", PK, "Mã nhân viên"], ["MaTaiKhoan", "INT", "FK → TaiKhoan, UNIQUE", "Tài khoản của nhân viên"],
    ["HoTen", "NVARCHAR(100)", NN, "Họ tên"], ["SoDienThoai", "VARCHAR(15)", NN, "Số điện thoại"],
    ["ChucVu", "NVARCHAR(50)", NN, "Chức vụ"], ["NgayVaoLam", "DATE", NN, "Ngày vào làm"]]],
  ["LoaiSach", "Loại sách", [
    ["MaLoai", "INT", PK, "Mã loại sách"], ["TenLoai", "NVARCHAR(100)", "NOT NULL, UNIQUE", "Tên loại sách"], ["MoTa", "NVARCHAR(500)", "NULL", "Mô tả"]]],
  ["TacGia", "Tác giả", [
    ["MaTacGia", "INT", PK, "Mã tác giả"], ["TenTacGia", "NVARCHAR(100)", NN, "Tên tác giả"], ["TieuSu", "NVARCHAR(MAX)", "NULL", "Tiểu sử"]]],
  ["NhaXuatBan", "Nhà xuất bản", [
    ["MaNXB", "INT", PK, "Mã nhà xuất bản"], ["TenNXB", "NVARCHAR(150)", "NOT NULL, UNIQUE", "Tên nhà xuất bản"],
    ["DiaChi", "NVARCHAR(255)", "NULL", "Địa chỉ"], ["SoDienThoai", "VARCHAR(15)", "NULL", "Số điện thoại"]]],
  ["Sach", "Sách", [
    ["MaSach", "INT", PK, "Mã sách"], ["TenSach", "NVARCHAR(255)", NN, "Tên sách"],
    ["MaLoai", "INT", "FK → LoaiSach, NOT NULL", "Loại sách"], ["MaNXB", "INT", "FK → NhaXuatBan, NOT NULL", "Nhà xuất bản"],
    ["NamXuatBan", "SMALLINT", "NULL", "Năm xuất bản"], ["SoTrang", "INT", "NULL, CHECK > 0", "Số trang"],
    ["GiaBan", "DECIMAL(18,0)", "NOT NULL, CHECK > 0", "Giá bán hiện tại"], ["SoLuongTon", "INT", "NOT NULL, DEFAULT 0, CHECK ≥ 0", "Số lượng tồn kho"],
    ["NguongCanhBao", "INT", "NOT NULL, DEFAULT 5", "Ngưỡng cảnh báo hết hàng"], ["MoTa", "NVARCHAR(MAX)", "NULL", "Mô tả nội dung"],
    ["AnhBia", "VARCHAR(255)", "NULL", "Đường dẫn ảnh bìa"], ["TrangThai", "TINYINT", "NOT NULL, DEFAULT 1", "1: đang kinh doanh, 0: ngừng kinh doanh"]]],
  ["Sach_TacGia", "Liên kết sách – tác giả (n-n)", [
    ["MaSach", "INT", "PK, FK → Sach", "Sách"], ["MaTacGia", "INT", "PK, FK → TacGia", "Tác giả"]]],
  ["NhaCungCap", "Nhà cung cấp", [
    ["MaNCC", "INT", PK, "Mã nhà cung cấp"], ["TenNCC", "NVARCHAR(150)", NN, "Tên nhà cung cấp"],
    ["DiaChi", "NVARCHAR(255)", "NULL", "Địa chỉ"], ["SoDienThoai", "VARCHAR(15)", NN, "Số điện thoại"], ["Email", "VARCHAR(100)", "NULL", "Email"]]],
  ["PhieuNhap", "Phiếu nhập", [
    ["MaPN", "INT", PK, "Mã phiếu nhập"], ["MaNCC", "INT", "FK → NhaCungCap, NOT NULL", "Nhà cung cấp"],
    ["MaNV", "INT", "FK → NhanVien, NOT NULL", "Nhân viên lập phiếu"], ["NgayLap", "DATETIME2", NN, "Ngày lập"],
    ["NgayHoanThanh", "DATETIME2", "NULL", "Ngày hoàn thành"], ["TongTien", "DECIMAL(18,0)", "NOT NULL, CHECK ≥ 0", "Tổng tiền nhập"],
    ["TrangThai", "TINYINT", "NOT NULL, DEFAULT 0", "0: chờ nhập, 1: đã hoàn thành"]]],
  ["CTPhieuNhap", "Chi tiết phiếu nhập", [
    ["MaPN", "INT", "PK, FK → PhieuNhap", "Phiếu nhập"], ["MaSach", "INT", "PK, FK → Sach", "Sách"],
    ["SoLuong", "INT", "NOT NULL, CHECK > 0", "Số lượng nhập"], ["GiaNhap", "DECIMAL(18,0)", "NOT NULL, CHECK > 0", "Giá nhập"]]],
  ["GioHang", "Giỏ hàng", [
    ["MaGioHang", "INT", PK, "Mã giỏ hàng"], ["MaKH", "INT", "FK → KhachHang, UNIQUE", "Khách hàng sở hữu"], ["NgayCapNhat", "DATETIME2", NN, "Lần cập nhật cuối"]]],
  ["CTGioHang", "Chi tiết giỏ hàng", [
    ["MaGioHang", "INT", "PK, FK → GioHang", "Giỏ hàng"], ["MaSach", "INT", "PK, FK → Sach", "Sách"], ["SoLuong", "INT", "NOT NULL, CHECK > 0", "Số lượng"]]],
  ["DonHang", "Đơn hàng", [
    ["MaDH", "INT", PK, "Mã đơn hàng"], ["MaKH", "INT", "FK → KhachHang, NOT NULL", "Khách hàng đặt"],
    ["MaNV", "INT", "FK → NhanVien, NULL", "Nhân viên xử lý"],
    ["NgayDat", "DATETIME2", NN, "Ngày đặt"], ["TenNguoiNhan", "NVARCHAR(100)", NN, "Tên người nhận"],
    ["SoDienThoaiNhan", "VARCHAR(15)", NN, "SĐT người nhận"], ["DiaChiGiao", "NVARCHAR(255)", NN, "Địa chỉ giao hàng"],
    ["TamTinh", "DECIMAL(18,0)", NN, "Tổng tiền sách"],
    ["PhiVanChuyen", "DECIMAL(18,0)", "NOT NULL, DEFAULT 0", "Phí vận chuyển"], ["TongTien", "DECIMAL(18,0)", NN, "TamTinh + PhiVanChuyen"],
    ["PhuongThucTT", "VARCHAR(10)", "NOT NULL, CHECK IN ('COD','VNPAY')", "Phương thức thanh toán"],
    ["TrangThai", "TINYINT", NN, "0: chờ thanh toán, 1: chờ xác nhận, 2: đã xác nhận, 3: đang giao, 4: hoàn thành, 5: đã hủy"],
    ["GhiChu", "NVARCHAR(500)", "NULL", "Ghi chú, lý do hủy"]]],
  ["CTDonHang", "Chi tiết đơn hàng", [
    ["MaDH", "INT", "PK, FK → DonHang", "Đơn hàng"], ["MaSach", "INT", "PK, FK → Sach", "Sách"],
    ["SoLuong", "INT", "NOT NULL, CHECK > 0", "Số lượng"], ["DonGia", "DECIMAL(18,0)", "NOT NULL, CHECK > 0", "Đơn giá tại thời điểm đặt"]]],
  ["LichSuDonHang", "Lịch sử thay đổi trạng thái đơn hàng", [
    ["MaLichSu", "INT", PK, "Mã lịch sử"], ["MaDH", "INT", "FK → DonHang, NOT NULL", "Đơn hàng"],
    ["TrangThai", "TINYINT", NN, "Trạng thái mới"], ["ThoiGian", "DATETIME2", NN, "Thời điểm thay đổi"],
    ["NguoiThucHien", "INT", "FK → TaiKhoan, NULL", "Tài khoản thực hiện (NULL nếu hệ thống tự động)"]]],
  ["ThanhToan", "Giao dịch thanh toán", [
    ["MaTT", "INT", PK, "Mã giao dịch"], ["MaDH", "INT", "FK → DonHang, NOT NULL", "Đơn hàng"],
    ["SoTien", "DECIMAL(18,0)", "NOT NULL, CHECK > 0", "Số tiền"], ["PhuongThuc", "VARCHAR(10)", NN, "COD hoặc VNPAY"],
    ["MaGiaoDich", "VARCHAR(100)", "NULL", "Mã giao dịch của cổng thanh toán"], ["TrangThai", "TINYINT", NN, "0: chờ, 1: thành công, 2: thất bại"],
    ["ThoiGian", "DATETIME2", NN, "Thời điểm giao dịch"]]],
];

// Lược đồ quan hệ mức luận lý: khóa chính gạch chân, khóa ngoại in nghiêng có dấu #
function relSchema(name, cols) {
  const parts = [run(name, { bold: true }), run("(")];
  cols.forEach(([c, , rb], i) => {
    if (c.startsWith("(")) return;
    const isPK = rb.startsWith("PK"), isFK = rb.includes("FK");
    if (i > 0) parts.push(run(", "));
    parts.push(run((isFK ? "#" : "") + c, { underline: isPK ? {} : undefined, italics: isFK }));
  });
  parts.push(run(")"));
  return bullet(parts);
}

const SCREENS_WEB = [
  ["W01", "Trang chủ", "Khách", "Menu, banner, danh mục, sách mới, sách bán chạy, tìm kiếm"],
  ["W02", "Danh sách / kết quả tìm kiếm", "Khách", "Lọc theo loại, giá; sắp xếp; phân trang"],
  ["W03", "Chi tiết sách", "Khách", "Thông tin sách, mô tả, thêm vào giỏ"],
  ["W04", "Đăng nhập, Đăng ký, Quên mật khẩu", "Khách", "Xác thực khách hàng"],
  ["W05", "Giỏ hàng và đặt hàng", "Khách hàng", "Cập nhật giỏ, thông tin giao hàng, thanh toán"],
  ["W06", "Kết quả thanh toán", "Khách hàng", "Thông báo đặt hàng / thanh toán thành công hoặc thất bại"],
  ["W07", "Tài khoản của tôi", "Khách hàng", "Thông tin cá nhân, địa chỉ, lịch sử và chi tiết đơn hàng"],
];
const SCREENS_DESKTOP = [
  ["D01", "Đăng nhập", "Nhân viên, Quản lý", "Nhập tài khoản / mật khẩu, kiểm tra quyền truy cập"],
  ["D02", "Tổng quan (Dashboard)", "Nhân viên, Quản lý", "Đơn chờ xác nhận, doanh thu hôm nay, cảnh báo tồn kho"],
  ["D03", "Quản lý sách", "Quản lý", "Danh sách, tìm kiếm, thêm, sửa, xóa sách"],
  ["D04", "Quản lý danh mục", "Quản lý", "Loại sách, tác giả, nhà xuất bản, nhà cung cấp"],
  ["D05", "Quản lý đơn hàng", "Nhân viên, Quản lý", "Danh sách, lọc, chi tiết, xác nhận, cập nhật giao hàng, in hóa đơn"],
  ["D06", "Quản lý kho, nhập hàng", "Nhân viên, Quản lý", "Tồn kho, cảnh báo, lập / hoàn thành phiếu nhập"],
  ["D07", "Quản lý khách hàng, nhân viên", "Quản lý", "Danh sách, chi tiết, cấp tài khoản, khóa / mở khóa"],
  ["D08", "Báo cáo thống kê", "Quản lý", "Doanh thu, sách bán chạy, nhập – xuất – tồn, xuất Excel"],
];

const ch3 = [
  H1("PHÂN TÍCH HỆ THỐNG"),
  H2("3.1. Phân tích nghiệp vụ"),
  H3("3.1.1. Bối cảnh nghiệp vụ (Business context)"),
  P("Hệ thống là trung tâm kết nối giữa nhà sách với khách hàng và các đối tác bên ngoài. Hình 3.1 thể hiện các đối tượng tương tác với hệ thống và luồng thông tin chính giữa chúng."),
  ...figure("context", "Sơ đồ ngữ cảnh nghiệp vụ của hệ thống"),
  ...table(["Đối tượng", "Vai trò trong nghiệp vụ"], [
    ["Khách vãng lai, Khách hàng", "Qua trang Web: tìm kiếm sách, đặt hàng, thanh toán, theo dõi đơn hàng."],
    ["Nhân viên", "Qua ứng dụng quản trị Desktop: xác nhận đơn hàng, cập nhật trạng thái giao hàng; lập và hoàn thành phiếu nhập."],
    ["Quản lý", "Qua ứng dụng quản trị Desktop: quản lý danh mục sách, giá bán, tài khoản; theo dõi báo cáo."],
    ["Nhà cung cấp", "Cung cấp sách cho nhà sách theo phiếu nhập (đối tượng bên ngoài, không đăng nhập hệ thống)."],
    ["Cổng thanh toán VNPay", "Xử lý giao dịch thanh toán trực tuyến và gửi kết quả về hệ thống."],
    ["Đơn vị vận chuyển", "Nhận hàng từ nhà sách và giao cho khách; trạng thái giao hàng do nhân viên cập nhật vào hệ thống."],
    ["Dịch vụ Email", "Gửi email xác nhận đơn hàng, thông báo trạng thái và đặt lại mật khẩu."],
  ], [2800, CONTENT_W - 2800], "Các đối tượng trong bối cảnh nghiệp vụ"),
  H3("3.1.2. Quy trình đặt hàng trực tuyến"),
  P("Quy trình bắt đầu khi khách hàng tìm sách trên website và kết thúc khi khách hàng nhận được thông báo đặt hàng thành công (Hình 3.2):"),
  bullet("Khách hàng tìm kiếm và xem chi tiết sách. Khi khách hàng chọn Thêm sách vào giỏ hàng, hệ thống kiểm tra đăng nhập theo quy tắc BR01: khách chưa đăng nhập được chuyển sang giao diện Đăng nhập / Đăng ký, sau đó quay lại thao tác đang thực hiện."),
  bullet("Khách hàng xem giỏ hàng, chọn Đặt hàng, nhập thông tin giao hàng và chọn phương thức thanh toán."),
  bullet("Hệ thống kiểm tra lại số lượng tồn kho tại thời điểm đặt (BR02); nếu có sách không đủ số lượng, hệ thống cập nhật lại giỏ hàng, thông báo cho khách hàng và quay lại bước đặt hàng."),
  bullet("Hệ thống tính tiền, tạo đơn hàng, trừ tồn kho và làm rỗng giỏ hàng trong cùng một transaction."),
  bullet("Nếu chọn VNPay, khách hàng được chuyển sang cổng thanh toán; kết quả được gửi về hệ thống để cập nhật trạng thái thanh toán. Khi giao dịch không thành công, khách hàng được thanh toán lại trong vòng 30 phút; quá thời hạn, đơn hàng tự động chuyển sang Đã hủy và tồn kho được hoàn lại (BR05)."),
  bullet("Hệ thống gửi email xác nhận và thông báo đặt hàng thành công."),
  ...figure("wf_dathang", "Sơ đồ hoạt động quy trình đặt hàng trực tuyến", 560, 640),
  H3("3.1.3. Quy trình xử lý và giao đơn hàng"),
  P("Sau khi được tạo, đơn hàng trải qua các trạng thái được mô tả trong Hình 3.3. Chỉ các chuyển trạng thái trong sơ đồ mới được hệ thống cho phép; mỗi lần chuyển trạng thái được lưu vào lịch sử đơn hàng và thông báo cho khách hàng."),
  ...figure("state_donhang", "Sơ đồ trạng thái đơn hàng"),
  ...table(["Trạng thái", "Ý nghĩa", "Người thực hiện chuyển tiếp"], [
    ["Chờ thanh toán", "Đơn VNPay đã tạo nhưng chưa thanh toán thành công", "Hệ thống (theo kết quả từ cổng thanh toán)"],
    ["Chờ xác nhận", "Đơn COD mới hoặc đơn VNPay đã thanh toán", "Nhân viên"],
    ["Đã xác nhận", "Nhà sách đã nhận xử lý, đang đóng gói", "Nhân viên"],
    ["Đang giao", "Đã bàn giao cho đơn vị vận chuyển", "Nhân viên"],
    ["Hoàn thành", "Khách hàng đã nhận hàng (đơn COD được ghi nhận đã thu tiền)", "—"],
    ["Đã hủy", "Đơn bị khách hàng hủy, nhân viên từ chối, quá hạn thanh toán hoặc giao thất bại; tồn kho được hoàn lại", "—"],
  ], [1900, 4300, 2871], "Các trạng thái của đơn hàng"),
  P("Hệ thống không dùng một trạng thái riêng cho trường hợp giao hàng không thành công. Khi đơn vị vận chuyển giao không thành công, Nhân viên nhập lý do và đơn hàng được chuyển sang Đã hủy: lý do được lưu vào cột GhiChu của đơn hàng cùng một bản ghi trong bảng LichSuDonHang, đồng thời số lượng tồn kho được hoàn lại theo quy tắc BR03. Cách làm này giữ số trạng thái của đơn hàng ở mức tối thiểu mà vẫn truy vết được nguyên nhân hủy đơn."),
  H3("3.1.4. Quy trình nhập hàng và quản lý tồn kho"),
  P("Phiếu nhập được lập ở trạng thái Chờ nhập và chỉ cộng vào tồn kho khi nhân viên xác nhận Hoàn thành sau khi đã đối chiếu hàng thực nhận, nhờ đó số lượng tồn luôn khớp với hàng thực tế trong kho (Hình 3.4). Hệ thống chủ động cảnh báo các sách có số lượng tồn nhỏ hơn hoặc bằng ngưỡng cảnh báo để nhân viên lập phiếu nhập kịp thời."),
  ...figure("wf_nhaphang", "Sơ đồ hoạt động quy trình nhập hàng", 520, 560),
  H3("3.1.5. Quy tắc nghiệp vụ"),
  ...table(["Mã", "Quy tắc"], RULES.map((r, i) => ["BR" + String(i + 1).padStart(2, "0"), r[1]]),
    [900, CONTENT_W - 900], "Các quy tắc nghiệp vụ"),

  H2("3.2. Phân tích chức năng"),
  H3("3.2.1. Tác nhân của hệ thống"),
  P("Hệ thống có bốn tác nhân chính là Khách vãng lai, Khách hàng, Nhân viên, Quản lý và một tác nhân hệ thống ngoài là Cổng thanh toán. Khách hàng, Nhân viên được tổng quát hóa thành Người dùng (có tài khoản); Quản lý kế thừa toàn bộ chức năng của Nhân viên (Hình 3.5). Khách vãng lai và Khách hàng sử dụng trang Web; Nhân viên và Quản lý sử dụng ứng dụng quản trị Desktop."),
  ...figure("actors", "Quan hệ giữa các tác nhân", 440),
  H3("3.2.2. Danh sách chức năng"),
  P("Phần này trình bày khái quát các chức năng chính của hệ thống theo từng nhóm nghiệp vụ; tên nhóm ghi rõ chức năng thuộc trang Web hay ứng dụng quản trị Desktop. Các tác nhân, điều kiện, luồng xử lý và các trường hợp cụ thể của từng chức năng được trình bày chi tiết trong phần đặc tả use case."),
  ...FUNCS.flatMap(([title, items]) => [H4(title), ...items.map(([n, d]) => bulletL(n + ": ", d))]),
  H3("3.2.3. Phân rã hệ thống thành các subsystem"),
  P("Dựa trên các nhóm chức năng đã xác định, hệ thống được phân rã thành các subsystem tương ứng với từng nhóm nghiệp vụ. Việc phân rã giúp tổ chức các chức năng có liên quan vào cùng một nhóm, tạo thuận lợi cho việc xây dựng use case diagram, đặc tả use case và tổ chức mã nguồn theo module ở giai đoạn cài đặt. Năm subsystem đầu thuộc trang Web, năm subsystem sau thuộc ứng dụng quản trị Desktop (Hình 3.6)."),
  ...figure("phanra", "Sơ đồ phân rã chức năng của hệ thống"),
  H3("3.2.4. Use case diagram và đặc tả use case"),
  ...SUBSYS.flatMap(([img, title, key]) => [
    H4(title),
    ...figure(img, "Use case diagram " + title.replace(/^[\d.]+\s/, "").replace(/^Subsystem /, "").toLowerCase(), 520, 600),
    ...(UC_NOTE[key] ? [P(UC_NOTE[key], { run: { italics: true } })] : []),
    ...UC[key].flatMap(ucSpec),
  ]),
  H3("3.2.5. User story"),
  P("Bên cạnh đặc tả use case, nhóm mô tả yêu cầu dưới dạng user story theo cách tiếp cận của dự án CoolStore Microservices: mỗi user story có dạng “Là <vai trò>, tôi muốn <mục tiêu> để <lợi ích>”, được nhóm theo Epic và kèm theo tiêu chí chấp nhận (acceptance criteria) làm cơ sở kiểm thử. Độ ưu tiên được dùng để sắp xếp thứ tự cài đặt ở giai đoạn sau."),
  ...(() => { let n = 0; return STORIES.flatMap(([epic, rows]) => [H4(epic),
    ...table(["Mã", "User story", "Tiêu chí chấp nhận", "Ưu tiên"],
      rows.map((r) => ["US" + String(++n).padStart(2, "0"), ...r.slice(1)]), [800, 3600, 3571, 1100])]); })(),

  H2("3.3. Phân tích dữ liệu"),
  P("Trang Web và ứng dụng quản trị Desktop sử dụng chung một cơ sở dữ liệu SQL Server. Lược đồ dưới đây chứa toàn bộ thông tin dùng chung cho cả hai thành phần: sách và danh mục do Quản lý cập nhật trên Desktop được hiển thị trên Web; giỏ hàng, đơn hàng do Khách hàng tạo trên Web được Nhân viên xử lý trên Desktop; bảng TaiKhoan, VaiTro dùng để xác thực ở cả hai nơi."),
  H3("3.3.1. Mô hình dữ liệu mức ý niệm"),
  P("Mô hình mức ý niệm mô tả các thực thể chính và mối quan hệ giữa chúng, độc lập với hệ quản trị cơ sở dữ liệu (Hình 3.17). Mỗi thực thể được biểu diễn bằng một khung gồm tên thực thể và danh sách thuộc tính, trong đó thuộc tính định danh được gạch chân; các thuộc tính khóa ngoại chưa xuất hiện ở mức này vì liên kết giữa các thực thể được thể hiện bằng mối quan hệ. Mỗi mối quan hệ được ghi kèm tên và bản số ở hai đầu; những mối quan hệ n – n có thuộc tính riêng (số lượng, đơn giá, giá nhập) được ghi trong ngoặc ngay dưới tên mối quan hệ và sẽ trở thành các bảng trung gian ở mức luận lý."),
  ...figure("erd", "Mô hình thực thể – mối quan hệ mức ý niệm"),
  ...table(["Mối quan hệ", "Bản số", "Diễn giải"], [
    ["VaiTro – TaiKhoan", "1 – n", "Mỗi tài khoản thuộc một vai trò; một vai trò có nhiều tài khoản."],
    ["TaiKhoan – KhachHang / NhanVien", "1 – 1", "Mỗi khách hàng, nhân viên có đúng một tài khoản."],
    ["KhachHang – DiaChiGiaoHang", "1 – n", "Khách hàng lưu nhiều địa chỉ giao hàng."],
    ["KhachHang – GioHang", "1 – 1", "Mỗi khách hàng có một giỏ hàng."],
    ["GioHang – Sach", "n – n", "Giỏ hàng chứa nhiều sách; tách thành CTGioHang."],
    ["KhachHang – DonHang", "1 – n", "Khách hàng đặt nhiều đơn hàng."],
    ["DonHang – Sach", "n – n", "Đơn hàng gồm nhiều sách; tách thành CTDonHang lưu số lượng, đơn giá."],
    ["NhanVien – DonHang", "1 – n", "Nhân viên xử lý nhiều đơn hàng."],
    ["DonHang – ThanhToan", "1 – n", "Một đơn có thể có nhiều lần giao dịch (thanh toán lại khi thất bại)."],
    ["NhaCungCap – PhieuNhap", "1 – n", "Nhà cung cấp cung cấp hàng cho nhiều phiếu nhập."],
    ["NhanVien – PhieuNhap", "1 – n", "Nhân viên lập nhiều phiếu nhập."],
    ["PhieuNhap – Sach", "n – n", "Phiếu nhập gồm nhiều sách; tách thành CTPhieuNhap."],
    ["Sach – LoaiSach / NhaXuatBan", "n – 1", "Mỗi sách thuộc một loại sách và một nhà xuất bản."],
    ["Sach – TacGia", "n – n", "Một sách có thể có nhiều tác giả; tách thành Sach_TacGia."],
  ], [3100, 1100, 4871], "Các mối quan hệ giữa thực thể"),
  H3("3.3.2. Mô hình dữ liệu mức luận lý"),
  P("Từ mô hình mức ý niệm, nhóm chuyển các mối quan hệ n – n thành bảng trung gian, bổ sung bảng LichSuDonHang để lưu vết thay đổi trạng thái và thu được lược đồ quan hệ sau (khóa chính được gạch chân, khóa ngoại in nghiêng có dấu #)."),
  ...PHYS.map(([name, , cols]) => relSchema(name, cols)),
  P("Kiểm tra dạng chuẩn:", { run: { bold: true } }),
  bulletL("1NF: ", "mọi thuộc tính đều nguyên tố; danh sách tác giả của sách được tách thành bảng Sach_TacGia thay vì lưu chuỗi nhiều tác giả; địa chỉ giao hàng được tách thành bảng DiaChiGiaoHang."),
  bulletL("2NF: ", "các bảng có khóa chính gồm nhiều cột (CTDonHang, CTPhieuNhap, CTGioHang, Sach_TacGia) chỉ chứa thuộc tính phụ thuộc vào toàn bộ khóa (SoLuong, DonGia, GiaNhap); thông tin sách như tên, giá bán hiện tại nằm ở bảng Sach."),
  bulletL("3NF: ", "không có phụ thuộc bắc cầu: tên loại sách, tên nhà xuất bản, thông tin khách hàng được tham chiếu qua khóa ngoại thay vì lưu lặp lại. CTDonHang.DonGia và thông tin người nhận trong DonHang là dữ liệu lịch sử tại thời điểm đặt hàng (không phụ thuộc giá hay địa chỉ hiện tại) nên không vi phạm 3NF. Các cột TongTien, TamTinh được lưu có chủ đích để giữ đúng số tiền đã thanh toán và tăng tốc báo cáo; giá trị được tầng nghiệp vụ tính và kiểm tra khi tạo đơn."),
  H3("3.3.3. Mô hình dữ liệu mức vật lý"),
  P("Cơ sở dữ liệu được triển khai trên Microsoft SQL Server. Các bảng được sinh bằng EF Core Code First; chuỗi tiếng Việt dùng kiểu NVARCHAR, tiền tệ dùng DECIMAL(18,0) (đơn vị đồng), thời gian dùng DATETIME2. Ngoài khóa chính, hệ thống tạo chỉ mục cho các cột thường dùng để tìm kiếm và lọc: Sach(TenSach), Sach(MaLoai), DonHang(MaKH, NgayDat), DonHang(TrangThai)."),
  P("Hình 3.18 là lược đồ cơ sở dữ liệu ở mức vật lý, thể hiện toàn bộ 19 bảng cùng khóa chính (gạch chân), khóa ngoại (ký hiệu #) và các liên kết khóa ngoại giữa các bảng. Để lược đồ dễ đọc, mỗi bảng chỉ liệt kê các cột khóa; danh sách đầy đủ cột, kiểu dữ liệu và ràng buộc của từng bảng được trình bày ngay sau đó."),
  ...figure("db_vatly", "Lược đồ cơ sở dữ liệu mức vật lý", 600, 860),
  P("Mọi đơn hàng đều phát sinh bản ghi trong bảng ThanhToan để thống nhất cách theo dõi dòng tiền: đơn VNPay tạo bản ghi ở trạng thái Chờ ngay khi khách hàng được chuyển sang cổng thanh toán, sau đó được cập nhật thành Thành công hoặc Thất bại theo kết quả trả về; đơn COD tạo bản ghi ở trạng thái Chờ khi đơn hàng được tạo và chuyển sang Thành công khi Nhân viên xác nhận đã thu tiền lúc đơn hàng Hoàn thành."),
  ...PHYS.flatMap(([name, desc, cols]) => table(["Tên cột", "Kiểu dữ liệu", "Ràng buộc", "Mô tả"], cols, [1900, 1700, 2500, 2971], `${name} – ${desc}`)),

  H2("3.4. Phân tích giao diện"),
  P("Hệ thống có hai bộ giao diện. Trang Web được thiết kế theo phong cách website thương mại điện tử, có thanh tiêu đề cố định gồm logo, menu, ô tìm kiếm, giỏ hàng và tài khoản, bố cục co giãn theo màn hình (responsive). Ứng dụng quản trị Desktop theo phong cách Fluent của Windows 11: menu điều hướng NavigationView bên trái tương ứng các subsystem, mỗi màn hình quản lý có thanh lệnh (Thêm, Sửa, Xóa, Làm mới), ô tìm kiếm, bảng dữ liệu và khung nhập liệu. Các wireframe dưới đây thể hiện layout dự kiến của toàn bộ các màn hình đã liệt kê."),
  H3("3.4.1. Giao diện trang Web người dùng"),
  ...table(["Mã", "Màn hình", "Người dùng", "Nội dung chính"], SCREENS_WEB, [800, 2900, 1900, 3471], "Danh sách màn hình trang Web"),
  H4("a) Màn hình Trang chủ"),
  P("Hiển thị danh mục loại sách và bộ lọc giá bên trái, banner sách nổi bật và danh sách sách dạng lưới bên phải. Mỗi sách hiển thị ảnh bìa, tên, tác giả, giá và nút Thêm vào giỏ."),
  ...figure("wf_home", "Wireframe màn hình Trang chủ"),
  H4("b) Màn hình Danh sách và kết quả tìm kiếm"),
  P("Trình bày danh sách sách theo loại hoặc kết quả tìm kiếm theo từ khóa. Cột bên trái gồm các bộ lọc loại sách, khoảng giá và nhà xuất bản kèm số lượng sách tương ứng; khu vực bên phải hiển thị số lượng kết quả, tùy chọn sắp xếp, lưới sách và thanh phân trang. Khi không có kết quả phù hợp, hệ thống thông báo và gợi ý một số sách bán chạy."),
  ...figure("wf_list", "Wireframe màn hình Danh sách và kết quả tìm kiếm"),
  H4("c) Màn hình Chi tiết sách"),
  P("Hiển thị ảnh bìa, thông tin sách, giá, tình trạng còn hàng, bộ chọn số lượng, nút Thêm vào giỏ hàng, Mua ngay và khu vực mô tả sách."),
  ...figure("wf_detail", "Wireframe màn hình Chi tiết sách"),
  H4("d) Màn hình Đăng nhập, Đăng ký và Quên mật khẩu"),
  P("Ba chức năng dùng chung một bố cục: khung nhập liệu đặt giữa trang, bên dưới là liên kết chuyển sang chức năng còn lại. Lỗi xác thực hiển thị ngay dưới ô nhập tương ứng; sau 5 lần đăng nhập sai liên tiếp, tài khoản bị tạm khóa 5 phút. Chức năng Quên mật khẩu dùng cùng khung này để nhập email nhận liên kết đặt lại mật khẩu."),
  ...figure("wf_login", "Wireframe màn hình Đăng nhập"),
  H4("e) Màn hình Giỏ hàng và đặt hàng"),
  P("Gồm danh sách sách trong giỏ với khả năng thay đổi số lượng, xóa sách và khung thông tin đặt hàng: người nhận, địa chỉ, phương thức thanh toán, tạm tính, phí vận chuyển và tổng cộng."),
  ...figure("wf_cart", "Wireframe màn hình Giỏ hàng và đặt hàng"),
  H4("f) Màn hình Kết quả thanh toán"),
  P("Hiển thị kết quả sau khi đặt hàng hoặc sau khi nhận kết quả trả về từ cổng thanh toán. Trường hợp thành công, màn hình hiển thị mã đơn hàng, tổng tiền, phương thức thanh toán, thông tin giao hàng cùng hai lối đi tiếp là Xem đơn hàng và Tiếp tục mua sắm. Trường hợp thanh toán không thành công (phần khung nét đứt), màn hình thông báo lý do, cho biết thời gian còn lại để thanh toán lại và cho phép khách hàng hủy đơn."),
  ...figure("wf_result", "Wireframe màn hình Kết quả thanh toán"),
  H4("g) Màn hình Tài khoản của tôi"),
  P("Khu vực tài khoản của khách hàng, gồm menu bên trái dẫn tới thông tin cá nhân, sổ địa chỉ giao hàng, lịch sử đơn hàng và đổi mật khẩu. Nội dung bên phải minh họa danh sách đơn hàng đã đặt kèm bộ lọc theo trạng thái và thời gian; chọn một đơn sẽ mở phần chi tiết gồm các sách đã mua, tạm tính, phí vận chuyển, tổng cộng và thông tin người nhận. Đơn ở trạng thái Chờ thanh toán hoặc Chờ xác nhận có thêm thao tác Hủy."),
  ...figure("wf_account", "Wireframe màn hình Tài khoản của tôi"),
  H3("3.4.2. Giao diện ứng dụng quản trị Desktop"),
  ...table(["Mã", "Màn hình", "Người dùng", "Nội dung chính"], SCREENS_DESKTOP, [800, 2900, 1900, 3471], "Danh sách màn hình ứng dụng quản trị"),
  H4("a) Màn hình Đăng nhập"),
  P("Màn hình đầu tiên khi mở ứng dụng. Người dùng nhập tài khoản, mật khẩu; ứng dụng gọi Web API để kiểm tra và chỉ cho phép tài khoản có Role Nhân viên hoặc Quản lý truy cập. Thông báo lỗi hiển thị ngay dưới ô nhập."),
  ...figure("wf_dk_login", "Wireframe màn hình Đăng nhập ứng dụng quản trị", 520),
  H4("b) Màn hình Tổng quan (Dashboard)"),
  P("Hiển thị các chỉ số trong ngày, biểu đồ doanh thu 7 ngày và danh sách sách sắp hết hàng, có lối tắt lập phiếu nhập. Menu bên trái ẩn các mục chỉ dành cho Quản lý khi người đăng nhập là Nhân viên."),
  ...figure("wf_dk_dashboard", "Wireframe màn hình Tổng quan"),
  H4("c) Màn hình Quản lý sách"),
  P("Mẫu chung cho các màn hình quản lý danh mục: ô tìm kiếm và bộ lọc, thanh lệnh Thêm / Sửa / Xóa / Làm mới, bảng dữ liệu bên trái và khung thông tin bên phải. Chọn một dòng sẽ nạp dữ liệu vào khung để sửa; trường bắt buộc được kiểm tra trước khi Lưu; thao tác Xóa yêu cầu xác nhận qua hộp thoại."),
  ...figure("wf_dk_books", "Wireframe màn hình Quản lý sách"),
  H4("d) Màn hình Quản lý danh mục"),
  P("Dùng chung bố cục với màn hình Quản lý sách nhưng gom bốn danh mục Loại sách, Tác giả, Nhà xuất bản và Nhà cung cấp vào bốn thẻ (tab). Mỗi thẻ có ô tìm kiếm, thanh lệnh, bảng dữ liệu và khung thông tin để thêm hoặc sửa. Danh mục đang được sách tham chiếu không xóa được; hệ thống hiển thị cảnh báo thay vì thực hiện xóa."),
  ...figure("wf_dk_cat", "Wireframe màn hình Quản lý danh mục"),
  H4("e) Màn hình Quản lý đơn hàng"),
  P("Cho phép nhân viên tìm kiếm, lọc đơn hàng theo trạng thái và thời gian, rồi xử lý đơn hàng đang chọn bằng thanh lệnh. Các nút chỉ được bật khi chuyển trạng thái hợp lệ theo sơ đồ trạng thái đơn hàng."),
  ...figure("wf_dk_orders", "Wireframe màn hình Quản lý đơn hàng"),
  H4("f) Màn hình Quản lý kho và nhập hàng"),
  P("Gồm hai thẻ: thẻ Tồn kho liệt kê số lượng còn lại và ngưỡng cảnh báo của từng sách, thẻ Phiếu nhập quản lý các phiếu nhập hàng. Khung bên phải hiển thị chi tiết phiếu đang chọn gồm các dòng sách, số lượng, giá nhập và tổng tiền. Chỉ phiếu ở trạng thái Chờ nhập mới sửa, xóa hoặc hoàn thành được; khi Hoàn thành, hệ thống cộng số lượng vào tồn kho và khóa phiếu theo quy tắc BR08."),
  ...figure("wf_dk_stock", "Wireframe màn hình Quản lý kho và nhập hàng"),
  H4("g) Màn hình Quản lý khách hàng và nhân viên"),
  P("Gồm hai thẻ Khách hàng và Nhân viên dùng chung bố cục: ô tìm kiếm, bộ lọc trạng thái, bảng danh sách và khung thông tin chi tiết bên phải. Quản lý xem được thông tin liên hệ, ngày tạo tài khoản, tổng số đơn của khách hàng và khóa hoặc mở khóa tài khoản; tài khoản bị khóa không đăng nhập được trang Web. Thẻ Nhân viên bổ sung thao tác thêm nhân viên và cấp tài khoản thuộc vai trò Nhân viên hoặc Quản lý."),
  ...figure("wf_dk_users", "Wireframe màn hình Quản lý khách hàng và nhân viên"),
  H4("h) Màn hình Báo cáo doanh thu"),
  P("Hiển thị các chỉ số tổng hợp và biểu đồ doanh thu theo thời gian đã chọn, cho phép xuất báo cáo ra tệp Excel."),
  ...figure("wf_dk_report", "Wireframe màn hình Báo cáo doanh thu"),
];

const refs = [
  new Paragraph({ heading: HeadingLevel.HEADING_1, pageBreakBefore: true, alignment: AlignmentType.CENTER, children: [run("TÀI LIỆU THAM KHẢO")] }),
  ...[
    "Vietnam Devs, CoolStore Microservices – Model microservices, https://vietnam-devs.github.io/coolstore-microservices/model-microservices/",
    "Đỗ Như Tài (2026), Đề tài môn Ngôn ngữ lập trình C#, Trường Đại học Sài Gòn.",
    "Microsoft, WinUI 3 / Windows App SDK documentation, https://learn.microsoft.com/windows/apps/winui/winui3/",
    "Microsoft, ASP.NET Core Blazor documentation, https://learn.microsoft.com/aspnet/core/blazor",
    "Microsoft, ASP.NET Core Web API documentation, https://learn.microsoft.com/aspnet/core/web-api",
    "Microsoft, CommunityToolkit.Mvvm documentation, https://learn.microsoft.com/dotnet/communitytoolkit/mvvm/",
    "Microsoft, Entity Framework Core documentation, https://learn.microsoft.com/ef/core",
    "Microsoft, SQL Server documentation, https://learn.microsoft.com/sql/sql-server",
    "VNPay, Tài liệu tích hợp cổng thanh toán VNPay, https://sandbox.vnpayment.vn/apis/",
    "Fahasa.com, Tiki.vn – các website bán sách trực tuyến được khảo sát.",
  ].map((t, i) => P(`[${i + 1}] ${t}`, { indent: false, align: AlignmentType.LEFT })),
];

// ------------------------------------------------------------------ document
const doc = new Document({
  creator: "Nhóm 12", title: "Hệ thống quản lý và bán sách trực tuyến – Báo cáo GD1",
  features: { updateFields: true },
  styles: {
    default: { document: { run: { font: FONT, size: 26 } } },
    paragraphStyles: [
      { id: "Heading1", name: "Heading 1", basedOn: "Normal", next: "Normal", quickFormat: true,
        run: { size: 32, bold: true, font: FONT, color: "000000" }, paragraph: { spacing: { before: 240, after: 360 }, outlineLevel: 0 } },
      { id: "Heading2", name: "Heading 2", basedOn: "Normal", next: "Normal", quickFormat: true,
        run: { size: 28, bold: true, font: FONT, color: "000000" }, paragraph: { spacing: { before: 240, after: 120 }, outlineLevel: 1, keepNext: true } },
      { id: "Heading3", name: "Heading 3", basedOn: "Normal", next: "Normal", quickFormat: true,
        run: { size: 26, bold: true, font: FONT, color: "000000" }, paragraph: { spacing: { before: 200, after: 100 }, outlineLevel: 2, keepNext: true } },
      { id: "Heading4", name: "Heading 4", basedOn: "Normal", next: "Normal", quickFormat: true,
        run: { size: 26, bold: true, italics: true, font: FONT, color: "000000" }, paragraph: { spacing: { before: 160, after: 80 }, outlineLevel: 3, keepNext: true } },
      ...[1, 2, 3].map((i) => ({
        id: "TOC" + i, name: "toc " + i, basedOn: "Normal", next: "Normal",
        run: { size: 26, font: FONT, color: "000000" },
        paragraph: { spacing: { after: 60, line: 312 } },
      })),
    ],
  },
  numbering: { config: [{ reference: "bullets", levels: [
    { level: 0, format: LevelFormat.BULLET, text: "–", alignment: AlignmentType.LEFT, style: { paragraph: { indent: { left: 720, hanging: 360 } } } },
    { level: 1, format: LevelFormat.BULLET, text: "+", alignment: AlignmentType.LEFT, style: { paragraph: { indent: { left: 1080, hanging: 360 } } } },
  ] }] },
  sections: [
    {
      properties: { page: {
        size: { width: 11906, height: 16838 }, margin: { top: 1134, bottom: 1134, left: 1701, right: 1134 },
        borders: {
          pageBorderTop: { style: BorderStyle.THICK_THIN_MEDIUM_GAP, size: 24, color: "1F3864", space: 24 },
          pageBorderBottom: { style: BorderStyle.THIN_THICK_MEDIUM_GAP, size: 24, color: "1F3864", space: 24 },
          pageBorderLeft: { style: BorderStyle.THICK_THIN_MEDIUM_GAP, size: 24, color: "1F3864", space: 24 },
          pageBorderRight: { style: BorderStyle.THIN_THICK_MEDIUM_GAP, size: 24, color: "1F3864", space: 24 },
        },
      } },
      children: cover,
    },
    {
      properties: { page: { size: { width: 11906, height: 16838 }, margin: { top: 1134, bottom: 1134, left: 1701, right: 1134 },
        pageNumbers: { start: 1 } } },
      footers: { default: new Footer({ children: [new Paragraph({ alignment: AlignmentType.CENTER,
        children: [new TextRun({ children: [PageNumber.CURRENT], font: FONT, size: 24 })] })] }) },
      children: [
        new Paragraph({ alignment: AlignmentType.CENTER, spacing: { after: 240 }, children: [run("MỤC LỤC", { bold: true, size: 32 })] }),
        new TableOfContents("Mục lục", { hyperlink: true, headingStyleRange: "1-3" }),
        ...ch1, ...ch2, ...ch3, ...refs,
      ],
    },
  ],
});

const JSZip = require("jszip");
Packer.toBuffer(doc)
  .then((buf) => JSZip.loadAsync(buf))
  .then(async (zip) => {
    const theme = await zip.file("word/theme/theme1.xml").async("string");
    zip.file("word/theme/theme1.xml", theme.replace(/<a:latin typeface="[^"]*"/g, `<a:latin typeface="${FONT}"`));
    return zip.generateAsync({ type: "nodebuffer", compression: "DEFLATE" });
  })
  .then((buf) => { fs.writeFileSync(OUT, buf); console.log("written", OUT, buf.length); });
