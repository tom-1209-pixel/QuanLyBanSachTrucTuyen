# Hệ thống quản lý và bán sách trực tuyến

Đồ án môn **Ngôn ngữ lập trình C#** – Trường Đại học Sài Gòn, Khoa Công nghệ Thông tin.
Giảng viên giảng dạy: **TS. Đỗ Như Tài**. Nhóm **10**.

Hệ thống gồm hai thành phần dùng chung một cơ sở dữ liệu Microsoft SQL Server:

- **Trang Web bán sách** cho khách hàng – Blazor Web App (Interactive Server).
- **Ứng dụng quản trị Desktop** cho nhân viên và quản lý – WinUI 3 (Windows App SDK), gọi Web API.

## Thành viên nhóm

| STT | Họ và tên | MSSV | Công việc chính |
|-----|-----------|------|-----------------|
| 1 | Phạm Hoàng Sang | | |
| 2 | Võ Trần Hải Đăng | | |
| 3 | Ngô Hồ Đăng Khoa | | |
| 4 | | | |

> Các bạn tự điền MSSV và phần công việc của mình vào bảng này (xem mục [Quy trình làm việc](#quy-trình-làm-việc-trên-github) để biết cách sửa).

## Trạng thái

| Hạng mục | Trạng thái |
|---|---|
| Báo cáo giai đoạn 1 (phân tích) | Xong nội dung – 82 trang, 34 hình |
| Slide giai đoạn 1 | Chưa làm |
| Solution và 7 project | Chưa tạo |
| Cơ sở dữ liệu (19 bảng) | Mới có thiết kế trong báo cáo, chưa có migration |
| Web / Web API / Desktop / Unit test | Chưa bắt đầu |

## Công nghệ

- .NET 8, C#
- Blazor Web App (Interactive Server) + Bootstrap 5, ASP.NET Core Identity (cookie)
- WinUI 3 + MVVM (CommunityToolkit.Mvvm), DI qua `Microsoft.Extensions.Hosting`
- ASP.NET Core Web API + JWT theo Role, Swagger
- Entity Framework Core 8 (Code First, Migrations) + Microsoft SQL Server
- xUnit cho tầng Services
- Tích hợp: VNPay sandbox, MailKit (gửi email), ClosedXML (xuất Excel), LiveCharts2 (dashboard Desktop)

## Kiến trúc

Solution `BookStore.sln` gồm 7 project:

| Project | Vai trò |
|---|---|
| `BookStore.Domain` | Entity, enum trạng thái |
| `BookStore.Data` | EF Core DbContext, Migrations, cấu hình SQL Server |
| `BookStore.Services` | Nghiệp vụ, validation, DTO; đăng ký qua DI, phụ thuộc interface |
| `BookStore.Api` | Web API cho ứng dụng quản trị; JWT theo Role, Swagger |
| `BookStore.Web` | Trang Web khách hàng; gọi thẳng `BookStore.Services` |
| `BookStore.Admin` | Ứng dụng quản trị WinUI 3; gọi `BookStore.Api` bằng `HttpClient` |
| `BookStore.Tests` | xUnit cho tầng Services |

Ứng dụng Desktop **không kết nối trực tiếp** vào cơ sở dữ liệu mà đi qua Web API, để không phải đặt chuỗi kết nối trên máy nhân viên và để kiểm tra quyền tập trung một chỗ.

## Cấu trúc thư mục

```
.
├── QuanLyBanSachTrucTuyen_GD1.docx     Báo cáo giai đoạn 1
├── De tai mon Ngon ngu lap trinh CSharp - 2026.pdf
├── Hỏi.txt                             Những điểm còn cần hỏi giảng viên
├── CLAUDE.md                           Ghi chú bàn giao giữa các phiên làm việc
└── tools/bao-cao/                      Script sinh báo cáo .docx
    ├── diagrams.py                     Vẽ toàn bộ hình ra img/
    ├── usecases.js                     Dữ liệu đặc tả use case
    ├── build.js                        Dựng file .docx
    └── img/                            Hình đã vẽ (34 hình)
```

Mã nguồn sẽ nằm trong `src/` (các project) và `tests/` khi tạo solution.

## Yêu cầu môi trường

- Windows 10 phiên bản 1809 trở lên
- [.NET SDK 8.0](https://dotnet.microsoft.com/download/dotnet/8.0)
- Microsoft SQL Server (Express hoặc Developer) + SQL Server Management Studio
- Visual Studio 2022 với các workload: *ASP.NET and web development*, *.NET desktop development*, và thành phần **Windows App SDK** (bắt buộc để build project WinUI 3)
- Riêng cho script sinh báo cáo: Node.js và Python 3

## Chạy dự án

Chưa có solution nên phần này sẽ bổ sung sau khi tạo. Dự kiến:

```bash
dotnet restore
dotnet build
dotnet ef database update --project src/BookStore.Data --startup-project src/BookStore.Web
dotnet run --project src/BookStore.Api
dotnet run --project src/BookStore.Web
dotnet test
```

### Sinh lại báo cáo

```bash
cd tools/bao-cao
pip install matplotlib pymupdf
npm install
python diagrams.py
node build.js QuanLyBanSachTrucTuyen_GD1.docx
```

Sau đó mở file bằng Word và cập nhật mục lục (`Ctrl+A` rồi `F9`), vì script để trường mục lục ở trạng thái chưa cập nhật.

> Chỉ sinh lại đè lên báo cáo khi chắc chắn chưa ai sửa tay trong Word, nếu không sẽ mất phần sửa đó.

## Quy trình làm việc trên GitHub

Lần đầu, mỗi bạn chạy:

```bash
git clone https://github.com/tom-1209-pixel/QuanLyBanSachTrucTuyen.git
```

Rồi khai báo tên và email của mình để lịch sử commit ghi đúng người làm:

```bash
git config user.name "Ho Ten Cua Ban"
```

```bash
git config user.email "email@cua.ban"
```

**Không commit trực tiếp vào `main`.** Mỗi tính năng làm trên một nhánh riêng:

```bash
git switch -c feature/quan-ly-sach
```

Đặt tên nhánh theo dạng `feature/<việc>`, `fix/<lỗi>`, `docs/<tài-liệu>`. Làm xong thì:

```bash
git push -u origin feature/quan-ly-sach
```

Vào GitHub mở **Pull request** vào `main`, nhờ một bạn khác xem rồi mới merge. Trước khi bắt đầu việc mới, cập nhật lại `main`:

```bash
git switch main && git pull
```

Thông điệp commit viết ngắn, bằng tiếng Việt không dấu hoặc tiếng Anh, nêu rõ đã làm gì — ví dụ `Them man hinh dang nhap WinUI`, `Sua loi tru ton kho khi huy don`.

Để tránh xung đột: chia việc theo project (`BookStore.Web`, `BookStore.Admin`, …) và **không hai người sửa cùng một file** trong cùng thời điểm. Riêng báo cáo `.docx` là file nhị phân, Git không merge được, nên mỗi lần chỉ một người sửa và nhắn cho cả nhóm biết.

## Phạm vi

Có trong đồ án: tìm kiếm và xem sách, giỏ hàng, đặt hàng, thanh toán VNPay và COD, sổ địa chỉ giao hàng, quản lý tài khoản khách hàng; phía quản trị có quản lý sách và danh mục, xử lý đơn hàng, kho và nhập hàng, khách hàng và nhân viên, báo cáo thống kê.

Để giai đoạn phát triển sau: khuyến mãi (mã giảm giá) và đánh giá sách.
