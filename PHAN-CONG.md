# Kho nguyên liệu – nhánh `nguyen-lieu`

Nhánh này **không merge vào `main`**. Nó chỉ chứa sẵn file để mỗi người lấy phần của mình ra
khi làm Pull Request. Cách lấy (xem chi tiết ở `HUONG-DAN-GIT.md` trên nhánh `main`):

```bash
git fetch origin
git checkout origin/nguyen-lieu -- <đường dẫn file>
```

## Ai lấy file nào

| # | Người làm | Nhánh cần tạo | Lệnh lấy file |
|---|---|---|---|
| 1 | **Sang** | `bao-cao/bia-muc-luc` | `git checkout origin/nguyen-lieu -- BaoCao/00_BiaVaMucLuc.docx` |
| 2 | **Hải Đăng** | `bao-cao/chuong1-tong-quan` | `git checkout origin/nguyen-lieu -- BaoCao/01_Chuong1_TongQuanHeThong.docx` |
| 3 | **Đăng Khoa** | `bao-cao/chuong2-khao-sat-cong-nghe` | `git checkout origin/nguyen-lieu -- BaoCao/02_Chuong2_KhaoSatCongNghe.docx` |
| 4 | **Sang** | `bao-cao/ch3-1-nghiep-vu` | `git checkout origin/nguyen-lieu -- BaoCao/03_Chuong3-1_PhanTichNghiepVu.docx` |
| 5 | **Hải Đăng** | `bao-cao/ch3-2-chuc-nang` | `git checkout origin/nguyen-lieu -- BaoCao/04_Chuong3-2_PhanTichChucNang.docx DacTaUseCase` |
| 6 | **Đăng Khoa** | `bao-cao/ch3-3-du-lieu` | `git checkout origin/nguyen-lieu -- BaoCao/05_Chuong3-3_PhanTichDuLieu.docx` |
| 7 | **Sang** | `bao-cao/ch3-4-giao-dien` | `git checkout origin/nguyen-lieu -- BaoCao/06_Chuong3-4_PhanTichGiaoDien.docx PhanTich` |
| 8 | **Đăng Khoa** | `bao-cao/tai-lieu-tham-khao` | `git checkout origin/nguyen-lieu -- BaoCao/07_TaiLieuThamKhao.docx` |

Làm **lần lượt từ trên xuống**: PR trước merge xong rồi người sau mới bắt đầu.

## Nội dung từng file báo cáo

| File | Nội dung | Hình / bảng |
|---|---|---|
| `00_BiaVaMucLuc.docx` | Trang bìa + mục lục | – |
| `01_Chuong1_TongQuanHeThong.docx` | Giới thiệu đề tài, vấn đề hiện tại, mục tiêu, yêu cầu người dùng, đối tượng sử dụng, phạm vi | Hình 1.1 · Bảng 1.1–1.5 |
| `02_Chuong2_KhaoSatCongNghe.docx` | C#/.NET, WinUI 3, Blazor, Web API, EF Core + SQL Server, xác thực, kiến trúc phân lớp, khảo sát Fahasa/Tiki | Hình 2.1 · Bảng 2.1–2.6 |
| `03_Chuong3-1_PhanTichNghiepVu.docx` | Bối cảnh nghiệp vụ, quy tắc nghiệp vụ BR01–BR10, quy trình đặt hàng / xử lý đơn / nhập hàng | Hình 3.1–3.4 · Bảng 3.1–3.3 |
| `04_Chuong3-2_PhanTichChucNang.docx` | Danh sách chức năng, phân rã subsystem, 10 use case diagram, user story theo Epic | Hình 3.5–3.15 |
| `05_Chuong3-3_PhanTichDuLieu.docx` | ERD mức ý niệm, lược đồ luận lý, kiểm tra 1NF/2NF/3NF, 19 bảng mức vật lý | Hình 3.16–3.17 · Bảng 3.4–3.23 |
| `06_Chuong3-4_PhanTichGiaoDien.docx` | 7 wireframe trang Web + 8 wireframe ứng dụng Desktop | Hình 3.18–3.32 · Bảng 3.24–3.25 |
| `07_TaiLieuThamKhao.docx` | Danh mục tài liệu tham khảo | – |

Tổng cộng: **34 hình**, **25 bảng**. Số hiệu hình và bảng liên tục qua các file, giống như
trong bản báo cáo đầy đủ.

## Thư mục kèm theo

- `DacTaUseCase/` – 10 file .docx, đặc tả chi tiết 24 use case, mỗi subsystem một file. Đi cùng PR #5.
- `PhanTich/` – 34 hình .png: sơ đồ ngữ cảnh, sơ đồ hoạt động, use case diagram, ERD, lược đồ vật lý, wireframe. Đi cùng PR #7.

## File này sinh ra từ đâu

Các file .docx được sinh bằng script trong thư mục làm việc của nhóm:

```bash
cd tools/bao-cao
node build.js --split <thư mục xuất>      # 8 file báo cáo chia nhỏ
node build.js bao-cao.docx DacTaUseCase   # báo cáo đầy đủ + 10 file đặc tả
python diagrams.py                        # vẽ lại 34 hình
```

Script không nằm trong repo này. Muốn sửa nội dung báo cáo thì sửa script rồi sinh lại, đừng
sửa tay vào file .docx — lần sinh sau sẽ ghi đè mất.
