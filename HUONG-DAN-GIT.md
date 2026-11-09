# Hướng dẫn Git & GitHub cho nhóm 12

File này viết cho người **chưa biết gì về git**. Đọc từ trên xuống, làm theo đúng thứ tự.
Mỗi lệnh đều có giải thích "lệnh này làm gì" ngay bên dưới.

---

## Phần 1 – Mấy khái niệm cần hiểu trước

### Repository (repo)

Một **repo** là một thư mục có kèm thư mục ẩn `.git` bên trong. `.git` ghi lại **mọi phiên bản**
của mọi file trong thư mục đó. Nhờ vậy bạn luôn xem lại được "hôm qua file này trông thế nào",
"ai sửa dòng này", và quay về bản cũ nếu làm sai.

Repo nằm ở hai nơi:

```
  Máy bạn                                GitHub (trên mạng)
  ───────                                ──────────────────
  D:\...\QuanLyBanSachTrucTuyen   ←→      github.com/tom-1209-pixel/QuanLyBanSachTrucTuyen
  (repo local)                            (repo remote, tên gọi mặc định: "origin")
```

Hai bên không tự đồng bộ. Bạn phải chủ động `push` (đẩy lên) và `pull` (lấy về).

### Commit

Một **commit** là một lần "chụp ảnh lưu lại" trạng thái các file, kèm một dòng mô tả bạn làm gì.
Commit là đơn vị nhỏ nhất của lịch sử. Lịch sử là một chuỗi commit nối nhau:

```
A ──── B ──── C ──── D          mỗi chữ cái là một commit
                     ↑
                   mới nhất
```

### Nhánh (branch)

**Nhánh** là một đường lịch sử riêng. Nhánh chính tên là `main`.

Khi bạn tạo nhánh mới, bạn tách ra làm việc riêng, **không ảnh hưởng `main`**. Làm xong thì
gộp (merge) trở lại:

```
                   ┌── E ── F ──┐              nhánh của bạn: bao-cao/chuong1
                   │            ↓
main:  A ── B ── C ─────────────G              G là commit merge
```

Lợi ích: 3 người cùng làm 3 nhánh song song, không ai đụng việc ai, và `main` luôn ở trạng thái dùng được.

### Pull Request (PR) — **đây là câu bạn hỏi**

**Pull Request là một lời đề nghị gộp nhánh của bạn vào `main`.**

Tên gọi nghĩa là: "tôi *request* (đề nghị) bạn *pull* (lấy) phần tôi làm vào nhánh chính".

PR **không phải** một lệnh git — nó là **một trang trên GitHub**. Trên trang đó GitHub hiện:

- bạn thêm/sửa/xóa file nào, cụ thể từng dòng (gọi là **diff**)
- một khung bình luận để cả nhóm trao đổi
- nút **Approve** để người khác nói "tôi xem rồi, ổn"
- nút **Merge** để thật sự gộp vào `main`

Vì sao phải qua PR mà không push thẳng vào `main`?

| Push thẳng vào `main` | Qua Pull Request |
|---|---|
| Sai là `main` hỏng ngay, cả nhóm bị ảnh hưởng | Sai thì chỉ nhánh riêng hỏng, `main` vẫn nguyên |
| Không ai kịp xem trước | Có người xem và duyệt trước khi gộp |
| Không biết thay đổi này vì sao có | PR lưu lại mô tả + thảo luận, sau này mở ra đọc lại được |
| Lịch sử lộn xộn | Mỗi PR là một bước rõ ràng |

Đây là cách **mọi công ty** làm việc với git. Học đúng từ đầu thì sau này đi làm không phải học lại.

### Tóm lại một vòng làm việc

```
1. git switch main && git pull     lấy bản mới nhất của main về máy
2. git switch -c <tên nhánh>       tạo nhánh riêng để làm
3. ... thêm/sửa file ...
4. git add + git commit            lưu lại thành một commit
5. git push                        đẩy nhánh lên GitHub
6. gh pr create                    mở Pull Request
7. người khác Approve              xem và duyệt
8. Merge                           gộp vào main. Xong, quay lại bước 1
```

---

## Phần 2 – Chuẩn bị máy (làm một lần duy nhất)

### 2.1 Cài git

Tải tại <https://git-scm.com/download/win>, cài theo mặc định. Kiểm tra:

```bash
git --version
```

Thấy ra số phiên bản là xong.

### 2.2 Cài GitHub CLI

Công cụ `gh` cho phép mở PR, merge PR… ngay trong terminal, không phải mở trình duyệt.
Tải tại <https://cli.github.com>. Kiểm tra:

```bash
gh --version
```

### 2.3 Đăng nhập GitHub

```bash
gh auth login
```

Chọn: `GitHub.com` → `HTTPS` → `Y` (dùng thông tin này cho git luôn) → `Login with a web browser`.
Nó hiện một mã 8 ký tự, copy mã đó, bấm Enter, trình duyệt mở ra, dán mã vào, bấm Authorize.

Lệnh này lưu một **token** vào máy bạn để từ nay git không hỏi mật khẩu nữa.

### 2.4 Nhận lời mời vào repo

Mở link này và bấm **Accept**:

<https://github.com/tom-1209-pixel/QuanLyBanSachTrucTuyen/invitations>

Chưa Accept thì bạn **đọc được repo nhưng không push được**.

### 2.5 Tải repo về máy

```bash
cd D:\
git clone https://github.com/tom-1209-pixel/QuanLyBanSachTrucTuyen.git
cd QuanLyBanSachTrucTuyen
```

`git clone` tải toàn bộ repo kèm lịch sử về thành một thư mục mới. Chỉ làm **một lần**.
Từ sau, mỗi lần muốn cập nhật thì dùng `git pull`, không clone lại.

### 2.6 Khai tên và email

```bash
git config user.name "Vo Tran Hai Dang"
git config user.email "email-cua-account-github@example.com"
```

Hai dòng này đóng vào **mỗi commit** bạn tạo. Email **phải là email của account GitHub của bạn**,
nếu không GitHub sẽ không biết commit đó là của bạn và nó **không hiện trên trang cá nhân** của bạn.

Xem email account mình đang dùng:

```bash
gh api user --jq .email
```

Nếu ra `null` (do bạn bật ẩn email), dùng email dạng noreply — lấy bằng:

```bash
gh api user --jq '"\(.id)+\(.login)@users.noreply.github.com"'
```

Kiểm tra lại đã khai đúng chưa:

```bash
git config --list | findstr user
```

---

## Phần 3 – Nhánh `nguyen-lieu` là gì

Repo này có một nhánh đặc biệt tên `nguyen-lieu`, chứa sẵn **toàn bộ** file .docx và hình:

```
nguyen-lieu:   BaoCao/00..07_*.docx      8 file báo cáo
               DacTaUseCase/*.docx       10 file đặc tả
               PhanTich/*.png            34 hình
```

Nhánh này **không bao giờ merge vào `main`**. Nó chỉ là cái kho, để mỗi người lấy đúng phần
của mình ra mà không phải chuyền file qua Zalo.

Lấy một file từ nhánh đó sang nhánh bạn đang làm, bằng **một lệnh**:

```bash
git fetch origin
git checkout origin/nguyen-lieu -- BaoCao/01_Chuong1_TongQuanHeThong.docx
```

- `git fetch origin` – cập nhật thông tin các nhánh trên GitHub về máy (chưa đổi file của bạn)
- `git checkout <nhánh> -- <đường dẫn>` – lấy **đúng một file** từ nhánh khác, đặt vào đúng
  đường dẫn đó trong thư mục hiện tại, và đánh dấu sẵn là "sẽ commit". Bạn vẫn đang ở nhánh của mình.

---

## Phần 4 – Phân công: ai làm Pull Request nào

Làm **lần lượt từ trên xuống**. PR trước merge xong rồi người sau mới bắt đầu —
như vậy không bao giờ có hai người sửa cùng một file, nên không bị xung đột (conflict).

| # | Người làm | Nhánh | File cần đưa vào |
|---|---|---|---|
| 1 | **Sang** | `bao-cao/bia-muc-luc` | `BaoCao/00_BiaVaMucLuc.docx` |
| 2 | **Hải Đăng** | `bao-cao/chuong1-tong-quan` | `BaoCao/01_Chuong1_TongQuanHeThong.docx` |
| 3 | **Đăng Khoa** | `bao-cao/chuong2-khao-sat-cong-nghe` | `BaoCao/02_Chuong2_KhaoSatCongNghe.docx` |
| 4 | **Sang** | `bao-cao/ch3-1-nghiep-vu` | `BaoCao/03_Chuong3-1_PhanTichNghiepVu.docx` |
| 5 | **Hải Đăng** | `bao-cao/ch3-2-chuc-nang` | `BaoCao/04_Chuong3-2_PhanTichChucNang.docx` + cả thư mục `DacTaUseCase/` |
| 6 | **Đăng Khoa** | `bao-cao/ch3-3-du-lieu` | `BaoCao/05_Chuong3-3_PhanTichDuLieu.docx` |
| 7 | **Sang** | `bao-cao/ch3-4-giao-dien` | `BaoCao/06_Chuong3-4_PhanTichGiaoDien.docx` + cả thư mục `PhanTich/` |
| 8 | **Đăng Khoa** | `bao-cao/tai-lieu-tham-khao` | `BaoCao/07_TaiLieuThamKhao.docx` |

---

## Phần 5 – Các lệnh cho một Pull Request

Ví dụ dưới đây là **PR #2 của Hải Đăng**. Người khác chỉ cần thay tên nhánh và đường dẫn file
theo bảng Phần 4.

```bash
git switch main
git pull
```
> Về nhánh `main` và lấy kết quả các PR trước về. **Luôn làm bước này trước**, nếu không
> nhánh của bạn sẽ dựa trên bản cũ.

```bash
git switch -c bao-cao/chuong1-tong-quan
```
> Tạo nhánh mới từ `main` và chuyển sang nhánh đó. `-c` là *create*.
> Bỏ `-c` thì nghĩa là chuyển sang nhánh đã có.

```bash
git fetch origin
git checkout origin/nguyen-lieu -- BaoCao/01_Chuong1_TongQuanHeThong.docx
```
> Lấy file phần mình từ kho `nguyen-lieu` (xem Phần 3).

```bash
git status
```
> Xem mình đang ở nhánh nào và file nào đang chờ commit. Gõ lệnh này bất cứ lúc nào bạn thấy
> mơ hồ không biết đang ở đâu — nó vô hại.

```bash
git commit -m "Them Chuong 1 Tong quan he thong"
```
> Lưu lại thành một commit. `-m` là dòng mô tả. Viết mô tả nói **làm gì**, không viết "update", "fix".
> (Không cần `git add` ở đây vì `git checkout ... -- <file>` đã đánh dấu file sẵn.
> Nếu bạn tự tạo/sửa file bằng tay thì phải `git add <file>` trước khi commit.)

```bash
git push -u origin bao-cao/chuong1-tong-quan
```
> Đẩy nhánh lên GitHub. `-u origin <nhánh>` nói "nhánh này gắn với nhánh cùng tên trên GitHub",
> nhờ vậy lần sau chỉ cần gõ `git push`.

```bash
gh pr create --fill
```
> Mở Pull Request. `--fill` tự lấy dòng mô tả commit làm tiêu đề PR.
> Lệnh in ra một link — **gửi link đó vào nhóm chat** để người khác vào xem.

Rồi **một người khác** (không phải người mở PR) chạy:

```bash
gh pr review <số PR> --approve
gh pr merge <số PR> --merge --delete-branch
```
> `review --approve` = bấm nút Approve. GitHub **không cho tự approve PR của chính mình** —
> đó chính là lý do quy trình này cần nhiều người.
> `merge --merge` gộp vào `main` bằng một commit merge. `--delete-branch` xóa nhánh đã dùng xong
> cho gọn (lịch sử vẫn còn nguyên trong `main`).

Xong. Người tiếp theo quay lại đầu Phần 5.

### Không muốn dùng terminal cho bước PR?

Sau khi `git push`, mở <https://github.com/tom-1209-pixel/QuanLyBanSachTrucTuyen> trên trình duyệt.
GitHub hiện một dải vàng "Compare & pull request" → bấm vào → điền mô tả → **Create pull request**.
Người khác vào tab **Files changed** → **Review changes** → **Approve**, rồi bấm **Merge pull request**.
Kết quả giống hệt lệnh `gh` ở trên.

---

## Phần 6 – Xem lại kết quả

```bash
git log --graph --oneline --all
```
> Vẽ lịch sử bằng chữ, thấy rõ nhánh tách ra ở đâu, gộp vào chỗ nào.

```bash
gh pr list --state all
```
> Danh sách tất cả PR và trạng thái (OPEN / MERGED / CLOSED).

Trên web: tab **Insights → Network** vẽ hình các nhánh; tab **Pull requests** → bấm `Closed`
để xem các PR đã merge.

---

## Phần 7 – Lỗi thường gặp

**`! [rejected] ... (fetch first)` khi push**
Trên GitHub đã có commit mới mà máy bạn chưa có. Chạy `git pull` rồi `git push` lại.

**`Permission denied` / `403` khi push**
Chưa Accept lời mời (mục 2.4), hoặc `gh auth login` đang đăng nhập account khác.
Kiểm tra: `gh auth status`.

**Commit xong mới phát hiện khai sai email**
Commit đã push thì nó hiện tên khác, nhưng không sao, sửa cho các commit sau:
`git config user.email "<email đúng>"`. Nếu chưa push, sửa commit cuối bằng
`git commit --amend --reset-author`.

**Lỡ làm việc ngay trên `main`**
Chưa commit: `git stash` (tạm cất) → `git switch -c <nhánh mới>` → `git stash pop` (lấy lại).
Đã commit: `git switch -c <nhánh mới>` (commit đi theo nhánh mới) → `git switch main` →
`git reset --hard origin/main` (trả `main` về như trên GitHub).

**Không biết mình đang ở đâu, đang làm gì**
`git status`. Luôn luôn `git status`.

---

## Phần 8 – Tự tập thêm (khi nào muốn)

### 8.1 Tạo xung đột (conflict) rồi tự giải quyết

Conflict xảy ra khi hai nhánh sửa **cùng một dòng** của **cùng một file**. Tập như sau:

```bash
git switch main && git pull
git switch -c thu-conflict-a
echo "Dong cua A" >> README.md
git commit -am "A sua README"
git push -u origin thu-conflict-a

git switch main
git switch -c thu-conflict-b
echo "Dong cua B" >> README.md
git commit -am "B sua README"
git push -u origin thu-conflict-b
```

Merge nhánh A trước, rồi mở PR cho nhánh B — GitHub sẽ báo *"This branch has conflicts"*. Xử lý:

```bash
git switch thu-conflict-b
git pull origin main
```

Mở `README.md`, bạn sẽ thấy git chèn dấu:

```
<<<<<<< HEAD
Dong cua B
=======
Dong cua A
>>>>>>> main
```

Xóa 3 dòng dấu `<<<<<<<`, `=======`, `>>>>>>>` và giữ lại nội dung bạn muốn, rồi:

```bash
git add README.md
git commit -m "Giai quyet conflict README"
git push
```

### 8.2 Bắt buộc phải có review mới merge được

Trên GitHub: **Settings → Branches → Add branch ruleset**, nhánh `main`, bật
*Require a pull request before merging* và *Require approvals: 1*.
Từ đó không ai push thẳng vào `main` được nữa, và PR phải có ít nhất 1 approve.

### 8.3 Ba kiểu merge

| Kiểu | Lệnh | Lịch sử `main` sau đó |
|---|---|---|
| Merge commit | `gh pr merge --merge` | Giữ nguyên các commit của nhánh + thêm 1 commit merge. Thấy rõ nhánh đã tồn tại |
| Squash | `gh pr merge --squash` | Nén cả nhánh thành **1 commit duy nhất**. Lịch sử thẳng và gọn, nhưng mất chi tiết |
| Rebase | `gh pr merge --rebase` | Gắn các commit của nhánh vào cuối `main`, không có commit merge. Thẳng nhưng đổi mã commit |

Repo này dùng **merge commit** cho cả 8 PR, để khi xem `git log --graph` bạn thấy rõ hình các nhánh.
