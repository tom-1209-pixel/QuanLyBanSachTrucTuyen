# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Bối cảnh đồ án

- Đồ án môn **Ngôn ngữ lập trình C#** – Trường ĐH Sài Gòn, Khoa CNTT. GVGD: **TS. Đỗ Như Tài**. **Nhóm 12** (số nhóm đúng là 12, không phải 10 – chốt 2026-10-30), gồm **3 thành viên**: Phạm Hoàng Sang – 3124411256 (GitHub `tom-1209-pixel`), Võ Trần Hải Đăng – 3124411069 (`dangvotranhai-dot`), Ngô Hồ Đăng Khoa – 3124411130 (`khoango6688-collab`).
- Đề tài: **Hệ thống quản lý và bán sách trực tuyến**. Nội bộ: kế thừa kết quả phân tích từ đồ án PTTK HĐT "Hệ thống quản lý nhà sách" của nhóm, nhưng **báo cáo không được nhắc tới đồ án cũ** (theo yêu cầu người dùng, 2026-10-23) – trình bày như một đề tài độc lập.
- Hiện **chưa có mã nguồn**. Đang ở GD1 (báo cáo phân tích).

## Đã hoàn thành

- **2026-10-22 – Báo cáo GD1** `QuanLyBanSachTrucTuyen_GD1.docx`: bìa, mục lục; Ch.1 Tổng quan; Ch.2 Khảo sát công nghệ (WinForms/WinUI 3, MVC/Blazor, Web API, EF Core, kiến trúc 7 project + hình kiến trúc, khảo sát Fahasa/Tiki); Ch.3 Phân tích: sơ đồ ngữ cảnh, quy trình đặt hàng, sơ đồ trạng thái đơn, quy trình nhập hàng, quy tắc nghiệp vụ, subsystem, use case diagram, đặc tả use case, user story theo 7 Epic, ERD mức ý niệm, lược đồ luận lý, kiểm tra 1NF/2NF/3NF, bảng mức vật lý, 5 wireframe Web + 5 wireframe Desktop (WinUI 3); tài liệu tham khảo.
- **2026-10-23 – Sửa Chương 1 và thu hẹp phạm vi** (72 trang): 1.1.1 bỏ nhắc đồ án PTTK cũ; 1.1.3 viết lại theo hướng vấn đề → giải pháp → lợi ích, không nhắc môn học; 1.2 bỏ vấn đề khuyến mãi; 1.4 cột Mô tả rút còn 1 dòng định danh; 1.5 sửa "Web API dùng chung" → "Web API cho ứng dụng quản trị" (tên cũ sai so với kiến trúc) và rút gọn danh sách tính năng. **Gỡ khuyến mãi và đánh giá sách khỏi toàn bộ hệ thống** (Ch.1, Ch.2, Ch.3, ERD, use case, wireframe) – hai tính năng này chuyển sang mục "giai đoạn phát triển sau". Bỏ mọi tham chiếu đồ án PTTK cũ kể cả ở tài liệu tham khảo. Mã US và BR giờ **sinh tự động** trong `build.js` nên không còn lệch số khi thêm/bớt dòng.
- **2026-10-30 – Sửa báo cáo GD1 theo bản rà soát** (76 trang): Hình 3.2 vẽ lại cho khớp BR01 (kiểm tra đăng nhập ngay khi Thêm vào giỏ) và bổ sung nhánh không đủ tồn kho, nhánh thanh toán VNPay không thành công; `usecase_diagram()` đã vẽ được quan hệ «extend» (sửa luôn lỗi `uc_chung` trỏ sai use case: Quên mật khẩu mở rộng Đăng nhập trang Web, không phải Đăng nhập ứng dụng quản trị); ERD mức ý niệm vẽ lại đầy đủ thuộc tính, khóa gạch chân, thuộc tính của quan hệ n–n; thêm **Hình 3.18 Lược đồ CSDL mức vật lý** (19 bảng, PK/FK, đường liên kết); chốt hướng Identity ánh xạ vào bảng TaiKhoan/VaiTro và bổ sung 4 cột `SoLanDangNhapSai`, `ThoiDiemHetKhoa`, `TokenDatLaiMatKhau`, `HanToken`; `TaiKhoan.TrangThai` đổi BIT → TINYINT cho thống nhất; nói rõ giao thất bại chuyển sang Đã hủy (không có trạng thái riêng) và đơn COD cũng phát sinh bản ghi `ThanhToan`. `build.js` đổi font theme sang Times New Roman và khai báo style `toc 1..3` để mục lục do Word sinh lại không bị Calibri; mục lục đã cập nhật số trang bằng Word COM.
- **2026-10-30 – Vẽ nốt 6 wireframe còn thiếu** (82 trang): Web `wf_list` (W02 Danh sách / kết quả tìm kiếm), `wf_result` (W06 Kết quả thanh toán, có cả nhánh thanh toán thất bại vẽ bằng khung nét đứt), `wf_account` (W07 Tài khoản của tôi); Desktop `wf_dk_cat` (D04 Quản lý danh mục), `wf_dk_stock` (D06 Quản lý kho và nhập hàng), `wf_dk_users` (D07 Quản lý khách hàng và nhân viên). Thêm helper `tab_bar()` trong `diagrams.py` cho các màn hình Desktop có thẻ. Mục 3.4 viết lại: **đủ 15/15 màn hình đã liệt kê đều có wireframe kèm đoạn mô tả**, kể cả màn hình Đăng nhập Web trước đây thiếu mô tả.
- **2026-10-30 – Lập repo GitHub cho nhóm**: `git init` (nhánh `main`), `.gitignore` cho .NET/WinUI 3/EF Core + `node_modules` + file tạm của Word (`~$*`) + `.claude/settings.local.json`, `.gitattributes` chuẩn hóa line ending và đánh dấu file nhị phân, `README.md` (đề tài, bảng thành viên để trống MSSV, trạng thái, công nghệ, kiến trúc 7 project, cấu trúc thư mục, yêu cầu môi trường, cách sinh lại báo cáo, quy trình nhánh/PR), mẫu pull request trong `.github/`. Commit đầu gồm cả báo cáo GD1 và PDF đề bài. Repo public: https://github.com/tom-1209-pixel/QuanLyBanSachTrucTuyen (tài khoản `tom-1209-pixel`).
- **2026-10-22 – CLAUDE.md** và script sinh báo cáo trong `tools/bao-cao/`.
- **2026-10-22 – Lệnh tắt `/dauphien`, `/cuoiphien`** (cấp người dùng, `C:\Users\Acer\.claude\commands\`): đầu phiên đọc CLAUDE.md và đề xuất việc tiếp; cuối phiên cập nhật 4 mục bàn giao. Chưa chạy thử.

## Trạng thái từng phần

| Hạng mục | Trạng thái | Ghi chú |
|---|---|---|
| Báo cáo GD1 | Xong | 82 trang, 34 hình ở Ch.3, mục lục đã có số trang. Bìa đã đủ 3 thành viên kèm MSSV (nhóm tự sửa tay trong Word) và đã đổi sang Nhóm 12 |
| Sơ đồ UML trong báo cáo | Dùng được | Vẽ bằng matplotlib. Quan hệ «extend» đã vẽ được (sửa 2026-10-30). Nếu thầy yêu cầu ký hiệu UML chuẩn thì vẽ lại bằng StarUML/draw.io |
| Slide GD1 | Chưa làm | Thầy yêu cầu nộp kèm |
| File nén nộp GD1 | Đang làm | `CK_GD1_Nhom12_PhamHoangSang_3124411256.zip`; còn chờ slide |
| Git repo | Xong | `git init` + commit đầu, đẩy lên https://github.com/tom-1209-pixel/QuanLyBanSachTrucTuyen (public, nhánh `main`). Chưa mời 3 thành viên làm collaborator (cần username GitHub của các bạn) |
| Solution và 7 project | Chưa tạo | Xem mục "Kiến trúc đã chốt" |
| Cơ sở dữ liệu | Mới có thiết kế | 19 bảng trong Ch.3 báo cáo, chưa có migration |
| Web Blazor / Web API / Desktop WinUI 3 / Tests | Chưa bắt đầu | |
| Báo cáo cuối kỳ | Chưa làm | Cần thêm Thiết kế, Kết quả, Kết luận vào báo cáo GD1 |
| Môi trường máy | Một phần | Có .NET SDK, SQL Server, Word, Node, Python. Chưa kiểm tra Windows App SDK (cần cho WinUI 3) |

## Bước tiếp theo

1. Làm slide GD1 rồi nén gói nộp `CK_GD1_Nhom12_PhamHoangSang_3124411256.zip` (báo cáo + slide + file phân tích).
2. **Chờ hỏi thầy**: có được tách 24 bảng đặc tả use case ra khỏi mục 3.2.4 không (3.2.4 đang chiếm trang 23–51; riêng đặc tả ~20 trang). Ba phương án đã cân nhắc: phụ lục cuối báo cáo (an toàn nhất, link nội bộ không chết khi xuất PDF), file riêng `DacTaUseCase_Nhom10.docx` kèm hyperlink tương đối (báo cáo còn ~62 trang nhưng link chết nếu mở từ zip hoặc xuất PDF), hoặc làm cả hai. Người dùng quyết định giữ nguyên cho tới khi hỏi được thầy (2026-10-30).
3. (Tùy chọn, phần còn lại của bản rà soát) Bổ sung đặc tả cho các use case còn thiếu (Đổi mật khẩu, Lọc sách, Xem lịch sử đơn, Cập nhật thông tin cá nhân, In hóa đơn, Hủy đơn phía nhân viên, Quản lý nhân viên, Báo cáo nhập – xuất – tồn, Cảnh báo tồn kho) hoặc ghi rõ ở đầu 3.2.4 là chỉ đặc tả các use case tiêu biểu; thêm danh mục hình, danh mục bảng, bảng phân công nếu mẫu của trường yêu cầu.
4. Làm slide GD1 tóm tắt Ch.1–3; nén file nộp.
5. Mời 3 thành viên còn lại làm collaborator trên GitHub; mỗi bạn điền MSSV và phần công việc vào bảng thành viên trong `README.md`.
6. Tạo solution `BookStore.sln` với 7 project; tạo thử app WinUI 3 trống chạy được trên máy cả nhóm (rủi ro lớn nhất).
7. `BookStore.Domain` + `BookStore.Data`: entity, DbContext, migration đầu tiên, dữ liệu mẫu (sách, loại, tài khoản QUẢN LÝ/NHÂN VIÊN).
8. `BookStore.Api`: đăng nhập JWT, CRUD sách/danh mục.
9. `BookStore.Admin`: màn hình đăng nhập, khung NavigationView, CRUD sách.
10. `BookStore.Web`: trang chủ, menu, danh mục, tìm kiếm, chi tiết sách, đăng ký/đăng nhập.
11. Giỏ hàng, đặt hàng (transaction trừ tồn), VNPay sandbox.
12. Desktop: xử lý đơn hàng, kho và nhập hàng, khách hàng/nhân viên.
13. Dashboard, báo cáo, xuất Excel; xUnit cho Services; hoàn thiện báo cáo cuối kỳ.

## Quyết định quan trọng và lý do

| Quyết định | Lý do |
|---|---|
| Quản trị là app Desktop, khách dùng Web | Đề bắt buộc 2 thành phần; thiếu Desktop bị chặn 6,0 điểm |
| WinUI 3 thay vì WinForms | Người dùng chọn để lấy điểm sáng tạo; hỗ trợ XAML + MVVM, giao diện Fluent |
| Blazor (Interactive Server) thay vì MVC | Người dùng chọn; viết toàn bộ bằng C#, cập nhật giỏ hàng không cần JavaScript, gọi thẳng Services qua DI |
| Desktop gọi Web API, không nối DB trực tiếp | Không để chuỗi kết nối trên máy nhân viên, kiểm tra quyền tập trung, tái sử dụng Services; đề khuyến khích Web API |
| Monolith phân lớp, không microservices | Vừa sức nhóm; vẫn tách module theo subsystem (học ý tưởng CoolStore) |
| Identity (cookie) cho Web, JWT cho Desktop, chung bảng TaiKhoan/VaiTro | Mỗi loại client dùng cơ chế phù hợp; khóa tài khoản có hiệu lực ở cả hai |
| Trừ tồn kho ngay khi tạo đơn, hoàn lại khi hủy | Tránh bán vượt số lượng tồn |
| Lưu DonGia, TongTien, thông tin người nhận trong đơn | Dữ liệu lịch sử tại thời điểm đặt; đã giải thích trong báo cáo là không vi phạm 3NF |
| Sách đã có giao dịch chỉ chuyển Ngừng kinh doanh | Giữ toàn vẹn đơn hàng, phiếu nhập cũ |
| Phiếu nhập chỉ cộng tồn khi Hoàn thành | Kế thừa quy trình đồ án PTTK; tồn kho khớp hàng thực nhận |
| Tên bảng/cột tiếng Việt không dấu | Thống nhất với báo cáo PTTK cũ |
| Nhóm chốt 3 thành viên, bỏ dòng thứ 4 (2026-10-30) | Người dùng xác nhận nhóm chỉ có Sang, Đăng, Khoa. Trước đó bìa để sẵn 1 dòng trống phòng khi có người thứ 4; nay dòng đó phải xóa khỏi bìa báo cáo và đã xóa khỏi `README.md` |
| Bỏ khuyến mãi và đánh giá sách khỏi phạm vi (2026-10-23) | Người dùng yêu cầu tinh gọn tính năng; giảm 2 bảng, 1 subsystem, 2 đặc tả use case, 3 user story, 2 quy tắc nghiệp vụ. Vẫn giữ VNPay, email, sổ địa chỉ giao hàng. Hai tính năng được ghi ở mục "giai đoạn phát triển sau" của 1.5 để báo cáo không tự mâu thuẫn |
| Báo cáo trình bày như đề tài độc lập, không nhắc đồ án PTTK cũ (2026-10-23) | Người dùng yêu cầu; đã bỏ ở 1.1.1, 1.1.3, 3.1.4 và tài liệu tham khảo |
| Identity dùng user store tùy biến trên bảng TaiKhoan/VaiTro (2026-10-30) | Báo cáo khai Identity nhưng bảng TaiKhoan không có cột khóa tài khoản và token; giữ Identity để lấy điểm sáng tạo, đồng thời giữ dữ liệu tài khoản trong lược đồ chung thay vì bộ bảng AspNetUsers/AspNetRoles |
| Không có trạng thái "Giao thất bại" riêng (2026-10-30) | Trước đây mục 3.2.2 và đặc tả use case nhắc trạng thái này nhưng `DonHang.TrangThai` chỉ có 0–5; chốt: giao thất bại → Đã hủy, lý do lưu ở `GhiChu` và `LichSuDonHang`, hoàn tồn kho theo BR03 |
| Mọi đơn đều phát sinh bản ghi ThanhToan (2026-10-30) | Trước đây không rõ đơn COD có bản ghi thanh toán hay không; thống nhất COD tạo bản ghi trạng thái Chờ khi tạo đơn, chuyển Thành công khi thu tiền lúc đơn Hoàn thành |
| Bàn giao giữa các phiên qua CLAUDE.md + lệnh `/dauphien`, `/cuoiphien` cấp người dùng | Người dùng muốn phiên mới chỉ đọc CLAUDE.md là làm tiếp được; đặt cấp người dùng để dùng chung cho mọi dự án |

## Các file trong thư mục

- `QuanLyNhaSach.docx` – báo cáo PTTK cũ, **mẫu chuẩn về văn phong và format**. Không sửa.
- `De tai mon Ngon ngu lap trinh CSharp - 2026.pdf` – đề bài gốc. Font bị mã hóa nên công cụ đọc file không trích được chữ; nội dung chính đã tóm tắt ở mục "Yêu cầu đề bài" dưới đây.
- `QuanLyBanSachTrucTuyen_GD1.docx` – báo cáo GD1 (bìa, mục lục, Ch.1–3, tài liệu tham khảo).
- `tools/bao-cao/` – script đã sinh báo cáo: `diagrams.py` (vẽ toàn bộ hình ra `img/`), `usecases.js` (dữ liệu đặc tả use case), `build.js` (dựng docx). Chạy: `pip install matplotlib pymupdf` và `npm install docx@9` trong thư mục đó, rồi `python diagrams.py` và `node build.js out.docx`; sau đó cập nhật mục lục bằng Word COM (`Documents.Open` → `TablesOfContents.Update()` → `Fields.Update()` → `Save()`), vì `build.js` để trường TOC ở trạng thái dirty. `build.js` tự vá `word/theme/theme1.xml` sang Times New Roman và khai báo style `toc 1..3` nên mục lục do Word sinh lại vẫn đúng font. Chỉ sinh lại đè lên báo cáo khi chắc chắn nhóm chưa sửa tay trong Word (so thời gian sửa file); nếu đã sửa tay thì sửa trực tiếp docx hoặc chỉ dùng script để vẽ lại hình.

## Yêu cầu đề bài (bắt buộc)

- Hệ thống gồm **2 thành phần dùng chung một CSDL Microsoft SQL Server**:
  1. **Ứng dụng quản trị Desktop** chạy trên Windows bằng C# (WinForms là tối thiểu; nhóm chọn **WinUI 3**): đăng nhập + xác thực/phân quyền trước khi dùng; màn hình thêm / xóa / sửa / xem / tìm kiếm cho các danh mục nghiệp vụ.
  2. **Trang Web người dùng** bằng C# (nhóm chọn **Blazor**): giao diện chính, menu, danh mục, tìm kiếm, chi tiết và chức năng nghiệp vụ; responsive.
- CSDL phải đạt **3NF**, có PK/FK hợp lý.
- Giới hạn điểm: không có Web hoặc không có Desktop → tối đa 6,0; Web và Desktop không dùng chung dữ liệu → 7,0; không dùng SQL Server → 6,5; không chạy/demo được → 5,0; chỉ có giao diện → 4,0.
- Điểm sáng tạo: WinUI 3, Blazor, EF Core, Web API, DI, Unit Test, dashboard, xuất báo cáo. Mỗi thành viên phải giải thích được mã mình viết và kiến trúc chung; dùng mã nguồn bên ngoài phải trích dẫn.
- Báo cáo cuối kỳ tối thiểu: Trang bìa, Mục lục, Giới thiệu và mục tiêu, Khảo sát hệ thống, Phân tích hệ thống (chức năng, layout), Thiết kế hệ thống (lược đồ CSDL), Kết quả đạt được, Kết luận và hướng phát triển, Tài liệu tham khảo.
- GD1 (theo yêu cầu riêng của thầy): Ch.1 Tổng quan; Ch.2 Khảo sát công nghệ; Ch.3 Phân tích (nghiệp vụ, use case + user story theo kiểu CoolStore, dữ liệu 3 mức, giao diện). Nộp nén `CK_GD1_Nhom???_HoTen_MaSV.zip` gồm báo cáo, slide, file phân tích.

## Kiến trúc đã chốt trong báo cáo (giữ nhất quán khi cài đặt)

Solution .NET 8, các project:

- `BookStore.Domain` – entity, enum trạng thái.
- `BookStore.Data` – EF Core 8 Code First, DbContext, Migrations, SQL Server.
- `BookStore.Services` – nghiệp vụ, validation, DTO; đăng ký qua DI, phụ thuộc interface (`IOrderService`, `IBookService`…).
- `BookStore.Api` – ASP.NET Core Web API cho app desktop; JWT theo Role, Swagger.
- `BookStore.Web` – Blazor Web App (Interactive Server), Bootstrap 5, ASP.NET Core Identity (cookie); gọi thẳng `BookStore.Services`, không qua API.
- `BookStore.Admin` – WinUI 3 (Windows App SDK), MVVM với CommunityToolkit.Mvvm, DI qua Microsoft.Extensions.Hosting; gọi `BookStore.Api` bằng HttpClient, không kết nối DB trực tiếp.
- `BookStore.Tests` – xUnit cho tầng Services.

Tích hợp: VNPay sandbox, MailKit, ClosedXML (xuất Excel), LiveCharts2 (dashboard WinUI).

## Domain

- Tác nhân: Khách vãng lai, Khách hàng (Web); Nhân viên, Quản lý (Desktop; Quản lý kế thừa mọi quyền của Nhân viên); Cổng thanh toán. Role: `KHÁCH HÀNG`, `NHÂN VIÊN`, `QUẢN LÝ`. Tài khoản Khách hàng bị từ chối khi đăng nhập app quản trị.
- Subsystem Web (5): Dùng chung, Tìm kiếm và xem sách, Giỏ hàng, Đặt hàng và thanh toán, Tài khoản khách hàng. Subsystem Desktop (5): Quản lý sách và danh mục, Đơn hàng, Kho và nhập hàng, Khách hàng và nhân viên, Báo cáo thống kê.
- Bảng CSDL (19 bảng, tiếng Việt không dấu, PascalCase): VaiTro, TaiKhoan, KhachHang, DiaChiGiaoHang, NhanVien, LoaiSach, TacGia, NhaXuatBan, Sach, Sach_TacGia, NhaCungCap, PhieuNhap, CTPhieuNhap, GioHang, CTGioHang, DonHang, CTDonHang, LichSuDonHang, ThanhToan.
- **Không có khuyến mãi và đánh giá sách** (bỏ 2026-10-23): không có bảng `KhuyenMai`, `DanhGia`; `DonHang` không có cột `MaKM`, `TienGiam`; `TongTien = TamTinh + PhiVanChuyen`.
- `DonHang.TrangThai`: 0 Chờ thanh toán, 1 Chờ xác nhận, 2 Đã xác nhận, 3 Đang giao, 4 Hoàn thành, 5 Đã hủy.
- Quy tắc nghiệp vụ (BR01–BR10): trừ tồn kho khi tạo đơn (cùng transaction), hoàn tồn khi hủy/giao thất bại; `CTDonHang.DonGia` lưu giá lúc đặt; đơn VNPay quá 30 phút chưa thanh toán thì tự hủy; khách chỉ hủy được ở trạng thái 0/1; phiếu nhập chỉ cộng tồn khi Hoàn thành, sau đó không sửa/xóa; sách đã có giao dịch chỉ chuyển Ngừng kinh doanh; doanh thu chỉ tính đơn Hoàn thành; phí ship 25.000đ, miễn phí từ 300.000đ.

## Quy ước viết báo cáo (rút từ QuanLyNhaSach.docx)

- Mô tả chức năng: "Chức năng X cho phép <tác nhân> … Chức năng giúp/hỗ trợ …"; nhóm CRUD gồm Thêm, Cập nhật, Tra cứu, Xem thông tin, Xóa, Xem danh sách.
- Tiêu đề viết hoa: "USE CASE DIAGRAM …", "ĐẶC TẢ USE CASE …".
- Bảng đặc tả use case 2 cột "Thành phần | Nội dung": Tên use case, Tác nhân, Mô tả ngắn gọn ("Use Case cho phép …"), Điều kiện tiên quyết (có dòng "Tài khoản đăng nhập có Role là …"), Luồng chính (đánh số), Luồng thay thế (`4.A. <tình huống>` → các bước → "Quay lại bước n của luồng chính"), Điều kiện sau (`Trạng thái 1 - … thành công`, `Trạng thái 2 - … không thành công`).
- User story: "Là <vai trò>, tôi muốn <mục tiêu> để <lợi ích>" + tiêu chí chấp nhận, nhóm theo Epic.

## Lệnh build/run/test

Chưa có solution. Khi tạo solution, bổ sung vào đây lệnh build, chạy Web/API/Admin, `dotnet ef` migrations và cách chạy một test xUnit.

## Quy tắc cập nhật file này

Đầu phiên gõ `/dauphien`, cuối phiên gõ `/cuoiphien` (lệnh cấp người dùng trong `~/.claude/commands/`). Cuối mỗi phiên làm việc, cập nhật các mục "Đã hoàn thành" (ghi ngày), "Trạng thái từng phần", "Bước tiếp theo" và thêm dòng vào "Quyết định quan trọng và lý do" nếu có quyết định mới. Khi kiến trúc hoặc domain thay đổi, sửa mục tương ứng thay vì ghi chồng thêm.
