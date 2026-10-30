import os
import matplotlib
matplotlib.use("Agg")
import matplotlib.pyplot as plt
from matplotlib.patches import Ellipse, FancyBboxPatch, Rectangle, Polygon, FancyArrowPatch

plt.rcParams["font.family"] = ["Arial", "Segoe UI Symbol"]
OUT = os.path.join(os.path.dirname(os.path.abspath(__file__)), "img")
os.makedirs(OUT, exist_ok=True)

BLUE = "#DCE8F7"
EDGE = "#2F4F7F"
YEL = "#FFF6D5"
GRN = "#E3F2E1"
GRAY = "#F2F2F2"


def clip(c, o, hw, hh, pad=0.0):
    """Point where the segment from box center c toward o leaves a box of half-size hw x hh."""
    dx, dy = o[0] - c[0], o[1] - c[1]
    t = min(hw / abs(dx) if dx else 1e9, hh / abs(dy) if dy else 1e9)
    d = (dx * dx + dy * dy) ** 0.5
    t += pad / d
    return (c[0] + dx * t, c[1] + dy * t)


def save(fig, name):
    fig.savefig(os.path.join(OUT, name + ".png"), dpi=170, bbox_inches="tight", facecolor="white")
    plt.close(fig)


def new(w, h, xlim, ylim):
    fig, ax = plt.subplots(figsize=(w, h))
    ax.set_xlim(*xlim)
    ax.set_ylim(*ylim)
    ax.axis("off")
    ax.set_aspect("equal")
    return fig, ax


def arrow(ax, p, q, text=None, style="-|>", ls="-", color="black", rad=0.0, fs=8, lw=1.0):
    a = FancyArrowPatch(p, q, arrowstyle=style, mutation_scale=12, color=color, lw=lw,
                        linestyle=ls, connectionstyle=f"arc3,rad={rad}", shrinkA=0, shrinkB=0)
    ax.add_patch(a)
    if text:
        # midpoint of the arc3 quadratic Bezier curve
        mx = (p[0] + q[0]) / 2 + 0.5 * rad * (q[1] - p[1])
        my = (p[1] + q[1]) / 2 - 0.5 * rad * (q[0] - p[0])
        ax.text(mx, my, text, fontsize=fs, ha="center", va="center",
                bbox=dict(fc="white", ec="none", pad=1.0))


def rbox(ax, x, y, w, h, text, fc=BLUE, fs=9, bold=False, ec=EDGE, round_=True):
    style = "round,pad=0.02,rounding_size=0.15" if round_ else "square,pad=0"
    ax.add_patch(FancyBboxPatch((x - w / 2, y - h / 2), w, h, boxstyle=style, fc=fc, ec=ec, lw=1.1))
    ax.text(x, y, text, ha="center", va="center", fontsize=fs, weight="bold" if bold else "normal", wrap=True)


def actor(ax, x, y, name, s=0.35):
    ax.add_patch(plt.Circle((x, y + 1.6 * s), 0.35 * s, fc="white", ec="black", lw=1.2))
    ax.plot([x, x], [y + 1.25 * s, y + 0.3 * s], color="black", lw=1.2)
    ax.plot([x - 0.6 * s, x + 0.6 * s], [y + 1.0 * s, y + 1.0 * s], color="black", lw=1.2)
    ax.plot([x, x - 0.5 * s], [y + 0.3 * s, y - 0.4 * s], color="black", lw=1.2)
    ax.plot([x, x + 0.5 * s], [y + 0.3 * s, y - 0.4 * s], color="black", lw=1.2)
    ax.text(x, y - 0.6 * s, name, ha="center", va="top", fontsize=9, weight="bold")


# ---------------------------------------------------------------- Use case diagrams
def usecase_diagram(name, title, left, ucs, links, right=(), rel=(), cols=1):
    """left/right: list of actor names; ucs: list of use case names;
    links: list of (actor_name, uc_index); rel: list of (from_uc, to_uc, '«include»'/'«extend»')."""
    rows = (len(ucs) + cols - 1) // cols
    uh = 0.95
    height = max(rows * uh + 1.2, 3.2)
    bw = 3.6 * cols + 0.6 + (1.4 if rel else 0)
    x0 = 2.4
    x1 = x0 + bw
    total_w = x1 + (2.4 if right else 0.6)
    fig, ax = new(total_w * 0.95, height * 0.95, (0, total_w), (0, height))
    ax.add_patch(Rectangle((x0, 0.2), bw, height - 0.4, fc="white", ec="black", lw=1.2))
    ax.text(x0 + bw / 2, height - 0.45, title, ha="center", va="center", fontsize=10, weight="bold")
    pos = {}
    top = height - 1.1
    for i, u in enumerate(ucs):
        c, r = i // rows, i % rows
        cx = x0 + 0.3 + 1.8 + c * 3.6
        cy = top - r * uh
        ax.add_patch(Ellipse((cx, cy), 3.3, 0.72, fc=YEL, ec=EDGE, lw=1.1))
        ax.text(cx, cy, u, ha="center", va="center", fontsize=8.3)
        pos[i] = (cx, cy)
    apos = {}
    for side, names, ax_x in (("L", left, 1.1), ("R", right, x1 + 1.3)):
        n = len(names)
        for j, a in enumerate(names):
            ay = height / 2 + (n - 1) * 0.8 - j * 1.6 - 0.3
            actor(ax, ax_x, ay, a)
            apos[a] = (ax_x, ay + 0.35, side)
    for a, i in links:
        axx, ayy, side = apos[a]
        cx, cy = pos[i]
        if side == "L":
            ax.plot([axx + 0.3, cx - 1.65], [ayy, cy], color="black", lw=0.8)
        else:
            ax.plot([axx - 0.3, cx + 1.65], [ayy, cy], color="black", lw=0.8)
    # quan he «extend» / «include»: mui nhon ro tro tu use case mo rong ve use case co so
    for i, j, lab in rel:
        (fx, fy), (tx, ty) = pos[i], pos[j]
        d = max(((tx - fx) ** 2 + (ty - fy) ** 2) ** 0.5, 0.6)
        arrow(ax, (fx + 1.65, fy), (tx + 1.65, ty), lab, style="->", ls="--", color=EDGE,
              rad=1.8 * (1 if ty > fy else -1) / d, fs=7.5)
    save(fig, name)


UC = {}

UC["uc_chung"] = dict(
    title="Chức năng dùng chung",
    left=["Khách vãng lai", "Khách hàng"], right=["Nhân viên", "Quản lý"],
    ucs=["Đăng ký tài khoản", "Đăng nhập trang Web", "Quên mật khẩu", "Đăng nhập ứng dụng quản trị", "Đăng xuất",
         "Đổi mật khẩu"],
    links=[("Khách vãng lai", 0), ("Khách hàng", 1), ("Khách hàng", 2), ("Khách hàng", 4), ("Khách hàng", 5),
           ("Nhân viên", 3), ("Nhân viên", 4), ("Nhân viên", 5), ("Quản lý", 3), ("Quản lý", 4), ("Quản lý", 5)],
    rel=[(2, 1, "«extend»")])

UC["uc_timsach"] = dict(
    title="Subsystem Tìm kiếm và xem sách",
    left=["Khách vãng lai", "Khách hàng"],
    ucs=["Xem danh sách sách", "Tra cứu sách", "Lọc sách theo loại, giá", "Xem chi tiết sách"],
    links=[(a, i) for a in ("Khách vãng lai", "Khách hàng") for i in range(4)],
    rel=[(2, 1, "«extend»")])

UC["uc_giohang"] = dict(
    title="Subsystem Giỏ hàng",
    left=["Khách hàng"],
    ucs=["Xem giỏ hàng", "Thêm sách vào giỏ hàng", "Cập nhật số lượng trong giỏ", "Xóa sách khỏi giỏ hàng"],
    links=[("Khách hàng", i) for i in range(4)])

UC["uc_dathang"] = dict(
    title="Subsystem Đặt hàng và thanh toán",
    left=["Khách hàng"], right=["Cổng thanh toán"],
    ucs=["Đặt hàng", "Thanh toán trực tuyến", "Theo dõi đơn hàng",
         "Xem lịch sử đơn hàng", "Hủy đơn hàng"],
    links=[("Khách hàng", 0), ("Khách hàng", 2), ("Khách hàng", 3), ("Khách hàng", 4), ("Cổng thanh toán", 1)],
    rel=[(1, 0, "«extend»")])

UC["uc_taikhoan"] = dict(
    title="Subsystem Tài khoản khách hàng",
    left=["Khách hàng"],
    ucs=["Xem thông tin cá nhân", "Cập nhật thông tin cá nhân", "Quản lý địa chỉ giao hàng"],
    links=[("Khách hàng", i) for i in range(3)])

UC["uc_sach"] = dict(
    title="Subsystem Quản lý sách và danh mục",
    left=["Quản lý"],
    ucs=["Xem danh sách sách", "Thêm sách", "Cập nhật sách", "Tra cứu sách", "Xem thông tin sách",
         "Xóa (ngừng kinh doanh) sách", "Quản lý loại sách", "Quản lý tác giả", "Quản lý nhà xuất bản",
         "Quản lý nhà cung cấp"],
    links=[("Quản lý", i) for i in range(10)])

UC["uc_donhang"] = dict(
    title="Subsystem Quản lý đơn hàng",
    left=["Nhân viên"],
    ucs=["Xem danh sách đơn hàng", "Tra cứu đơn hàng", "Xem chi tiết đơn hàng", "Xác nhận đơn hàng",
         "Cập nhật trạng thái giao hàng", "Hủy đơn hàng", "In hóa đơn"],
    links=[("Nhân viên", i) for i in range(7)])

UC["uc_kho"] = dict(
    title="Subsystem Quản lý kho và nhập hàng",
    left=["Nhân viên"],
    ucs=["Tra cứu tồn kho", "Thiết lập ngưỡng cảnh báo", "Xem cảnh báo hết hàng", "Xem danh sách phiếu nhập",
         "Lập phiếu nhập", "Sửa phiếu nhập", "Hoàn thành phiếu nhập", "Tra cứu phiếu nhập",
         "Xem thông tin phiếu nhập", "Xóa phiếu nhập"],
    links=[("Nhân viên", i) for i in range(10)])

UC["uc_nguoidung"] = dict(
    title="Subsystem Quản lý khách hàng và nhân viên",
    left=["Quản lý"],
    ucs=["Xem danh sách khách hàng", "Tra cứu khách hàng", "Xem thông tin khách hàng",
         "Khóa / mở khóa tài khoản KH", "Xem danh sách nhân viên", "Thêm nhân viên", "Cập nhật nhân viên",
         "Khóa / mở khóa tài khoản NV"],
    links=[("Quản lý", i) for i in range(8)])

UC["uc_baocao"] = dict(
    title="Subsystem Báo cáo và thống kê",
    left=["Quản lý"],
    ucs=["Xem báo cáo doanh thu", "Xem thống kê sách bán chạy", "Xem báo cáo nhập – xuất – tồn",
         "Xem thống kê đơn hàng theo trạng thái", "Xuất báo cáo ra Excel"],
    links=[("Quản lý", i) for i in range(4)],
    rel=[(4, 0, "«extend»")])

for k, v in UC.items():
    usecase_diagram(k, v["title"], v["left"], v["ucs"], v["links"], v.get("right", ()), v.get("rel", ()),
                    v.get("cols", 1))

# ---------------------------------------------------------------- Actor generalization
fig, ax = new(7, 3.6, (0, 9), (0, 4.6))
actor(ax, 1.2, 1.6, "Khách vãng lai")
actor(ax, 4.5, 3.2, "Người dùng")
actor(ax, 3.0, 0.8, "Khách hàng")
actor(ax, 6.0, 0.8, "Nhân viên")
actor(ax, 8.2, 0.8, "Quản lý")
for p in ((3.0, 1.55), (6.0, 1.55)):
    arrow(ax, p, (4.5, 2.75), style="-|>,head_width=0.4,head_length=0.6", color="black")
arrow(ax, (7.75, 1.15), (6.45, 1.15), style="-|>,head_width=0.4,head_length=0.6")
ax.text(4.5, 4.45, "Quan hệ tổng quát hóa giữa các tác nhân", ha="center", fontsize=10, weight="bold")
save(fig, "actors")

# ---------------------------------------------------------------- Business context
fig, ax = new(10.5, 6.4, (-0.6, 14.6), (0, 9))
rbox(ax, 7, 4.5, 3.4, 1.4, "HỆ THỐNG QUẢN LÝ\nVÀ BÁN SÁCH\nTRỰC TUYẾN", fc="#2F4F7F", fs=10, bold=True)
ax.texts[-1].set_color("white")
ext = {
    "Khách vãng lai": (1.0, 7.8), "Khách hàng": (1.0, 4.5), "Nhân viên": (13.0, 7.8), "Quản lý": (13.0, 4.5),
    "Nhà cung cấp": (13.0, 1.2), "Cổng thanh toán\n(VNPay)": (1.0, 1.2), "Đơn vị vận chuyển": (7, 0.6),
    "Dịch vụ Email": (7, 8.3),
}
flows = {
    "Khách vãng lai": ("Tìm kiếm, xem sách,\nđăng ký", "Danh mục sách"),
    "Khách hàng": ("Giỏ hàng,\nđặt hàng", "Trạng thái đơn,\nhóa đơn"),
    "Nhân viên": ("Xác nhận đơn,\nlập phiếu nhập", "Đơn hàng mới,\ncảnh báo tồn kho"),
    "Quản lý": ("Sách, danh mục,\ntài khoản", "Báo cáo doanh thu,\nthống kê"),
    "Nhà cung cấp": ("Giao sách\n(phiếu nhập)", ""),
    "Cổng thanh toán\n(VNPay)": ("Kết quả\nthanh toán", "Yêu cầu\nthanh toán"),
    "Đơn vị vận chuyển": ("Trạng thái giao", "Đơn cần giao"),
    "Dịch vụ Email": ("", "Email xác nhận,\nđặt lại mật khẩu"),
}
CHANNEL = {"Khách vãng lai": "\n(Web)", "Khách hàng": "\n(Web)", "Nhân viên": "\n(App Desktop)", "Quản lý": "\n(App Desktop)"}
for n, (x, y) in ext.items():
    rbox(ax, x, y, 2.6, 1.0, n + CHANNEL.get(n, ""), fc=GRN if n not in CHANNEL else
         ("#FFF2CC" if "Web" in CHANNEL[n] else BLUE), fs=9, bold=True)
    inn, out = flows[n]
    # two parallel lines, offset perpendicular to the center-to-center direction
    dx, dy = x - 7, y - 4.5
    d = (dx * dx + dy * dy) ** 0.5
    nx, ny = -dy / d * 0.17, dx / d * 0.17
    for txt, sign, color, to_sys in ((inn, 1, "#1a5e20", True), (out, -1, "#8a3b00", False)):
        if not txt:
            continue
        c1, c2 = (7 + sign * nx, 4.5 + sign * ny), (x + sign * nx, y + sign * ny)
        p_sys = clip(c1, c2, 1.75, 0.75, 0.05)
        p_ext = clip(c2, c1, 1.35, 0.55, 0.05)
        arrow(ax, p_ext, p_sys) if to_sys else arrow(ax, p_sys, p_ext)
        mx, my = (p_sys[0] + p_ext[0]) / 2, (p_sys[1] + p_ext[1]) / 2
        if abs(dx) < 0.1:
            lx, ha = (mx - 0.25, "right") if sign > 0 else (mx + 0.25, "left")
            ly = my
        else:
            f = 0.62
            lx = p_sys[0] + (p_ext[0] - p_sys[0]) * f + sign * nx * 3.4
            ly = p_sys[1] + (p_ext[1] - p_sys[1]) * f + sign * ny * 3.4
            ha = "center"
        ax.text(lx, ly, txt, fontsize=7, ha=ha, va="center", color=color)
save(fig, "context")


# ---------------------------------------------------------------- Activity diagrams
def activity(name, lanes, nodes, edges, rows, lane_w=4.2):
    H = rows * 1.05 + 1.4
    W = lane_w * len(lanes)
    fig, ax = new(W * 0.85, H * 0.85, (0, W), (0, H))
    for i, l in enumerate(lanes):
        ax.add_patch(Rectangle((i * lane_w, 0), lane_w, H, fc="white" if i % 2 else "#FAFAFA", ec="black", lw=1))
        ax.add_patch(Rectangle((i * lane_w, H - 0.7), lane_w, 0.7, fc=BLUE, ec="black", lw=1))
        ax.text(i * lane_w + lane_w / 2, H - 0.35, l, ha="center", va="center", fontsize=10, weight="bold")
    P = {}
    for key, (lane, r, kind, text) in nodes.items():
        x = lane * lane_w + lane_w / 2
        y = H - 1.3 - r * 1.05
        P[key] = (x, y, kind)
        if kind == "start":
            ax.add_patch(plt.Circle((x, y), 0.2, color="black"))
        elif kind == "end":
            ax.add_patch(plt.Circle((x, y), 0.24, fc="white", ec="black", lw=1.4))
            ax.add_patch(plt.Circle((x, y), 0.14, color="black"))
        elif kind == "dec":
            ax.add_patch(Polygon([(x, y + 0.42), (x + 1.2, y), (x, y - 0.42), (x - 1.2, y)], fc=YEL, ec=EDGE))
            ax.text(x, y, text, ha="center", va="center", fontsize=7.6)
        else:
            rbox(ax, x, y, lane_w - 0.5, 0.72, text, fc="white", fs=7.8)

    def anchor(k, toward):
        x, y, kind = P[k]
        tx, ty, _ = P[toward]
        if kind in ("start", "end"):
            r = 0.22
            if abs(tx - x) > abs(ty - y):
                return (x + (r if tx > x else -r), y)
            return (x, y + (r if ty > y else -r))
        hw = 1.2 if kind == "dec" else (lane_w - 0.5) / 2
        hh = 0.42 if kind == "dec" else 0.36
        if abs(ty - y) < 0.2 or abs(tx - x) > 1.5 * lane_w / 2 and abs(ty - y) < 1.2:
            return (x + (hw if tx > x else -hw), y)
        return (x, y + (hh if ty > y else -hh))

    def side(k, s):
        x, y, kind = P[k]
        hw = 1.2 if kind == "dec" else (lane_w - 0.5) / 2
        hh = 0.42 if kind == "dec" else 0.36
        return {"L": (x - hw, y), "R": (x + hw, y), "T": (x, y + hh), "B": (x, y - hh)}[s]

    for e in edges:
        f, t = e[0], e[1]
        lab = e[2] if len(e) > 2 else None
        rad = e[3] if len(e) > 3 else 0.0
        if len(e) > 4:
            arrow(ax, side(f, e[4][0]), side(t, e[4][1]), lab, rad=rad, fs=7)
        else:
            arrow(ax, anchor(f, t), anchor(t, f), lab, rad=rad, fs=7)
    save(fig, name)


activity("wf_dathang", ["Khách hàng", "Hệ thống", "Cổng thanh toán"], {
    "s": (0, 0, "start", ""),
    "a1": (0, 1, "act", "Tìm kiếm, xem chi tiết sách"),
    "a2": (0, 2, "act", "Chọn Thêm sách vào giỏ hàng"),
    "d1": (1, 3, "dec", "Đã đăng nhập?"),
    "a3": (0, 3, "act", "Đăng nhập / Đăng ký"),
    "a4": (1, 4, "act", "Kiểm tra tồn kho,\nlưu sách vào giỏ hàng"),
    "a5": (0, 5, "act", "Xem giỏ hàng, chọn Đặt hàng"),
    "a6": (0, 6, "act", "Nhập thông tin giao hàng,\nchọn phương thức thanh toán"),
    "d2": (1, 7, "dec", "Còn đủ tồn kho?"),
    "a7": (0, 7, "act", "Cập nhật lại giỏ hàng,\nthông báo sách không đủ"),
    "a8": (1, 8, "act", "Tính tiền, tạo đơn hàng,\ntrừ tồn kho, xóa giỏ hàng"),
    "d3": (1, 9, "dec", "Thanh toán\ntrực tuyến?"),
    "a9": (2, 10, "act", "Khách hàng thanh toán\ntrên cổng VNPay"),
    "d4": (1, 11, "dec", "Thanh toán\nthành công?"),
    "a10": (1, 12, "act", "Chuyển đơn sang Chờ xác nhận,\ngửi email xác nhận đơn hàng"),
    "a11": (2, 12, "act", "Thanh toán lại\n(trong 30 phút)"),
    "a12": (0, 13, "act", "Nhận thông báo đặt hàng"),
    "e": (0, 14, "end", ""),
}, [("s", "a1"), ("a1", "a2"), ("a2", "d1", None, 0, "RT"), ("d1", "a3", "Chưa", 0, "LR"),
    ("a3", "a4", None, 0, "BL"), ("d1", "a4", "Rồi", 0, "BT"), ("a4", "a5", None, 0, "BR"),
    ("a5", "a6"), ("a6", "d2", None, 0, "RT"), ("d2", "a7", "Không", 0, "LR"),
    ("a7", "a5", None, -0.5, "RR"), ("d2", "a8", "Có", 0, "BT"), ("a8", "d3"),
    ("d3", "a9", "Có"), ("a9", "d4", None, 0, "BR"), ("d4", "a10", "Có", 0, "BT"),
    ("d4", "a11", "Không", 0, "RL"), ("a11", "a9"), ("d3", "a10", "COD", 0.45, "LL"),
    ("a10", "a12", None, 0, "BR"), ("a12", "e")], rows=14)

activity("wf_nhaphang", ["Nhân viên", "Hệ thống"], {
    "s": (1, 0, "start", ""),
    "a1": (1, 1, "act", "Phát hiện sách dưới ngưỡng tồn,\nhiển thị cảnh báo"),
    "a2": (0, 2, "act", "Xem cảnh báo, lập phiếu nhập\n(NCC, sách, số lượng, giá nhập)"),
    "a3": (1, 3, "act", "Kiểm tra hợp lệ, lưu phiếu\nnhập trạng thái Chờ nhập"),
    "a4": (0, 4, "act", "Nhận hàng thực tế,\nđối chiếu với phiếu nhập"),
    "d1": (0, 5, "dec", "Khớp phiếu?"),
    "a5": (1, 5, "act", "Cập nhật phiếu nhập"),
    "a6": (0, 6, "act", "Chọn Hoàn thành phiếu nhập"),
    "a7": (1, 7, "act", "Cộng số lượng tồn kho,\nkhóa phiếu nhập"),
    "e": (1, 8, "end", ""),
}, [("s", "a1"), ("a1", "a2"), ("a2", "a3"), ("a3", "a4"), ("a4", "d1"), ("d1", "a5", "Không"),
    ("a5", "a4", None, 0.2), ("d1", "a6", "Có"), ("a6", "a7"), ("a7", "e")], rows=8, lane_w=4.6)

# ---------------------------------------------------------------- Order state machine
fig, ax = new(11, 5.2, (0, 16), (0, 7.4))
S = {"Chờ thanh toán": (3.2, 5.6), "Chờ xác nhận": (3.2, 2.2), "Đã xác nhận": (7.6, 2.2),
     "Đang giao": (11.6, 2.2), "Hoàn thành": (14.6, 4.2), "Đã hủy": (9.4, 5.9)}
for n, (x, y) in S.items():
    rbox(ax, x, y, 2.6, 0.85, n, fc=GRN if n == "Hoàn thành" else ("#F9DADA" if n == "Đã hủy" else BLUE),
         fs=9.5, bold=True)
ax.add_patch(plt.Circle((0.5, 3.9), 0.2, color="black"))
ax.add_patch(plt.Circle((14.6, 6.4), 0.24, fc="white", ec="black", lw=1.4))
ax.add_patch(plt.Circle((14.6, 6.4), 0.14, color="black"))
T = [((0.7, 4.0), (1.9, 5.4), "Đặt hàng\n(trực tuyến)", 0), ((0.7, 3.8), (1.9, 2.4), "Đặt hàng\n(COD)", 0),
     ((3.2, 5.17), (3.2, 2.63), "Thanh toán\nthành công", 0),
     ((4.5, 5.75), (8.1, 5.9), "Thất bại / quá hạn / KH hủy", 0),
     ((4.5, 2.45), (8.4, 5.5), "KH hủy / NV từ chối", 0),
     ((4.5, 2.2), (6.3, 2.2), "NV xác nhận", 0), ((8.9, 2.2), (10.3, 2.2), "Bàn giao\nvận chuyển", 0),
     ((12.9, 2.4), (13.9, 3.77), "Giao thành công", 0), ((11.2, 2.63), (9.9, 5.47), "Giao thất bại\n(hoàn kho)", 0),
     ((14.6, 4.63), (14.6, 6.16), None, 0), ((10.7, 6.0), (14.36, 6.4), None, 0)]
for p, q, lab, r in T:
    arrow(ax, p, q, lab, rad=r, fs=7.5)
ax.text(8, 7.25, "Sơ đồ trạng thái đơn hàng", ha="center", fontsize=11, weight="bold")
save(fig, "state_donhang")

# ---------------------------------------------------------------- Functional decomposition
groups = [
    ("Dùng chung", ["Đăng ký", "Đăng nhập", "Đăng xuất", "Quên mật khẩu", "Đổi mật khẩu"]),
    ("Tìm kiếm và\nxem sách", ["Xem danh sách", "Tra cứu", "Lọc sách", "Xem chi tiết"]),
    ("Giỏ hàng", ["Xem giỏ hàng", "Thêm vào giỏ", "Cập nhật SL", "Xóa khỏi giỏ"]),
    ("Đặt hàng và\nthanh toán", ["Đặt hàng", "Thanh toán", "Theo dõi đơn", "Lịch sử đơn", "Hủy đơn"]),
    ("Tài khoản\nkhách hàng", ["Xem thông tin", "Cập nhật TT", "Địa chỉ GH"]),
    ("Quản lý sách\nvà danh mục", ["Sách", "Loại sách", "Tác giả", "Nhà xuất bản", "Nhà cung cấp"]),
    ("Quản lý\nđơn hàng", ["Danh sách", "Tra cứu", "Chi tiết", "Xác nhận", "Cập nhật giao", "Hủy đơn", "In hóa đơn"]),
    ("Quản lý kho\nvà nhập hàng", ["Tồn kho", "Ngưỡng cảnh báo", "Lập phiếu", "Sửa phiếu", "Hoàn thành", "Tra cứu", "Xóa phiếu"]),
    ("Quản lý KH\nvà nhân viên", ["Khách hàng", "Nhân viên", "Khóa tài khoản"]),
    ("Báo cáo và\nthống kê", ["Doanh thu", "Sách bán chạy", "Nhập–xuất–tồn", "Đơn hàng", "Xuất Excel"]),
]
n = len(groups)
cw = 1.75
W = n * cw + 0.4
fig, ax = new(W * 0.9, 7.2, (0, W), (0, 8.6))
rbox(ax, W / 2, 8.0, 6.5, 0.8, "HỆ THỐNG QUẢN LÝ VÀ BÁN SÁCH TRỰC TUYẾN", fc=EDGE, fs=10.5, bold=True)
ax.texts[-1].set_color("white")
ax.plot([0.2 + cw / 2, 0.2 + cw * (n - 0.5)], [7.1, 7.1], color="black", lw=1)
ax.plot([W / 2, W / 2], [7.6, 7.1], color="black", lw=1)
for i, (g, fs_) in enumerate(groups):
    x = 0.2 + cw * (i + 0.5)
    ax.plot([x, x], [7.1, 6.75], color="black", lw=1)
    rbox(ax, x, 6.35, cw - 0.12, 0.8, g, fc="#FFF2CC" if i < 5 else BLUE, fs=7.6, bold=True)
    ax.plot([x - cw / 2 + 0.2, x - cw / 2 + 0.2], [5.95, 5.6 - 0.62 * (len(fs_) - 1)], color="black", lw=0.8)
    for j, f in enumerate(fs_):
        y = 5.6 - j * 0.62
        ax.plot([x - cw / 2 + 0.2, x - cw / 2 + 0.3], [y, y], color="black", lw=0.8)
        rbox(ax, x + 0.1, y, cw - 0.45, 0.48, f, fc="white", fs=6.8, round_=False)
for k, (fc, lab) in enumerate((("#FFF2CC", "Ứng dụng Web (Blazor) – Khách vãng lai, Khách hàng"),
                               (BLUE, "Ứng dụng quản trị Desktop (WinUI 3) – Nhân viên, Quản lý"))):
    ax.add_patch(Rectangle((0.4 + k * 9.5, 1.2), 0.5, 0.35, fc=fc, ec=EDGE))
    ax.text(1.05 + k * 9.5, 1.37, lab, fontsize=8.5, va="center")
save(fig, "phanra")

# ---------------------------------------------------------------- Kiến trúc tổng thể
fig, ax = new(10, 7.4, (0, 14), (0, 10.4))
ax.text(7, 10.1, "Kiến trúc tổng thể hệ thống", ha="center", fontsize=11, weight="bold")
ax.add_patch(Rectangle((0.3, 7.3), 5.6, 2.3, fc="#FFFBEA", ec="#B7950B", ls="--"))
ax.text(0.45, 9.4, "Máy khách hàng", fontsize=8, color="#7D6608")
rbox(ax, 3.1, 8.3, 4.6, 1.1, "Trình duyệt Web\n(Khách vãng lai, Khách hàng)", fc="#FFF2CC", fs=9, bold=True)
ax.add_patch(Rectangle((8.1, 7.3), 5.6, 2.3, fc="#F2F7FD", ec=EDGE, ls="--"))
ax.text(8.25, 9.4, "Máy tính Windows tại nhà sách", fontsize=8, color=EDGE)
rbox(ax, 10.9, 8.3, 4.6, 1.1, "BookStore.Admin – WinUI 3\n(MVVM, Nhân viên, Quản lý)", fc=BLUE, fs=9, bold=True)
ax.add_patch(Rectangle((0.3, 0.3), 13.4, 6.5, fc="#FAFAFA", ec="#666", ls="--"))
ax.text(0.45, 6.55, "Máy chủ", fontsize=8, color="#444")
rbox(ax, 3.1, 5.6, 4.6, 1.0, "BookStore.Web\nBlazor Web App + Identity", fc="#FFF2CC", fs=9, bold=True)
rbox(ax, 10.9, 5.6, 4.6, 1.0, "BookStore.Api\nASP.NET Core Web API + JWT", fc=BLUE, fs=9, bold=True)
rbox(ax, 7, 3.8, 9.0, 0.9, "BookStore.Services – tầng nghiệp vụ (validation, quy tắc nghiệp vụ, DI)", fc=GRN, fs=9, bold=True)
rbox(ax, 7, 2.55, 9.0, 0.8, "BookStore.Data – EF Core 8 (DbContext, Migrations)   |   BookStore.Domain – Entity", fc=GRN, fs=8.6)
rbox(ax, 7, 1.15, 4.2, 0.9, "Microsoft SQL Server\n(CSDL dùng chung)", fc="#E8E8E8", fs=9, bold=True)
arrow(ax, (3.1, 7.75), (3.1, 6.1), "HTTPS / SignalR", fs=7.5)
arrow(ax, (10.9, 7.75), (10.9, 6.1), "HTTPS / JSON (JWT)", fs=7.5)
arrow(ax, (3.1, 5.1), (4.2, 4.25))
arrow(ax, (10.9, 5.1), (9.8, 4.25))
arrow(ax, (7, 3.35), (7, 2.95))
arrow(ax, (7, 2.15), (7, 1.6))
rbox(ax, 12.4, 1.15, 2.2, 0.8, "BookStore.Tests\n(xUnit)", fc="white", fs=8)
arrow(ax, (12.4, 1.55), (11.3, 3.35), None, ls="--")
save(fig, "kientruc")

# ---------------------------------------------------------------- Entity / table boxes
def sbox(ax, x, y, w, name, rows, fs, hfs, line, hdr):
    """Box kieu thuc the / bang: tieu de + moi thuoc tinh mot dong.
    Hau to '*' = thuoc tinh khoa (duoc gach chan), tien to '#' = khoa ngoai (in nghieng)."""
    h = hdr + line * len(rows) + 0.14
    top = y + h / 2
    ax.add_patch(Rectangle((x - w / 2, y - h / 2), w, h, fc="white", ec=EDGE, lw=1.1, zorder=2))
    ax.add_patch(Rectangle((x - w / 2, top - hdr), w, hdr, fc=BLUE, ec=EDGE, lw=1.1, zorder=2))
    ax.text(x, top - hdr / 2, name, ha="center", va="center", fontsize=hfs, weight="bold", zorder=3)
    keys = []
    for i, r in enumerate(rows):
        ry = top - hdr - line * (i + 0.55)
        fk = r.startswith("#")
        nm = r.lstrip("#").rstrip("*")
        tx = x - w / 2 + 0.18
        if fk:
            ax.text(tx, ry, "#", ha="left", va="center", fontsize=fs, zorder=3)
            tx += 0.3
        t = ax.text(tx, ry, nm, ha="left", va="center", fontsize=fs, zorder=3,
                    style="italic" if fk else "normal")
        if r.endswith("*"):
            keys.append((t, ry - line * 0.33))
    return (w / 2, h / 2), keys


def underline(fig, ax, texts):
    """Gach chan cac thuoc tinh khoa (goi sau khi moi text da duoc dat)."""
    fig.canvas.draw()
    inv = ax.transData.inverted()
    for t, y in texts:
        bb = t.get_window_extent().transformed(inv)
        ax.plot([bb.x0, bb.x1], [y, y], color="black", lw=0.7, zorder=3)


def anchor_of(geo, spec):
    """spec la mot trong L, R, T, B; them dau hai cham va so de dich diem neo doc canh."""
    (x, y), (hw, hh) = geo
    s, _, off = spec.partition(":")
    o = float(off) if off else 0.0
    return {"L": (x - hw, y + o), "R": (x + hw, y + o),
            "T": (x + o, y + hh), "B": (x + o, y - hh)}[s]


def schema_figure(fname, ent, edges, xlim, ylim, w, fs, hfs, line=0.33, hdr=0.55,
                  unit=0.62, card_fs=11, name_fs=10.5, lc="#555"):
    """Ve luoc do gom cac box thuc the/bang va cac duong noi co ghi ban so.
    ent: {ten: (x, y, [thuoc tinh])}
    edges: (a, b, neo_a, neo_b, ban_so_a, ban_so_b, [nhan], [rad], [lech_nhan])"""
    fig, ax = new((xlim[1] - xlim[0]) * unit, (ylim[1] - ylim[0]) * unit, xlim, ylim)
    geo, keys = {}, []
    for k, (x, y, rows) in ent.items():
        hs, kk = sbox(ax, x, y, w, k, rows, fs, hfs, line, hdr)
        geo[k] = ((x, y), hs)
        keys += kk
    for e in edges:
        a, b, sa, sb, ca, cb = e[:6]
        lab = e[6] if len(e) > 6 else None
        rad = e[7] if len(e) > 7 else 0.0
        nud = e[8] if len(e) > 8 else (0.0, 0.0)
        p, q = anchor_of(geo[a], sa), anchor_of(geo[b], sb)
        ax.add_patch(FancyArrowPatch(p, q, arrowstyle="-", color=lc, lw=1.0, shrinkA=0, shrinkB=0,
                                     connectionstyle="arc3,rad=%g" % rad, zorder=1))
        dx, dy = q[0] - p[0], q[1] - p[1]
        d = (dx * dx + dy * dy) ** 0.5
        ux, uy = dx / d, dy / d
        # ban so dat sat moi dau, lech sang mot ben cua duong noi (bam theo do cong)
        for (bx, by), s, c in ((p, 1, ca), (q, -1, cb)):
            if not c:
                continue
            tx = ux * s + rad * dy * s * 0.6
            ty = uy * s - rad * dx * s * 0.6
            n = (tx * tx + ty * ty) ** 0.5
            tx, ty = tx / n, ty / n
            ax.text(bx + tx * 0.36 - ty * 0.3, by + ty * 0.36 + tx * 0.3, c, fontsize=card_fs,
                    weight="bold", color="#B22222", ha="center", va="center", zorder=3)
        if lab:
            mx = (p[0] + q[0]) / 2 + 0.5 * rad * dy + nud[0]
            my = (p[1] + q[1]) / 2 - 0.5 * rad * dx + nud[1]
            ax.text(mx, my, lab, fontsize=name_fs, ha="center", va="center", style="italic", zorder=3,
                    bbox=dict(fc="white", ec="#888", boxstyle="round,pad=0.2"))
    underline(fig, ax, keys)
    save(fig, fname)


# ---------------------------------------------------------------- Conceptual ERD
ERD_ENT = {
    "VaiTro": (0, 19.275, ["MaVaiTro*", "TenVaiTro"]),
    "TaiKhoan": (0, 14.705, ["MaTaiKhoan*", "TenDangNhap", "Email", "MatKhauHash", "TrangThai",
                             "SoLanDangNhapSai", "ThoiDiemHetKhoa", "TokenDatLaiMatKhau", "HanToken",
                             "NgayTao"]),
    "KhachHang": (0, 9.565, ["MaKH*", "HoTen", "SoDienThoai", "NgaySinh", "GioiTinh"]),
    "DiaChiGiaoHang": (0, 5.375, ["MaDiaChi*", "TenNguoiNhan", "SoDienThoai", "DiaChi", "MacDinh"]),
    "GioHang": (0, 1.755, ["MaGioHang*", "NgayCapNhat"]),
    "NhanVien": (5.0, 18.705, ["MaNV*", "HoTen", "SoDienThoai", "ChucVu", "NgayVaoLam"]),
    "DonHang": (5.0, 13.375, ["MaDH*", "NgayDat", "TenNguoiNhan", "SoDienThoaiNhan", "DiaChiGiao",
                              "TamTinh", "PhiVanChuyen", "TongTien", "PhuongThucTT", "TrangThai",
                              "GhiChu"]),
    "ThanhToan": (5.0, 7.855, ["MaTT*", "SoTien", "PhuongThuc", "MaGiaoDich", "TrangThai", "ThoiGian"]),
    "Sach": (5.0, 2.525, ["MaSach*", "TenSach", "NamXuatBan", "SoTrang", "GiaBan", "SoLuongTon",
                          "NguongCanhBao", "MoTa", "AnhBia", "TrangThai"]),
    "NhaCungCap": (10.0, 18.705, ["MaNCC*", "TenNCC", "DiaChi", "SoDienThoai", "Email"]),
    "PhieuNhap": (10.0, 14.515, ["MaPN*", "NgayLap", "NgayHoanThanh", "TongTien", "TrangThai"]),
    "LoaiSach": (10.0, 7.4, ["MaLoai*", "TenLoai", "MoTa"]),
    "NhaXuatBan": (10.0, 4.0, ["MaNXB*", "TenNXB", "DiaChi", "SoDienThoai"]),
    "TacGia": (10.0, 0.8, ["MaTacGia*", "TenTacGia", "TieuSu"]),
}
ERD_REL = [
    ("VaiTro", "TaiKhoan", "B", "T", "1", "n", "phân quyền"),
    ("TaiKhoan", "KhachHang", "B", "T", "1", "1", "thuộc"),
    ("TaiKhoan", "NhanVien", "R:+1.5", "L:-1.3", "1", "1", "thuộc"),
    ("KhachHang", "DiaChiGiaoHang", "B", "T", "1", "n", "có"),
    ("KhachHang", "GioHang", "L:-0.6", "L:+0.3", "1", "1", "sở hữu", 0.26),
    ("GioHang", "Sach", "R", "L:-1.5", "n", "n", "chứa\n(SoLuong)"),
    ("KhachHang", "DonHang", "R", "L:-2.0", "1", "n", "đặt"),
    ("NhanVien", "DonHang", "B", "T", "1", "n", "xử lý"),
    ("DonHang", "ThanhToan", "B", "T", "1", "n", "có"),
    ("DonHang", "Sach", "R:-2.0", "R:+2.0", "n", "n", "gồm\n(SoLuong, DonGia)", -0.38, (0, 2.8)),
    ("NhaCungCap", "PhieuNhap", "B", "T", "1", "n", "cung cấp"),
    ("NhanVien", "PhieuNhap", "R", "L:+0.6", "1", "n", "lập"),
    ("PhieuNhap", "Sach", "B", "T:+1.2", "n", "n", "nhập\n(SoLuong, GiaNhap)", 0.0, (0.45, 0.1)),
    ("Sach", "LoaiSach", "R:+1.0", "L", "n", "1", "thuộc"),
    ("Sach", "NhaXuatBan", "R", "L", "n", "1", "xuất bản"),
    ("Sach", "TacGia", "R:-1.5", "L", "n", "n", "viết bởi"),
]
schema_figure("erd", ERD_ENT, ERD_REL, (-3.1, 12.2), (-0.6, 20.6), w=3.4, fs=10.5, hfs=11.5)

# ---------------------------------------------------------------- Physical database diagram
DB_ENT = {
    "VaiTro": (0, 18.4, ["MaVaiTro*"]),
    "TaiKhoan": (0, 15.8, ["MaTaiKhoan*", "#MaVaiTro"]),
    "KhachHang": (0, 12.8, ["MaKH*", "#MaTaiKhoan"]),
    "DiaChiGiaoHang": (0, 10.1, ["MaDiaChi*", "#MaKH"]),
    "GioHang": (0, 7.4, ["MaGioHang*", "#MaKH"]),
    "CTGioHang": (0, 4.7, ["#MaGioHang*", "#MaSach*"]),
    "NhanVien": (4.4, 15.8, ["MaNV*", "#MaTaiKhoan"]),
    "DonHang": (4.4, 12.8, ["MaDH*", "#MaKH", "#MaNV"]),
    "LichSuDonHang": (4.4, 10.1, ["MaLichSu*", "#MaDH", "#NguoiThucHien"]),
    "ThanhToan": (4.4, 8.2, ["MaTT*", "#MaDH"]),
    "CTDonHang": (4.4, 4.2, ["#MaDH*", "#MaSach*"]),
    "LoaiSach": (8.8, 12.8, ["MaLoai*"]),
    "Sach": (8.8, 9.2, ["MaSach*", "#MaLoai", "#MaNXB"]),
    "Sach_TacGia": (8.8, 5.0, ["#MaSach*", "#MaTacGia*"]),
    "TacGia": (8.8, 2.6, ["MaTacGia*"]),
    "NhaCungCap": (13.2, 15.8, ["MaNCC*"]),
    "PhieuNhap": (13.2, 12.8, ["MaPN*", "#MaNCC", "#MaNV"]),
    "CTPhieuNhap": (13.2, 9.2, ["#MaPN*", "#MaSach*"]),
    "NhaXuatBan": (13.2, 5.6, ["MaNXB*"]),
}
DB_FK = [
    ("TaiKhoan", "VaiTro", "T", "B", "n", "1"),
    ("KhachHang", "TaiKhoan", "T", "B", "1", "1"),
    ("NhanVien", "TaiKhoan", "L", "R", "1", "1"),
    ("DiaChiGiaoHang", "KhachHang", "T", "B", "n", "1"),
    ("GioHang", "KhachHang", "L:+0.3", "L:-0.4", "1", "1", None, 0.24),
    ("CTGioHang", "GioHang", "T", "B", "n", "1"),
    ("CTGioHang", "Sach", "R", "B:-1.0", "n", "1"),
    ("CTDonHang", "DonHang", "R:+0.3", "R:-0.5", "n", "1", None, -0.26),
    ("CTDonHang", "Sach", "R:-0.3", "B:-0.3", "n", "1"),
    ("ThanhToan", "DonHang", "L:-0.2", "L:-0.5", "n", "1", None, 0.16),
    ("LichSuDonHang", "DonHang", "T", "B", "n", "1"),
    ("LichSuDonHang", "TaiKhoan", "L:+0.4", "B:-0.9", "n", "1", None, 0.3),
    ("Sach", "LoaiSach", "T:-0.6", "B", "n", "1"),
    ("Sach", "NhaXuatBan", "R:-0.5", "L", "n", "1"),
    ("Sach_TacGia", "Sach", "T", "B:+0.6", "n", "1"),
    ("Sach_TacGia", "TacGia", "B", "T", "n", "1"),
    ("PhieuNhap", "NhaCungCap", "T", "B", "n", "1"),
    ("PhieuNhap", "NhanVien", "L", "R:-0.4", "n", "1"),
    ("CTPhieuNhap", "PhieuNhap", "T", "B", "n", "1"),
    ("CTPhieuNhap", "Sach", "L", "R:+0.5", "n", "1"),
]
schema_figure("db_vatly", DB_ENT, DB_FK, (-3.2, 15.4), (1.6, 19.4), w=3.3, fs=9.5, hfs=10.5,
              line=0.3, hdr=0.52, card_fs=9.5)


# ---------------------------------------------------------------- Wireframes
def frame(title):
    fig, ax = plt.subplots(figsize=(9, 6))
    ax.set_xlim(0, 100)
    ax.set_ylim(0, 66)
    ax.axis("off")
    ax.add_patch(Rectangle((0, 0), 100, 66, fc="white", ec="#444", lw=1.5))
    ax.add_patch(Rectangle((0, 62), 100, 4, fc="#E6E6E6", ec="#444", lw=1))
    for i, c in enumerate(("#E06666", "#F6B26B", "#93C47D")):
        ax.add_patch(plt.Circle((2.5 + i * 2.2, 64), 0.7, color=c))
    ax.text(50, 64, title, ha="center", va="center", fontsize=8, color="#333")
    return fig, ax


def wbox(ax, x, y, w, h, text="", fc="white", fs=7.5, ec="#777", bold=False, ha="center"):
    ax.add_patch(Rectangle((x, y), w, h, fc=fc, ec=ec, lw=0.9))
    if text:
        tx = x + w / 2 if ha == "center" else x + 1
        ax.text(tx, y + h / 2, text, ha=ha, va="center", fontsize=fs, weight="bold" if bold else "normal")


def img(ax, x, y, w, h):
    wbox(ax, x, y, w, h, fc="#EEEEEE")
    ax.plot([x, x + w], [y, y + h], color="#BBB", lw=0.7)
    ax.plot([x, x + w], [y + h, y], color="#BBB", lw=0.7)


def shop_header(ax):
    wbox(ax, 0, 55, 100, 7, fc="#2F4F7F")
    ax.text(3, 58.5, "BOOKSTORE", color="white", fontsize=11, weight="bold", va="center")
    wbox(ax, 25, 56.5, 42, 4, "Tìm sách theo tên, tác giả...", ha="left", fs=7)
    wbox(ax, 67, 56.5, 6, 4, "Tìm", fc="#F6B26B", fs=7)
    ax.text(80, 58.5, "Giỏ hàng (3)", color="white", fontsize=7.5, va="center")
    ax.text(91, 58.5, "Tài khoản", color="white", fontsize=7.5, va="center")


# Trang chủ
fig, ax = frame("Trang chủ – danh sách sách")
shop_header(ax)
wbox(ax, 2, 4, 20, 49, fc=GRAY)
ax.text(3, 50.5, "DANH MỤC", fontsize=8, weight="bold")
for i, c in enumerate(["Văn học", "Kinh tế", "Thiếu nhi", "Kỹ năng sống", "Ngoại ngữ", "Công nghệ"]):
    ax.text(4, 47 - i * 3, "▸ " + c, fontsize=7.3)
ax.text(3, 27, "LỌC THEO GIÁ", fontsize=8, weight="bold")
for i, c in enumerate(["Dưới 100.000đ", "100.000 – 300.000đ", "Trên 300.000đ"]):
    wbox(ax, 4, 23 - i * 3, 1.5, 1.5)
    ax.text(7, 23.7 - i * 3, c, fontsize=7, va="center")
wbox(ax, 25, 44, 73, 9, "Banner sách nổi bật", fc="#FCE5CD", fs=9)
ax.text(25, 41.5, "Sách mới", fontsize=8.5, weight="bold")
ax.text(98, 41.5, "Sắp xếp: Mới nhất ▾", fontsize=7, ha="right")
for i in range(5):
    x = 25 + i * 14.8
    img(ax, x, 22, 13, 18)
    ax.text(x, 20, "Tên sách", fontsize=7.3, weight="bold")
    ax.text(x, 18, "Tác giả", fontsize=6.8, color="#555")
    ax.text(x, 16, "120.000đ", fontsize=7.3, color="#C00000", weight="bold")
    wbox(ax, x, 11.5, 13, 3, "Thêm vào giỏ", fc="#F6B26B", fs=6.8)
wbox(ax, 50, 4, 24, 3.5, "‹  1  2  3  ...  10  ›", fs=7.5)
save(fig, "wf_home")

# Chi tiết sách
fig, ax = frame("Chi tiết sách")
shop_header(ax)
img(ax, 3, 22, 26, 31)
ax.text(33, 50, "TÊN SÁCH", fontsize=13, weight="bold")
for i, t in enumerate(["Tác giả: ...", "Nhà xuất bản: ...", "Loại sách: ...", "Năm XB: ...  |  Số trang: ...",
                       "ISBN: ..."]):
    ax.text(33, 46 - i * 2.8, t, fontsize=8)
ax.text(33, 30.5, "150.000đ", fontsize=13, color="#C00000", weight="bold")
ax.text(33, 27.5, "Còn hàng: 35", fontsize=7.5, color="#38761D")
wbox(ax, 33, 21.5, 4, 3.5, "−")
wbox(ax, 37, 21.5, 6, 3.5, "1")
wbox(ax, 43, 21.5, 4, 3.5, "+")
wbox(ax, 50, 21.5, 20, 3.5, "THÊM VÀO GIỎ HÀNG", fc="#F6B26B", bold=True)
wbox(ax, 72, 21.5, 15, 3.5, "MUA NGAY", fc="#C00000", bold=True)
wbox(ax, 3, 3, 94, 16, fc=GRAY)
ax.text(5, 17, "Mô tả sách", fontsize=8.5, weight="bold")
for i in range(3):
    ax.text(5, 13.5 - i * 3.2, "Nội dung giới thiệu, tóm tắt sách ...", fontsize=7.3)
save(fig, "wf_detail")

# Giỏ hàng + thanh toán
fig, ax = frame("Giỏ hàng và đặt hàng")
shop_header(ax)
ax.text(3, 51.5, "GIỎ HÀNG", fontsize=10, weight="bold")
wbox(ax, 3, 46, 60, 3.5, fc="#D9D9D9")
for x, t in ((5, "Sách"), (34, "Đơn giá"), (44, "Số lượng"), (54, "Thành tiền")):
    ax.text(x, 47.75, t, fontsize=7.5, weight="bold", va="center")
for i in range(3):
    y = 38 - i * 8.5
    wbox(ax, 3, y, 60, 8)
    img(ax, 4, y + 1, 5, 6)
    ax.text(11, y + 5, "Tên sách", fontsize=7.5, weight="bold")
    ax.text(11, y + 2.5, "Tác giả", fontsize=6.8, color="#555")
    ax.text(34, y + 4, "120.000đ", fontsize=7.3, va="center")
    wbox(ax, 44, y + 2.5, 8, 3, "−  2  +", fs=7)
    ax.text(54, y + 4, "240.000đ", fontsize=7.3, va="center", color="#C00000")
    ax.text(61.5, y + 4, "✕", fontsize=8, va="center")
wbox(ax, 66, 4, 31, 49, fc=GRAY)
ax.text(68, 50, "THÔNG TIN ĐẶT HÀNG", fontsize=9, weight="bold")
for i, t in enumerate(["Họ tên người nhận", "Số điện thoại", "Địa chỉ giao hàng"]):
    wbox(ax, 68, 44 - i * 4.5, 27, 3.2, t, ha="left", fs=7)
ax.text(68, 29, "Phương thức thanh toán:", fontsize=7.5, weight="bold")
ax.text(69, 26.5, "◉ Thanh toán khi nhận hàng (COD)", fontsize=7)
ax.text(69, 24.3, "○ Thanh toán trực tuyến (VNPay)", fontsize=7)
for i, (a, b) in enumerate((("Tạm tính", "600.000đ"), ("Phí vận chuyển", "25.000đ"))):
    ax.text(68, 18.5 - i * 2.4, a, fontsize=7.3)
    ax.text(95, 18.5 - i * 2.4, b, fontsize=7.3, ha="right")
ax.text(68, 10.5, "TỔNG CỘNG", fontsize=8.5, weight="bold")
ax.text(95, 10.5, "625.000đ", fontsize=9, ha="right", color="#C00000", weight="bold")
wbox(ax, 68, 5, 27, 3.8, "ĐẶT HÀNG", fc="#C00000", bold=True)
save(fig, "wf_cart")


# Đăng nhập
fig, ax = frame("Đăng nhập")
shop_header(ax)
wbox(ax, 30, 8, 40, 42, fc=GRAY)
ax.text(50, 46, "ĐĂNG NHẬP", fontsize=12, weight="bold", ha="center")
ax.text(33, 40.5, "Tên đăng nhập / Email", fontsize=7.5)
wbox(ax, 33, 36, 34, 3.5)
ax.text(33, 32.5, "Mật khẩu", fontsize=7.5)
wbox(ax, 33, 28, 34, 3.5)
wbox(ax, 33, 24.5, 1.5, 1.5)
ax.text(35.5, 25.2, "Ghi nhớ đăng nhập", fontsize=7, va="center")
ax.text(67, 25.2, "Quên mật khẩu?", fontsize=7, va="center", ha="right", color="#1155CC")
wbox(ax, 33, 17, 34, 4, "ĐĂNG NHẬP", fc="#2F4F7F", bold=True)
ax.texts[-1].set_color("white")
ax.text(50, 12, "Chưa có tài khoản? Đăng ký", fontsize=7.5, ha="center", color="#1155CC")
save(fig, "wf_login")


# ---------------------------------------------------------------- Desktop (WinUI 3) wireframes
ACC = "#0067C0"


def win_frame(title, size=(9, 6)):
    fig, ax = plt.subplots(figsize=size)
    W, H = 100, 66 * (size[1] / size[0]) * (9 / 6)
    ax.set_xlim(0, W)
    ax.set_ylim(0, H)
    ax.axis("off")
    ax.add_patch(FancyBboxPatch((0, 0), W, H, boxstyle="round,pad=0,rounding_size=1.2", fc="white", ec="#888", lw=1.3))
    ax.add_patch(Rectangle((0.3, H - 4), W - 0.6, 3.7, fc="#F3F3F3", ec="none"))
    ax.add_patch(Rectangle((2, H - 2.9), 1.6, 1.6, fc=ACC, ec="none"))
    ax.text(4.6, H - 2.1, title, fontsize=7.5, va="center", color="#333")
    for i, g in enumerate(("–", "□", "✕")):
        ax.text(W - 12 + i * 4.2, H - 2.1, g, fontsize=8, ha="center", va="center", color="#333")
    return fig, ax, W, H - 4


def nav_frame(page, active):
    fig, ax, W, top = win_frame("BookStore Admin – " + page)
    ax.add_patch(Rectangle((0.3, 0.3), 19, top - 0.3, fc="#F7F7F7", ec="none"))
    ax.text(2, top - 3, "☰", fontsize=10, va="center")
    items = [("⌂", "Tổng quan"), ("▤", "Sách"), ("▦", "Danh mục"), ("▧", "Đơn hàng"), ("▣", "Kho, nhập hàng"),
             ("☺", "Khách hàng"), ("♟", "Nhân viên"), ("▥", "Báo cáo")]
    for i, (ic, it) in enumerate(items):
        y = top - 8 - i * 4
        if it == active:
            ax.add_patch(FancyBboxPatch((1, y - 1.6), 17.5, 3.2, boxstyle="round,pad=0,rounding_size=0.6",
                                        fc="#E6E6E6", ec="none"))
            ax.add_patch(Rectangle((1.2, y - 1), 0.5, 2, fc=ACC, ec="none"))
        ax.text(3, y, ic, fontsize=7.5, va="center", color="#333")
        ax.text(6, y, it, fontsize=7.5, va="center", weight="bold" if it == active else "normal")
    ax.text(2, 4, "♟  Quản lý: Nguyễn Văn B", fontsize=7, color="#555")
    ax.text(2, 1.6, "⇦  Đăng xuất", fontsize=7, color="#555")
    ax.text(22, top - 4, page, fontsize=13, weight="bold", va="center")
    return fig, ax, W, top


def btn(ax, x, y, w, text, primary=False):
    ax.add_patch(FancyBboxPatch((x, y), w, 3.2, boxstyle="round,pad=0,rounding_size=0.5",
                                fc=ACC if primary else "#FBFBFB", ec=ACC if primary else "#CCC", lw=0.9))
    ax.text(x + w / 2, y + 1.6, text, fontsize=7, ha="center", va="center", color="white" if primary else "#222")


def field(ax, x, y, w, label=None, text=""):
    if label:
        ax.text(x, y + 4, label, fontsize=7)
    ax.add_patch(FancyBboxPatch((x, y), w, 3.2, boxstyle="round,pad=0,rounding_size=0.4", fc="white", ec="#BBB", lw=0.8))
    ax.plot([x + 0.3, x + w - 0.3], [y, y], color="#888", lw=0.9)
    if text:
        ax.text(x + 1, y + 1.6, text, fontsize=6.8, va="center", color="#666")


def grid(ax, x, y_top, w, cols, rows, sel=None):
    ax.add_patch(Rectangle((x, y_top - 3.4), w, 3.4, fc="#F3F3F3", ec="#DDD", lw=0.8))
    for t, cx in cols:
        ax.text(x + cx + 0.5, y_top - 1.7, t, fontsize=7, weight="bold", va="center")
    for i, r in enumerate(rows):
        y = y_top - 3.4 - (i + 1) * 3.6
        ax.add_patch(Rectangle((x, y), w, 3.6, fc="#DDEBF7" if i == sel else "white", ec="#E5E5E5", lw=0.6))
        for v, (_, cx) in zip(r, cols):
            ax.text(x + cx + 0.5, y + 1.8, v, fontsize=6.8, va="center")


def card(ax, x, y, w, h):
    ax.add_patch(FancyBboxPatch((x, y), w, h, boxstyle="round,pad=0,rounding_size=0.8", fc="#FBFBFB", ec="#E0E0E0"))


# Đăng nhập desktop
fig, ax, W, top = win_frame("BookStore Admin – Đăng nhập", size=(7.5, 5))
ax.add_patch(Rectangle((0.3, 0.3), 42, top - 0.3, fc=ACC, ec="none"))
ax.text(21, top / 2 + 7, "BookStore", fontsize=18, weight="bold", color="white", ha="center")
ax.text(21, top / 2, "Ứng dụng quản trị\nnhà sách trực tuyến", fontsize=9, color="white", ha="center", va="center")
ax.text(50, top - 9, "Đăng nhập", fontsize=14, weight="bold")
ax.text(50, top - 14, "Dành cho Nhân viên và Quản lý", fontsize=7.5, color="#666")
field(ax, 50, top - 25, 44, "Tên đăng nhập")
field(ax, 50, top - 35, 44, "Mật khẩu", "••••••••")
ax.text(50, top - 40, "⚠ Sai tên đăng nhập hoặc mật khẩu", fontsize=7, color="#C42B1C")
btn(ax, 50, top - 48, 44, "Đăng nhập", primary=True)
ax.text(72, 4, "Máy chủ API: https://localhost:7001", fontsize=6.5, color="#888", ha="center")
save(fig, "wf_dk_login")

# Tổng quan (Dashboard)
fig, ax, W, top = nav_frame("Tổng quan", "Tổng quan")
for i, (a, b, c) in enumerate((("Đơn chờ xác nhận", "12", ACC), ("Doanh thu hôm nay", "4.250.000đ", "#107C10"),
                               ("Đơn đang giao", "27", "#8764B8"), ("Sách sắp hết", "8", "#C42B1C"))):
    x = 22 + i * 19
    card(ax, x, top - 17, 18, 9)
    ax.add_patch(Rectangle((x, top - 17), 0.6, 9, fc=c, ec="none"))
    ax.text(x + 1.8, top - 11, a, fontsize=7, color="#555")
    ax.text(x + 1.8, top - 14.5, b, fontsize=11, weight="bold")
card(ax, 22, 3, 44, top - 23)
ax.text(24, top - 22, "Doanh thu 7 ngày gần nhất", fontsize=7.5, weight="bold", va="top")
pts = [3.2, 4.1, 3.6, 5.0, 4.4, 5.6, 6.1]
ax.plot([26 + i * 6 for i in range(7)], [7 + p * 3.5 for p in pts], color=ACC, lw=1.6, marker="o", ms=3)
card(ax, 68, 3, 29, top - 23)
ax.text(70, top - 22, "Cảnh báo tồn kho", fontsize=7.5, weight="bold", va="top")
for i, s in enumerate(["Nhà giả kim – còn 2", "Đắc nhân tâm – còn 3", "Tuổi trẻ đáng giá… – còn 4",
                       "Sapiens – còn 5", "Atomic Habits – còn 5"]):
    ax.text(70, top - 27 - i * 3.4, "⚠ " + s, fontsize=6.8, color="#9D5D00")
btn(ax, 70, 5, 18, "Lập phiếu nhập", primary=True)
save(fig, "wf_dk_dashboard")

# Quản lý sách
fig, ax, W, top = nav_frame("Quản lý sách", "Sách")
field(ax, 22, top - 11, 30, None, "Tìm theo tên sách, tác giả…")
field(ax, 54, top - 11, 14, None, "Loại sách ▾")
for i, (t, p) in enumerate((("+ Thêm", True), ("Sửa", False), ("Xóa", False), ("Làm mới", False))):
    btn(ax, 22 + i * 11.5, top - 16.5, 10.5, t, p)
grid(ax, 22, top - 19, 46, [("Mã", 0), ("Tên sách", 5), ("Loại", 24), ("Giá bán", 33), ("Tồn", 41)],
     [["1", "Nhà giả kim", "Văn học", "79.000", "2"], ["2", "Đắc nhân tâm", "Kỹ năng", "86.000", "3"],
      ["3", "Sapiens", "Lịch sử", "199.000", "15"], ["4", "Clean Code", "Công nghệ", "350.000", "9"],
      ["5", "Atomic Habits", "Kỹ năng", "145.000", "5"], ["6", "Dế mèn phiêu lưu ký", "Thiếu nhi", "45.000", "40"],
      ["7", "Cha giàu cha nghèo", "Kinh tế", "99.000", "21"]], sel=1)
card(ax, 70, 3, 27, top - 7)
ax.text(71.5, top - 6.5, "Thông tin sách", fontsize=8, weight="bold")
for i, (lab, val) in enumerate((("Tên sách *", "Đắc nhân tâm"), ("Loại sách *", "Kỹ năng ▾"),
                                ("Tác giả *", "Dale Carnegie ▾"), ("Nhà xuất bản *", "NXB Tổng hợp ▾"),
                                ("Giá bán *", "86.000"), ("Ngưỡng cảnh báo", "5"))):
    field(ax, 71.5, top - 14 - i * 7.2, 24, lab, val)
btn(ax, 71.5, 4.5, 11.5, "Hủy")
btn(ax, 84, 4.5, 11.5, "Lưu", primary=True)
save(fig, "wf_dk_books")

# Quản lý đơn hàng
fig, ax, W, top = nav_frame("Quản lý đơn hàng", "Đơn hàng")
field(ax, 22, top - 11, 28, None, "Mã đơn, tên, SĐT khách hàng…")
field(ax, 52, top - 11, 20, None, "Trạng thái: Tất cả ▾")
field(ax, 74, top - 11, 23, None, "01/10/2026 – 22/10/2026")
for i, (t, p) in enumerate((("Xác nhận", True), ("Cập nhật giao hàng", False), ("Hủy đơn", False),
                            ("In hóa đơn", False))):
    btn(ax, 22 + i * 15, top - 16.5, 14, t, p)
st = ["Chờ xác nhận", "Chờ xác nhận", "Đã xác nhận", "Đang giao", "Hoàn thành", "Đã hủy", "Chờ thanh toán"]
grid(ax, 22, top - 19, 75, [("Mã đơn", 0), ("Khách hàng", 9), ("Ngày đặt", 27), ("Tổng tiền", 40),
                            ("Thanh toán", 52), ("Trạng thái", 63)],
     [[f"DH{1020 - i}", "Nguyễn Văn A", "22/10/2026", "350.000đ", "VNPay" if i % 3 == 0 else "COD", s]
      for i, s in enumerate(st)], sel=0)
ax.text(22, 3, "Chọn một đơn hàng rồi chọn thao tác trên thanh lệnh; nút chỉ bật khi trạng thái cho phép.",
        fontsize=6.8, color="#666", style="italic")
save(fig, "wf_dk_orders")

# Báo cáo doanh thu
fig, ax, W, top = nav_frame("Báo cáo doanh thu", "Báo cáo")
field(ax, 22, top - 11, 25, None, "01/01/2026 – 31/12/2026")
field(ax, 49, top - 11, 14, None, "Theo: Tháng ▾")
btn(ax, 65, top - 11, 10, "Xem", True)
btn(ax, 85, top - 11, 12, "Xuất Excel")
for i, (a, b) in enumerate((("Doanh thu", "125.400.000đ"), ("Đơn hoàn thành", "842"),
                            ("Sách bán ra", "1.930"), ("Giá trị TB/đơn", "148.900đ"))):
    x = 22 + i * 19
    card(ax, x, top - 22, 18, 8)
    ax.text(x + 1.2, top - 16.5, a, fontsize=7, color="#555")
    ax.text(x + 1.2, top - 20, b, fontsize=10, weight="bold")
card(ax, 22, 3, 75, top - 28)
ax.text(24, top - 27.5, "Doanh thu theo tháng", fontsize=7.5, weight="bold", va="top")
vals = [40, 55, 48, 70, 62, 85, 78, 90, 72, 95, 88, 100]
for i, v in enumerate(vals):
    ax.add_patch(Rectangle((26 + i * 5.8, 6.5), 3.8, v * 0.2, fc=ACC, ec="none"))
    ax.text(27.9 + i * 5.8, 4.5, f"T{i + 1}", fontsize=6.3, ha="center")
save(fig, "wf_dk_report")

# ---------------------------------------------------------------- Wireframes Web bo sung
# W02 – Danh sach / ket qua tim kiem
fig, ax = frame("Kết quả tìm kiếm")
shop_header(ax)
ax.text(2, 52.5, "Trang chủ  ›  Tìm kiếm  ›  “kỹ năng sống”", fontsize=7, color="#555")
wbox(ax, 2, 3, 20, 47, fc=GRAY)
ax.text(3, 47.5, "LỌC KẾT QUẢ", fontsize=8, weight="bold")
ax.text(3, 44.5, "Loại sách", fontsize=7.5, weight="bold")
for i, c in enumerate(["Kỹ năng sống (21)", "Kinh tế (12)", "Văn học (9)", "Thiếu nhi (6)"]):
    wbox(ax, 4, 40.8 - i * 3, 1.4, 1.4)
    ax.text(6.3, 41.5 - i * 3, c, fontsize=6.9, va="center")
ax.text(3, 26.5, "Khoảng giá", fontsize=7.5, weight="bold")
for i, c in enumerate(["Dưới 100.000đ", "100.000 – 300.000đ", "Trên 300.000đ"]):
    wbox(ax, 4, 22.8 - i * 3, 1.4, 1.4)
    ax.text(6.3, 23.5 - i * 3, c, fontsize=6.9, va="center")
ax.text(3, 11.5, "Nhà xuất bản", fontsize=7.5, weight="bold")
for i, c in enumerate(["NXB Trẻ", "NXB Tổng hợp"]):
    wbox(ax, 4, 7.8 - i * 3, 1.4, 1.4)
    ax.text(6.3, 8.5 - i * 3, c, fontsize=6.9, va="center")
ax.text(25, 49.5, "Tìm thấy 48 sách", fontsize=9, weight="bold", va="center")
wbox(ax, 72, 48, 26, 3.4, "Sắp xếp: Bán chạy nhất  ▾", fs=7)
for r in range(2):
    for i in range(4):
        x = 25 + i * 18.6
        top = 46 - r * 21
        img(ax, x, top - 10, 17, 10)
        ax.text(x, top - 11.7, "Tên sách", fontsize=7.2, weight="bold")
        ax.text(x, top - 13.1, "Tác giả", fontsize=6.6, color="#555")
        ax.text(x, top - 14.9, "120.000đ", fontsize=7.2, color="#C00000", weight="bold")
        wbox(ax, x, top - 18.4, 17, 2.6, "Thêm vào giỏ", fc="#F6B26B", fs=6.6)
wbox(ax, 50, 2.2, 24, 3.2, "‹  1  2  3  ...  12  ›", fs=7.2)
save(fig, "wf_list")

# W06 – Ket qua dat hang / thanh toan
fig, ax = frame("Kết quả đặt hàng")
shop_header(ax)
wbox(ax, 18, 19, 64, 33, fc=GRAY)
ax.add_patch(plt.Circle((50, 47.5), 2.6, fc="#D9EAD3", ec="#38761D", lw=1.2))
ax.text(50, 47.5, "✓", fontsize=12, ha="center", va="center", color="#38761D", weight="bold")
ax.text(50, 42.8, "ĐẶT HÀNG THÀNH CÔNG", fontsize=12, weight="bold", ha="center")
ax.text(50, 39.3, "Mã đơn hàng: DH1021", fontsize=8.5, ha="center")
for i, (a, b) in enumerate((("Tổng tiền", "625.000đ"), ("Phương thức thanh toán", "VNPay – đã thanh toán"),
                            ("Người nhận", "Nguyễn Văn A – 0901 234 567"),
                            ("Địa chỉ giao hàng", "12 Nguyễn Văn Cừ, Quận 5, TP. HCM"))):
    ax.text(21, 35.5 - i * 3.0, a, fontsize=7.3, color="#555")
    ax.text(79, 35.5 - i * 3.0, b, fontsize=7.3, ha="right")
ax.text(50, 24.3, "Email xác nhận đơn hàng đã được gửi tới nguyenvana@email.com", fontsize=7,
        ha="center", color="#555", style="italic")
wbox(ax, 26, 20.0, 22, 3.4, "XEM ĐƠN HÀNG", fc="#2F4F7F", bold=True)
ax.texts[-1].set_color("white")
wbox(ax, 52, 20.0, 22, 3.4, "TIẾP TỤC MUA SẮM", fc="#F6B26B", bold=True)
ax.add_patch(Rectangle((18, 2.5), 64, 14, fc="#FFF2F2", ec="#C00000", lw=0.9, ls="--"))
ax.text(20, 15.0, "Trường hợp thanh toán không thành công", fontsize=7, color="#C00000", style="italic")
ax.text(21, 12.2, "✕  Thanh toán không thành công", fontsize=9, weight="bold", color="#C00000", va="center")
ax.text(21, 9.3, "Đơn DH1021 đang ở trạng thái Chờ thanh toán. Bạn còn 28 phút để thanh toán lại,",
        fontsize=7, va="center")
ax.text(21, 7.4, "quá thời hạn hệ thống sẽ tự động hủy đơn và hoàn lại số lượng tồn kho.",
        fontsize=7, va="center")
wbox(ax, 50, 3.3, 15, 3.0, "THANH TOÁN LẠI", fc="#F6B26B", fs=6.6)
wbox(ax, 66, 3.3, 14, 3.0, "HỦY ĐƠN", fs=6.6)
save(fig, "wf_result")

# W07 – Tai khoan cua toi
fig, ax = frame("Tài khoản của tôi")
shop_header(ax)
wbox(ax, 2, 3, 22, 50, fc=GRAY)
ax.text(3.5, 50, "TÀI KHOẢN CỦA TÔI", fontsize=8, weight="bold")
ax.text(3.5, 47, "Nguyễn Văn A", fontsize=7.3, color="#555")
for i, c in enumerate(["Thông tin cá nhân", "Sổ địa chỉ giao hàng", "Lịch sử đơn hàng", "Đổi mật khẩu",
                       "Đăng xuất"]):
    y = 42 - i * 4
    if c == "Lịch sử đơn hàng":
        ax.add_patch(Rectangle((2, y - 1.8), 22, 3.6, fc="#DDEBF7", ec="none"))
        ax.add_patch(Rectangle((2, y - 1.8), 0.6, 3.6, fc="#2F4F7F", ec="none"))
    ax.text(4.5, y, c, fontsize=7.3, va="center", weight="bold" if c == "Lịch sử đơn hàng" else "normal")
ax.text(27, 51, "LỊCH SỬ ĐƠN HÀNG", fontsize=10, weight="bold", va="center")
wbox(ax, 27, 45.5, 22, 3.2, "Trạng thái: Tất cả  ▾", ha="left", fs=7)
wbox(ax, 51, 45.5, 24, 3.2, "Từ ngày – đến ngày", ha="left", fs=7)
cols = [("Mã đơn", 1), ("Ngày đặt", 11), ("Tổng tiền", 23), ("Thanh toán", 35), ("Trạng thái", 47)]
wbox(ax, 27, 41, 71, 3.2, fc="#D9D9D9")
for t, cx in cols:
    ax.text(27 + cx, 42.6, t, fontsize=7, weight="bold", va="center")
rows = [("DH1021", "22/10/2026", "625.000đ", "VNPay", "Chờ xác nhận"),
        ("DH1014", "18/10/2026", "350.000đ", "COD", "Đang giao"),
        ("DH1008", "11/10/2026", "199.000đ", "COD", "Hoàn thành"),
        ("DH0996", "02/10/2026", "480.000đ", "VNPay", "Hoàn thành"),
        ("DH0981", "24/09/2026", "145.000đ", "COD", "Đã hủy")]
for i, r in enumerate(rows):
    y = 37.4 - i * 3.6
    wbox(ax, 27, y, 71, 3.6, fc="#DDEBF7" if i == 0 else "white")
    for v, (_, cx) in zip(r, cols):
        ax.text(27 + cx, y + 1.8, v, fontsize=6.8, va="center")
    ax.text(97, y + 1.8, "Xem" + ("  |  Hủy" if i == 0 else ""), fontsize=6.6, va="center",
            ha="right", color="#1155CC")
wbox(ax, 27, 3, 71, 15, fc=GRAY)
ax.text(28.5, 16, "Chi tiết đơn DH1021  –  Chờ xác nhận", fontsize=7.8, weight="bold")
for i, (a, b, c) in enumerate((("Đắc nhân tâm  × 2", "86.000đ", "172.000đ"),
                               ("Nhà giả kim  × 1", "79.000đ", "79.000đ"))):
    ax.text(28.5, 12.5 - i * 2.6, a, fontsize=6.9)
    ax.text(72, 12.5 - i * 2.6, b, fontsize=6.9, ha="right")
    ax.text(88, 12.5 - i * 2.6, c, fontsize=6.9, ha="right")
ax.text(72, 6.8, "Tạm tính / Phí vận chuyển / Tổng cộng", fontsize=6.9, ha="right")
ax.text(96, 6.8, "600.000đ  /  25.000đ  /  625.000đ", fontsize=6.9, ha="right", weight="bold")
ax.text(28.5, 4.8, "Giao đến: Nguyễn Văn A – 0901 234 567 – 12 Nguyễn Văn Cừ, Quận 5, TP. HCM",
        fontsize=6.8, color="#555")
save(fig, "wf_account")


# ---------------------------------------------------------------- Wireframes Desktop bo sung
def tab_bar(ax, x, y, items, active, fs=7.3):
    ws = [3.0 + len(t) * 0.78 for t in items]
    ax.plot([x, x + sum(ws)], [y - 2.2, y - 2.2], color="#E0E0E0", lw=0.9)
    cx = x
    for t, w in zip(items, ws):
        ax.text(cx + w / 2, y, t, fontsize=fs, ha="center", va="center",
                weight="bold" if t == active else "normal", color="#111" if t == active else "#666")
        if t == active:
            ax.plot([cx + 1.2, cx + w - 1.2], [y - 2.2, y - 2.2], color=ACC, lw=2)
        cx += w


# D04 – Quan ly danh muc
fig, ax, W, top = nav_frame("Quản lý danh mục", "Danh mục")
tab_bar(ax, 22, top - 9, ["Loại sách", "Tác giả", "Nhà xuất bản", "Nhà cung cấp"], "Loại sách")
field(ax, 22, top - 17, 30, None, "Tìm theo tên loại sách…")
for i, (t, p) in enumerate((("+ Thêm", True), ("Sửa", False), ("Xóa", False), ("Làm mới", False))):
    btn(ax, 22 + i * 11.5, top - 22.5, 10.5, t, p)
grid(ax, 22, top - 25, 46, [("Mã", 0), ("Tên loại sách", 5), ("Mô tả", 20), ("Số sách", 39)],
     [["1", "Văn học", "Tiểu thuyết, truyện ngắn", "128"],
      ["2", "Kinh tế", "Quản trị, tài chính", "74"],
      ["3", "Kỹ năng sống", "Phát triển bản thân", "96"],
      ["4", "Thiếu nhi", "Truyện tranh, tô màu", "63"],
      ["5", "Ngoại ngữ", "Tiếng Anh, tiếng Nhật", "41"],
      ["6", "Công nghệ", "Lập trình, phần cứng", "35"]], sel=2)
card(ax, 70, 3, 27, top - 7)
ax.text(71.5, top - 6.5, "Thông tin loại sách", fontsize=8, weight="bold")
field(ax, 71.5, top - 16, 24, "Tên loại sách *", "Kỹ năng sống")
field(ax, 71.5, top - 26, 24, "Mô tả", "Phát triển bản thân")
ax.text(71.5, top - 32, "⚠  Không xóa được loại sách", fontsize=6.8, color="#9D5D00")
ax.text(71.5, top - 35, "     đang có sách tham chiếu.", fontsize=6.8, color="#9D5D00")
btn(ax, 71.5, 4.5, 11.5, "Hủy")
btn(ax, 84, 4.5, 11.5, "Lưu", primary=True)
save(fig, "wf_dk_cat")

# D06 – Quan ly kho va nhap hang
fig, ax, W, top = nav_frame("Quản lý kho và nhập hàng", "Kho, nhập hàng")
tab_bar(ax, 22, top - 9, ["Tồn kho", "Phiếu nhập"], "Phiếu nhập")
field(ax, 22, top - 17, 26, None, "Tìm theo mã phiếu, nhà cung cấp…")
field(ax, 50, top - 17, 18, None, "Trạng thái: Tất cả ▾")
for (x, w, t, p) in ((22, 12.5, "+ Lập phiếu", True), (35.5, 9, "Sửa", False),
                     (45.5, 12.5, "Hoàn thành", False), (59, 9, "Xóa", False)):
    btn(ax, x, top - 22.5, w, t, p)
grid(ax, 22, top - 25, 46, [("Mã PN", 0), ("Nhà cung cấp", 7), ("Ngày lập", 20), ("Tổng tiền", 29),
                            ("Trạng thái", 37)],
     [["PN018", "Công ty Fahasa", "20/10/2026", "12.400.000", "Chờ nhập"],
      ["PN017", "NXB Trẻ", "17/10/2026", "8.950.000", "Hoàn thành"],
      ["PN016", "Công ty Nhã Nam", "12/10/2026", "15.200.000", "Hoàn thành"],
      ["PN015", "NXB Tổng hợp", "05/10/2026", "6.300.000", "Hoàn thành"],
      ["PN014", "Công ty Fahasa", "28/09/2026", "9.700.000", "Hoàn thành"]], sel=0)
ax.text(22, 6, "Chỉ phiếu ở trạng thái Chờ nhập mới sửa, xóa hoặc hoàn thành được;", fontsize=6.8,
        color="#666", style="italic")
ax.text(22, 3.5, "khi Hoàn thành, hệ thống cộng số lượng vào tồn kho và khóa phiếu.", fontsize=6.8,
        color="#666", style="italic")
card(ax, 70, 3, 27, top - 7)
ax.text(71.5, top - 6.5, "Chi tiết phiếu nhập PN018", fontsize=8, weight="bold")
ax.text(71.5, top - 10, "Nhà cung cấp: Công ty Fahasa", fontsize=6.9, color="#555")
ax.text(71.5, top - 13, "Người lập: Trần Thị C – 20/10/2026", fontsize=6.9, color="#555")
ax.add_patch(Rectangle((71.5, top - 19.4), 24, 3, fc="#F3F3F3", ec="#DDD", lw=0.7))
for t, cx in (("Sách", 0.8), ("SL", 13), ("Giá nhập", 17)):
    ax.text(71.5 + cx, top - 17.9, t, fontsize=6.6, weight="bold", va="center")
for i, (a, b, c) in enumerate((("Đắc nhân tâm", "50", "52.000"), ("Nhà giả kim", "40", "47.000"),
                               ("Sapiens", "30", "120.000"), ("Clean Code", "20", "210.000"))):
    y = top - 22.4 - i * 3
    ax.add_patch(Rectangle((71.5, y), 24, 3, fc="white", ec="#E5E5E5", lw=0.6))
    ax.text(72.3, y + 1.5, a, fontsize=6.4, va="center")
    ax.text(84.5, y + 1.5, b, fontsize=6.4, va="center")
    ax.text(88.5, y + 1.5, c, fontsize=6.4, va="center")
ax.text(71.5, top - 38, "Tổng tiền", fontsize=7, weight="bold")
ax.text(95.5, top - 38, "12.400.000đ", fontsize=7, weight="bold", ha="right", color="#C42B1C")
btn(ax, 71.5, 4.5, 11.5, "Thêm dòng")
btn(ax, 84, 4.5, 11.5, "Hoàn thành", primary=True)
save(fig, "wf_dk_stock")

# D07 – Quan ly khach hang va nhan vien
fig, ax, W, top = nav_frame("Quản lý khách hàng và nhân viên", "Khách hàng")
tab_bar(ax, 22, top - 9, ["Khách hàng", "Nhân viên"], "Khách hàng")
field(ax, 22, top - 17, 26, None, "Tìm theo họ tên, email, số điện thoại…")
field(ax, 50, top - 17, 18, None, "Trạng thái: Tất cả ▾")
for i, (t, p) in enumerate((("Xem chi tiết", True), ("Khóa tài khoản", False), ("Làm mới", False))):
    btn(ax, 22 + i * 13, top - 22.5, 12, t, p)
grid(ax, 22, top - 25, 46, [("Mã", 0), ("Họ tên", 4), ("Số điện thoại", 16), ("Số đơn", 30),
                            ("Trạng thái", 37)],
     [["1", "Nguyễn Văn A", "0901 234 567", "12", "Hoạt động"],
      ["2", "Trần Thị B", "0912 345 678", "5", "Hoạt động"],
      ["3", "Lê Văn C", "0987 654 321", "0", "Bị khóa"],
      ["4", "Phạm Thị D", "0933 222 111", "8", "Hoạt động"],
      ["5", "Hoàng Văn E", "0944 555 666", "3", "Hoạt động"]], sel=0)
card(ax, 70, 3, 27, top - 7)
ax.text(71.5, top - 6.5, "Thông tin khách hàng", fontsize=8, weight="bold")
for i, (a, b) in enumerate((("Họ tên", "Nguyễn Văn A"), ("Email", "nguyenvana@email.com"),
                            ("Số điện thoại", "0901 234 567"), ("Ngày tạo tài khoản", "14/03/2026"),
                            ("Tổng số đơn", "12 đơn – 7.480.000đ"))):
    ax.text(71.5, top - 11 - i * 4.4, a, fontsize=6.7, color="#777")
    ax.text(71.5, top - 13.4 - i * 4.4, b, fontsize=7, weight="bold")
ax.text(71.5, top - 36, "Trạng thái tài khoản", fontsize=6.7, color="#777")
ax.add_patch(FancyBboxPatch((71.5, top - 40.2), 11, 3, boxstyle="round,pad=0,rounding_size=1.4",
                            fc="#D9EAD3", ec="#38761D", lw=0.8))
ax.text(77, top - 38.7, "Hoạt động", fontsize=6.8, ha="center", va="center", color="#38761D")
ax.text(71.5, top - 44, "Khóa tài khoản làm khách hàng", fontsize=6.6, color="#666")
ax.text(71.5, top - 46.5, "không đăng nhập được trang Web.", fontsize=6.6, color="#666")
btn(ax, 71.5, 4.5, 24, "Khóa tài khoản")
save(fig, "wf_dk_users")


print(sorted(os.listdir(OUT)))
