# Hệ thống quản lý và bán sách trực tuyến

Đồ án môn **Ngôn ngữ lập trình C#** – Trường Đại học Sài Gòn, Khoa Công nghệ Thông tin.
GVGD: TS. Đỗ Như Tài. **Nhóm 12**.

Repo này chứa **tài liệu phân tích giai đoạn 1 (GD1)** của đề tài, được chia thành nhiều file nhỏ
và đưa lên bằng quy trình nhánh → Pull Request → merge để cả nhóm cùng làm.

---

## Thành viên và phân công

| Thành viên | MSSV | Account GitHub | Phần phụ trách |
|---|---|---|---|
| Phạm Hoàng Sang | 3124411256 | [@tom-1209-pixel](https://github.com/tom-1209-pixel) | Bìa & mục lục · Mục 3.1 Phân tích nghiệp vụ · Mục 3.4 Phân tích giao diện + 34 hình phân tích |
| Võ Trần Hải Đăng | 3124411069 | [@dangvotranhai-dot](https://github.com/dangvotranhai-dot) | Chương 1 Tổng quan · Mục 3.2 Phân tích chức năng + 10 file đặc tả use case |
| Ngô Hồ Đăng Khoa | 3124411130 | [@khoango6688-collab](https://github.com/khoango6688-collab) | Chương 2 Khảo sát công nghệ · Mục 3.3 Phân tích dữ liệu · Tài liệu tham khảo |

---

## Cấu trúc repo

```
BaoCao/           8 file .docx – báo cáo GD1 chia theo chương/mục
DacTaUseCase/     10 file .docx – đặc tả chi tiết 24 use case, mỗi subsystem một file
PhanTich/         34 hình .png – sơ đồ ngữ cảnh, use case diagram, ERD, wireframe…
HUONG-DAN-GIT.md  hướng dẫn từng bước: nhánh, commit, Pull Request, merge
```

Các thư mục trên **ban đầu để trống** và được đổ dần qua từng Pull Request. Xem tiến độ ở
tab [Pull requests](../../pulls?q=is%3Apr).

---

## Nhánh trong repo

| Nhánh | Dùng để làm gì |
|---|---|
| `main` | Nhánh chính. Chỉ nhận thay đổi qua Pull Request, **không push trực tiếp** |
| `nguyen-lieu` | Kho chứa sẵn toàn bộ file .docx và hình. **Không merge vào `main`** – chỉ để mỗi người lấy phần của mình ra |
| `bao-cao/...` | Nhánh tạm của từng người cho từng Pull Request, merge xong thì xóa |

---

## Bắt đầu

Nếu bạn là thành viên nhóm và lần đầu vào repo, đọc **[HUONG-DAN-GIT.md](HUONG-DAN-GIT.md)** —
file đó giải thích git/GitHub từ đầu và ghi rõ bạn cần chạy những lệnh nào.

---

## Nội dung báo cáo GD1

- **Chương 1 – Tổng quan hệ thống**: giới thiệu đề tài, vấn đề hiện tại, mục tiêu, yêu cầu người dùng, đối tượng sử dụng, phạm vi.
- **Chương 2 – Khảo sát công nghệ**: C#/.NET, WinUI 3, Blazor, ASP.NET Core Web API, EF Core + SQL Server, xác thực/phân quyền, kiến trúc phân lớp, khảo sát Fahasa/Tiki.
- **Chương 3 – Phân tích hệ thống**: quy tắc nghiệp vụ, quy trình đặt hàng/giao đơn/nhập hàng, use case diagram + đặc tả, user story theo Epic, dữ liệu 3 mức (ý niệm – luận lý – vật lý, 19 bảng, đạt 3NF), 15 wireframe.

## Công nghệ dự kiến của hệ thống

.NET 8 · WinUI 3 (ứng dụng quản trị Desktop) · Blazor (trang Web khách hàng) · ASP.NET Core Web API ·
Entity Framework Core + Microsoft SQL Server · xUnit
