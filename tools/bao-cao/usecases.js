// Đặc tả use case – theo đúng format của báo cáo QuanLyNhaSach.docx
const KH = "Khách hàng", NV = "Nhân viên", QL = "Quản lý";
const loggedIn = (role, screen) => [
  role === KH ? "Khách hàng đã đăng nhập thành công vào trang Web."
    : `${role === QL ? "Quản lý" : "Nhân viên"} đã đăng nhập thành công vào ứng dụng quản trị.`,
  `Tài khoản đăng nhập có Role là ${role === QL ? "QUẢN LÝ" : role === NV ? "NHÂN VIÊN hoặc QUẢN LÝ" : "KHÁCH HÀNG"}.`,
  ...(screen ? [screen] : []),
];

module.exports = {
  chung: [
    {
      ten: "Đăng ký tài khoản", tacNhan: "Khách vãng lai",
      moTa: "Use Case cho phép Khách vãng lai tạo tài khoản khách hàng để mua sách trên hệ thống.",
      dieuKien: ["Khách vãng lai chưa đăng nhập vào hệ thống.", "Khách vãng lai đang ở giao diện Đăng ký."],
      chinh: [
        "Khách vãng lai nhập họ tên, email, số điện thoại, tên đăng nhập, mật khẩu và xác nhận mật khẩu.",
        "Hệ thống kiểm tra thông tin đăng ký đã được nhập đầy đủ.",
        "Khách vãng lai chọn Đăng ký.",
        "Hệ thống kiểm tra thông tin đăng ký là hợp lệ (định dạng email, số điện thoại, độ dài mật khẩu, mật khẩu xác nhận trùng khớp).",
        "Hệ thống kiểm tra tên đăng nhập và email chưa tồn tại trong cơ sở dữ liệu.",
        "Hệ thống mã hóa mật khẩu, tạo tài khoản với Role KHÁCH HÀNG, tạo hồ sơ khách hàng và giỏ hàng rỗng.",
        "Hệ thống thông báo đăng ký thành công và chuyển Khách vãng lai đến giao diện Đăng nhập.",
      ],
      thayThe: [
        { ma: "2.A", ten: "Thông tin đăng ký chưa được nhập đầy đủ", buoc: ["Hệ thống thông báo vui lòng nhập đầy đủ thông tin bắt buộc.", "Quay lại bước 1 của luồng chính."] },
        { ma: "4.A", ten: "Thông tin đăng ký không hợp lệ", buoc: ["Hệ thống thông báo trường thông tin không hợp lệ.", "Quay lại bước 1 của luồng chính."] },
        { ma: "5.A", ten: "Tên đăng nhập hoặc email đã tồn tại", buoc: ["Hệ thống thông báo tên đăng nhập hoặc email đã được sử dụng.", "Quay lại bước 1 của luồng chính."] },
      ],
      sau: [
        { ten: "Trạng thái 1 - Đăng ký thành công", buoc: ["Tài khoản và hồ sơ khách hàng được lưu vào cơ sở dữ liệu.", "Hệ thống hiển thị giao diện Đăng nhập."] },
        { ten: "Trạng thái 2 - Đăng ký không thành công", buoc: ["Tài khoản chưa được tạo.", "Hệ thống thông báo lý do đăng ký không thành công.", "Hệ thống vẫn hiển thị giao diện Đăng ký cùng thông tin đã nhập (trừ mật khẩu)."] },
      ],
    },
    {
      ten: "Đăng nhập trang Web", tacNhan: "Khách hàng",
      moTa: "Use Case cho phép Khách hàng đã có tài khoản đăng nhập vào trang Web để mua sách.",
      dieuKien: ["Khách hàng có tài khoản trong hệ thống.", "Khách hàng đang ở giao diện Đăng nhập của trang Web."],
      chinh: [
        "Khách hàng nhập tên đăng nhập (hoặc email) và mật khẩu.",
        "Hệ thống kiểm tra thông tin đăng nhập đã được nhập đầy đủ.",
        "Khách hàng chọn Đăng nhập.",
        "Hệ thống kiểm tra tên đăng nhập và mật khẩu khớp với dữ liệu tài khoản trong cơ sở dữ liệu.",
        "Hệ thống kiểm tra tài khoản đang ở trạng thái hoạt động.",
        "Hệ thống tạo phiên đăng nhập (cookie) cho Khách hàng.",
        "Hệ thống chuyển Khách hàng về trang đang xem trước khi đăng nhập hoặc Trang chủ.",
      ],
      thayThe: [
        { ma: "2.A", ten: "Thông tin đăng nhập chưa được nhập đầy đủ", buoc: ["Hệ thống thông báo vui lòng nhập đầy đủ tên đăng nhập và mật khẩu.", "Quay lại bước 1 của luồng chính."] },
        { ma: "4.A", ten: "Tên đăng nhập hoặc mật khẩu không chính xác", buoc: ["Hệ thống thông báo tên đăng nhập hoặc mật khẩu không chính xác; sau 5 lần sai liên tiếp, tài khoản bị tạm khóa 5 phút.", "Quay lại bước 1 của luồng chính."] },
        { ma: "5.A", ten: "Tài khoản đã bị khóa", buoc: ["Hệ thống thông báo tài khoản đã bị khóa, vui lòng liên hệ nhà sách.", "Quay lại bước 1 của luồng chính."] },
      ],
      sau: [
        { ten: "Trạng thái 1 - Đăng nhập thành công", buoc: ["Khách hàng được xác thực và sử dụng được các chức năng giỏ hàng, đặt hàng, tài khoản."] },
        { ten: "Trạng thái 2 - Đăng nhập không thành công", buoc: ["Khách hàng chưa được xác thực.", "Hệ thống thông báo lý do đăng nhập không thành công.", "Hệ thống vẫn hiển thị giao diện Đăng nhập."] },
      ],
    },
    {
      ten: "Đăng nhập ứng dụng quản trị", tacNhan: "Nhân viên, Quản lý",
      moTa: "Use Case cho phép Nhân viên, Quản lý đăng nhập vào ứng dụng quản trị Desktop và được phân quyền theo Role.",
      dieuKien: ["Nhân viên, Quản lý có tài khoản được cấp trong hệ thống.", "Ứng dụng quản trị đang hiển thị màn hình Đăng nhập."],
      chinh: [
        "Người dùng nhập tên đăng nhập và mật khẩu.",
        "Ứng dụng kiểm tra thông tin đăng nhập đã được nhập đầy đủ.",
        "Người dùng chọn Đăng nhập.",
        "Ứng dụng gửi yêu cầu đăng nhập đến Web API.",
        "Hệ thống kiểm tra tên đăng nhập và mật khẩu khớp với dữ liệu tài khoản trong cơ sở dữ liệu.",
        "Hệ thống kiểm tra tài khoản đang hoạt động và có Role là NHÂN VIÊN hoặc QUẢN LÝ.",
        "Hệ thống trả về token xác thực (JWT) chứa thông tin Role.",
        "Ứng dụng lưu token, hiển thị màn hình Tổng quan và menu chức năng tương ứng với Role (Nhân viên không thấy các chức năng chỉ dành cho Quản lý).",
      ],
      thayThe: [
        { ma: "2.A", ten: "Thông tin đăng nhập chưa được nhập đầy đủ", buoc: ["Ứng dụng thông báo vui lòng nhập đầy đủ tên đăng nhập và mật khẩu.", "Quay lại bước 1 của luồng chính."] },
        { ma: "4.A", ten: "Không kết nối được máy chủ", buoc: ["Ứng dụng thông báo không kết nối được máy chủ, vui lòng kiểm tra mạng.", "Quay lại bước 1 của luồng chính."] },
        { ma: "5.A", ten: "Tên đăng nhập hoặc mật khẩu không chính xác", buoc: ["Ứng dụng thông báo tên đăng nhập hoặc mật khẩu không chính xác.", "Quay lại bước 1 của luồng chính."] },
        { ma: "6.A", ten: "Tài khoản bị khóa hoặc không có quyền quản trị", buoc: ["Ứng dụng thông báo tài khoản không có quyền truy cập ứng dụng quản trị (tài khoản Khách hàng cũng bị từ chối tại bước này).", "Quay lại bước 1 của luồng chính."] },
      ],
      sau: [
        { ten: "Trạng thái 1 - Đăng nhập thành công", buoc: ["Người dùng được xác thực, mọi yêu cầu tiếp theo đến Web API đều kèm token.", "Ứng dụng hiển thị màn hình Tổng quan."] },
        { ten: "Trạng thái 2 - Đăng nhập không thành công", buoc: ["Người dùng chưa được truy cập ứng dụng quản trị.", "Ứng dụng vẫn hiển thị màn hình Đăng nhập cùng thông báo lỗi."] },
      ],
    },
    {
      ten: "Đăng xuất", tacNhan: "Khách hàng, Nhân viên, Quản lý",
      moTa: "Use Case cho phép người dùng kết thúc phiên làm việc trên trang Web hoặc ứng dụng quản trị.",
      dieuKien: ["Người dùng đã đăng nhập thành công."],
      chinh: [
        "Người dùng chọn chức năng Đăng xuất.",
        "Hệ thống kết thúc phiên làm việc: trang Web xóa cookie đăng nhập; ứng dụng quản trị xóa token đã lưu.",
        "Trang Web chuyển Khách hàng về Trang chủ; ứng dụng quản trị chuyển về màn hình Đăng nhập.",
      ],
      thayThe: [],
      sau: [{ ten: "Trạng thái 1 - Đăng xuất thành công", buoc: ["Phiên làm việc của người dùng được kết thúc.", "Người dùng phải đăng nhập lại để sử dụng các chức năng yêu cầu xác thực."] }],
    },
    {
      ten: "Quên mật khẩu", tacNhan: "Khách hàng",
      moTa: "Use Case cho phép Khách hàng đặt lại mật khẩu thông qua email đã đăng ký khi quên mật khẩu.",
      dieuKien: ["Khách hàng có tài khoản trong hệ thống.", "Khách hàng đang ở giao diện Đăng nhập."],
      chinh: [
        "Khách hàng chọn Quên mật khẩu.",
        "Hệ thống hiển thị giao diện nhập email.",
        "Khách hàng nhập email đã đăng ký và chọn Gửi.",
        "Hệ thống kiểm tra email tồn tại trong cơ sở dữ liệu.",
        "Hệ thống tạo liên kết đặt lại mật khẩu có thời hạn 15 phút và gửi đến email của Khách hàng.",
        "Khách hàng mở liên kết, nhập mật khẩu mới và xác nhận mật khẩu.",
        "Hệ thống kiểm tra liên kết còn hiệu lực và mật khẩu mới hợp lệ.",
        "Hệ thống cập nhật mật khẩu mới và thông báo đặt lại mật khẩu thành công.",
      ],
      thayThe: [
        { ma: "4.A", ten: "Email không tồn tại", buoc: ["Hệ thống thông báo email chưa được đăng ký.", "Quay lại bước 3 của luồng chính."] },
        { ma: "7.A", ten: "Liên kết hết hạn hoặc mật khẩu mới không hợp lệ", buoc: ["Hệ thống thông báo lỗi tương ứng.", "Nếu liên kết hết hạn, quay lại bước 1; ngược lại quay lại bước 6 của luồng chính."] },
      ],
      sau: [
        { ten: "Trạng thái 1 - Đặt lại mật khẩu thành công", buoc: ["Mật khẩu mới được lưu (đã mã hóa) vào cơ sở dữ liệu.", "Hệ thống hiển thị giao diện Đăng nhập."] },
        { ten: "Trạng thái 2 - Đặt lại mật khẩu không thành công", buoc: ["Mật khẩu của tài khoản không thay đổi.", "Hệ thống thông báo lý do không thành công."] },
      ],
    },
  ],

  timsach: [
    {
      ten: "Tra cứu sách", tacNhan: "Khách vãng lai, Khách hàng",
      moTa: "Use Case cho phép người dùng tra cứu sách theo tên sách, tác giả hoặc loại sách.",
      dieuKien: ["Người dùng đang truy cập website của nhà sách."],
      chinh: [
        "Người dùng nhập từ khóa vào ô tìm kiếm.",
        "Người dùng chọn Tìm.",
        "Hệ thống tìm các sách đang kinh doanh có tên sách, tên tác giả hoặc tên loại sách chứa từ khóa.",
        "Hệ thống hiển thị danh sách sách tìm được kèm ảnh bìa, tên sách, tác giả, giá bán, có phân trang.",
      ],
      thayThe: [
        { ma: "2.A", ten: "Từ khóa để trống", buoc: ["Hệ thống hiển thị toàn bộ danh sách sách đang kinh doanh."] },
        { ma: "3.A", ten: "Không tìm thấy sách phù hợp", buoc: ["Hệ thống thông báo không tìm thấy sách phù hợp và gợi ý một số sách bán chạy."] },
      ],
      sau: [{ ten: "Trạng thái 1 - Tra cứu thành công", buoc: ["Hệ thống hiển thị danh sách sách phù hợp với từ khóa."] }],
    },
    {
      ten: "Xem chi tiết sách", tacNhan: "Khách vãng lai, Khách hàng",
      moTa: "Use Case cho phép người dùng xem thông tin chi tiết của một cuốn sách.",
      dieuKien: ["Người dùng đang ở giao diện danh sách sách hoặc kết quả tra cứu."],
      chinh: [
        "Người dùng chọn một cuốn sách.",
        "Hệ thống truy xuất thông tin sách: tên, tác giả, loại sách, nhà xuất bản, năm xuất bản, số trang, giá bán, mô tả, số lượng tồn.",
        "Hệ thống hiển thị giao diện Chi tiết sách.",
      ],
      thayThe: [{ ma: "2.A", ten: "Sách không tồn tại hoặc đã ngừng kinh doanh", buoc: ["Hệ thống thông báo sách không còn được kinh doanh.", "Hệ thống chuyển người dùng về Trang chủ."] }],
      sau: [{ ten: "Trạng thái 1 - Hiển thị chi tiết sách thành công", buoc: ["Hệ thống hiển thị thông tin chi tiết của sách."] }],
    },
  ],

  giohang: [
    {
      ten: "Thêm sách vào giỏ hàng", tacNhan: KH,
      moTa: "Use Case cho phép Khách hàng thêm sách vào giỏ hàng để đặt mua.",
      dieuKien: [...loggedIn(KH), "Khách hàng đang ở giao diện danh sách sách hoặc Chi tiết sách."],
      chinh: [
        "Khách hàng chọn số lượng (mặc định là 1) và chọn Thêm vào giỏ hàng.",
        "Hệ thống kiểm tra sách đang kinh doanh và tổng số lượng trong giỏ không vượt quá số lượng tồn.",
        "Hệ thống thêm sách vào giỏ hàng; nếu sách đã có trong giỏ thì cộng dồn số lượng.",
        "Hệ thống cập nhật số lượng hiển thị trên biểu tượng giỏ hàng và thông báo thêm thành công.",
      ],
      thayThe: [
        { ma: "1.A", ten: "Người dùng chưa đăng nhập", buoc: ["Hệ thống chuyển người dùng đến giao diện Đăng nhập.", "Sau khi đăng nhập thành công, quay lại bước 1 của luồng chính."] },
        { ma: "2.A", ten: "Số lượng vượt quá tồn kho", buoc: ["Hệ thống thông báo chỉ còn n cuốn trong kho.", "Quay lại bước 1 của luồng chính."] },
      ],
      sau: [
        { ten: "Trạng thái 1 - Thêm vào giỏ hàng thành công", buoc: ["Sách được lưu vào giỏ hàng của Khách hàng trong cơ sở dữ liệu."] },
        { ten: "Trạng thái 2 - Thêm vào giỏ hàng không thành công", buoc: ["Giỏ hàng không thay đổi.", "Hệ thống thông báo lý do không thành công."] },
      ],
    },
    {
      ten: "Cập nhật số lượng trong giỏ", tacNhan: KH,
      moTa: "Use Case cho phép Khách hàng thay đổi số lượng của một cuốn sách trong giỏ hàng.",
      dieuKien: [...loggedIn(KH), "Khách hàng đang ở giao diện Giỏ hàng và giỏ hàng có ít nhất một sách."],
      chinh: [
        "Khách hàng tăng, giảm hoặc nhập số lượng mới cho một sách trong giỏ.",
        "Hệ thống kiểm tra số lượng mới là số nguyên dương và không vượt quá số lượng tồn.",
        "Hệ thống cập nhật số lượng, thành tiền của dòng và tạm tính của giỏ hàng.",
      ],
      thayThe: [
        { ma: "2.A", ten: "Số lượng mới bằng 0", buoc: ["Hệ thống hỏi Khách hàng có muốn xóa sách khỏi giỏ hàng.", "Nếu Khách hàng đồng ý, hệ thống xóa sách khỏi giỏ; ngược lại giữ nguyên số lượng cũ."] },
        { ma: "2.B", ten: "Số lượng vượt quá tồn kho", buoc: ["Hệ thống thông báo số lượng tồn còn lại và đặt số lượng bằng số lượng tồn."] },
      ],
      sau: [{ ten: "Trạng thái 1 - Cập nhật thành công", buoc: ["Số lượng sách trong giỏ hàng được cập nhật.", "Hệ thống hiển thị lại tạm tính của giỏ hàng."] }],
    },
  ],

  dathang: [
    {
      ten: "Đặt hàng", tacNhan: KH,
      moTa: "Use Case cho phép Khách hàng đặt mua các sách có trong giỏ hàng.",
      dieuKien: [...loggedIn(KH), "Giỏ hàng của Khách hàng có ít nhất một sách."],
      chinh: [
        "Khách hàng chọn Đặt hàng tại giao diện Giỏ hàng.",
        "Hệ thống kiểm tra các sách trong giỏ còn kinh doanh và đủ số lượng tồn.",
        "Hệ thống hiển thị giao diện Thông tin đặt hàng với địa chỉ giao hàng mặc định của Khách hàng.",
        "Khách hàng nhập hoặc chọn thông tin người nhận, địa chỉ giao hàng và chọn phương thức thanh toán (COD hoặc VNPay).",
        "Hệ thống kiểm tra thông tin hợp lệ và tính tạm tính, phí vận chuyển, tổng tiền.",
        "Khách hàng chọn Xác nhận đặt hàng.",
        "Hệ thống tạo đơn hàng và chi tiết đơn hàng theo đơn giá hiện tại, trừ số lượng tồn kho và xóa giỏ hàng.",
        "Hệ thống đặt trạng thái đơn hàng là Chờ xác nhận (COD) hoặc Chờ thanh toán (VNPay).",
        "Hệ thống gửi email xác nhận và hiển thị thông báo đặt hàng thành công kèm mã đơn hàng.",
      ],
      thayThe: [
        { ma: "2.A", ten: "Có sách hết hàng hoặc không đủ số lượng", buoc: ["Hệ thống thông báo các sách không đủ số lượng và cập nhật lại giỏ hàng.", "Quay lại bước 1 của luồng chính."] },
        { ma: "5.A", ten: "Thông tin giao hàng không hợp lệ", buoc: ["Hệ thống thông báo trường thông tin không hợp lệ.", "Quay lại bước 4 của luồng chính."] },
        { ma: "8.A", ten: "Khách hàng chọn thanh toán VNPay", buoc: ["Hệ thống thực hiện Use Case Thanh toán trực tuyến."] },
      ],
      sau: [
        { ten: "Trạng thái 1 - Đặt hàng thành công", buoc: ["Đơn hàng và chi tiết đơn hàng được lưu vào cơ sở dữ liệu.", "Số lượng tồn kho được giảm tương ứng, giỏ hàng được làm rỗng.", "Hệ thống hiển thị mã đơn hàng cho Khách hàng."] },
        { ten: "Trạng thái 2 - Đặt hàng không thành công", buoc: ["Đơn hàng chưa được tạo, tồn kho và giỏ hàng không thay đổi.", "Hệ thống thông báo lý do đặt hàng không thành công."] },
      ],
    },
    {
      ten: "Thanh toán trực tuyến", tacNhan: "Khách hàng, Cổng thanh toán",
      moTa: "Use Case cho phép Khách hàng thanh toán đơn hàng qua cổng thanh toán VNPay.",
      dieuKien: [...loggedIn(KH), "Đơn hàng đang ở trạng thái Chờ thanh toán."],
      chinh: [
        "Hệ thống tạo giao dịch thanh toán với số tiền bằng tổng tiền đơn hàng và chuyển Khách hàng sang Cổng thanh toán.",
        "Khách hàng thực hiện thanh toán trên Cổng thanh toán.",
        "Cổng thanh toán gửi kết quả giao dịch về hệ thống.",
        "Hệ thống kiểm tra chữ ký bảo mật và số tiền của kết quả giao dịch.",
        "Hệ thống ghi nhận giao dịch thành công và chuyển trạng thái đơn hàng sang Chờ xác nhận.",
        "Hệ thống hiển thị thông báo thanh toán thành công.",
      ],
      thayThe: [
        { ma: "4.A", ten: "Chữ ký hoặc số tiền không hợp lệ", buoc: ["Hệ thống ghi nhận giao dịch thất bại và không thay đổi trạng thái đơn hàng.", "Hệ thống thông báo thanh toán không thành công."] },
        { ma: "5.A", ten: "Giao dịch thất bại hoặc Khách hàng hủy thanh toán", buoc: ["Hệ thống ghi nhận giao dịch thất bại.", "Hệ thống cho phép Khách hàng thanh toán lại trong 30 phút; quá thời hạn, đơn hàng chuyển sang Đã hủy và hoàn lại tồn kho."] },
      ],
      sau: [
        { ten: "Trạng thái 1 - Thanh toán thành công", buoc: ["Giao dịch thanh toán được lưu với trạng thái Thành công.", "Đơn hàng chuyển sang trạng thái Chờ xác nhận."] },
        { ten: "Trạng thái 2 - Thanh toán không thành công", buoc: ["Giao dịch thanh toán được lưu với trạng thái Thất bại.", "Đơn hàng vẫn ở trạng thái Chờ thanh toán hoặc chuyển sang Đã hủy khi quá hạn."] },
      ],
    },
    {
      ten: "Theo dõi đơn hàng", tacNhan: KH,
      moTa: "Use Case cho phép Khách hàng xem trạng thái hiện tại và thông tin chi tiết của đơn hàng đã đặt.",
      dieuKien: [...loggedIn(KH), "Khách hàng đang ở giao diện Lịch sử đơn hàng."],
      chinh: [
        "Khách hàng chọn một đơn hàng.",
        "Hệ thống kiểm tra đơn hàng thuộc về Khách hàng.",
        "Hệ thống hiển thị thông tin đơn hàng: danh sách sách, tổng tiền, phương thức thanh toán, địa chỉ giao hàng, trạng thái hiện tại và lịch sử thay đổi trạng thái.",
      ],
      thayThe: [{ ma: "2.A", ten: "Đơn hàng không thuộc về Khách hàng", buoc: ["Hệ thống thông báo không tìm thấy đơn hàng."] }],
      sau: [{ ten: "Trạng thái 1 - Hiển thị đơn hàng thành công", buoc: ["Hệ thống hiển thị thông tin và trạng thái của đơn hàng."] }],
    },
    {
      ten: "Hủy đơn hàng (Khách hàng)", tacNhan: KH,
      moTa: "Use Case cho phép Khách hàng hủy đơn hàng khi đơn hàng chưa được nhà sách xác nhận.",
      dieuKien: [...loggedIn(KH), "Đơn hàng thuộc về Khách hàng và đang ở trạng thái Chờ thanh toán hoặc Chờ xác nhận."],
      chinh: [
        "Khách hàng chọn Hủy đơn hàng tại giao diện chi tiết đơn hàng.",
        "Hệ thống yêu cầu Khách hàng chọn lý do hủy và xác nhận.",
        "Khách hàng chọn lý do và xác nhận hủy.",
        "Hệ thống kiểm tra trạng thái đơn hàng vẫn cho phép hủy.",
        "Hệ thống chuyển đơn hàng sang trạng thái Đã hủy và hoàn lại số lượng tồn kho.",
        "Hệ thống thông báo hủy đơn hàng thành công.",
      ],
      thayThe: [
        { ma: "3.A", ten: "Khách hàng không xác nhận hủy", buoc: ["Hệ thống giữ nguyên đơn hàng và quay lại giao diện chi tiết đơn hàng."] },
        { ma: "4.A", ten: "Đơn hàng đã được xác nhận", buoc: ["Hệ thống thông báo đơn hàng đã được xác nhận, không thể hủy.", "Hệ thống hiển thị lại trạng thái hiện tại của đơn hàng."] },
      ],
      sau: [
        { ten: "Trạng thái 1 - Hủy đơn hàng thành công", buoc: ["Đơn hàng chuyển sang trạng thái Đã hủy.", "Số lượng tồn kho được hoàn lại.", "Nếu đơn hàng đã thanh toán trực tuyến, hệ thống ghi nhận yêu cầu hoàn tiền."] },
        { ten: "Trạng thái 2 - Hủy đơn hàng không thành công", buoc: ["Trạng thái đơn hàng không thay đổi.", "Hệ thống thông báo lý do không thể hủy."] },
      ],
    },
  ],

  taikhoan: [
    {
      ten: "Quản lý địa chỉ giao hàng", tacNhan: KH,
      moTa: "Use Case cho phép Khách hàng thêm, sửa, xóa các địa chỉ giao hàng và chọn địa chỉ mặc định dùng khi đặt hàng.",
      dieuKien: loggedIn(KH, "Khách hàng đang ở giao diện Thông tin cá nhân."),
      chinh: [
        "Khách hàng chọn mục Địa chỉ giao hàng.",
        "Hệ thống hiển thị danh sách địa chỉ giao hàng của Khách hàng.",
        "Khách hàng chọn Thêm địa chỉ.",
        "Khách hàng nhập tên người nhận, số điện thoại, địa chỉ chi tiết và chọn có đặt làm địa chỉ mặc định hay không.",
        "Khách hàng chọn Lưu.",
        "Hệ thống kiểm tra thông tin địa chỉ là hợp lệ.",
        "Hệ thống lưu địa chỉ vào cơ sở dữ liệu và thông báo thêm địa chỉ thành công.",
      ],
      thayThe: [
        { ma: "3.A", ten: "Khách hàng chọn sửa hoặc xóa địa chỉ đã có", buoc: ["Hệ thống hiển thị thông tin địa chỉ được chọn để Khách hàng chỉnh sửa, hoặc yêu cầu xác nhận trước khi xóa.", "Quay lại bước 2 của luồng chính."] },
        { ma: "6.A", ten: "Thông tin địa chỉ không hợp lệ", buoc: ["Hệ thống thông báo trường thông tin không hợp lệ.", "Quay lại bước 4 của luồng chính."] },
      ],
      sau: [
        { ten: "Trạng thái 1 - Lưu địa chỉ thành công", buoc: ["Địa chỉ được lưu vào cơ sở dữ liệu và hiển thị trong danh sách địa chỉ.", "Nếu được chọn làm mặc định, các địa chỉ còn lại của Khách hàng bị bỏ đánh dấu mặc định."] },
        { ten: "Trạng thái 2 - Lưu địa chỉ không thành công", buoc: ["Danh sách địa chỉ không thay đổi.", "Hệ thống thông báo lý do không thành công."] },
      ],
    },
  ],

  sach: [
    {
      ten: "Thêm sách", tacNhan: QL,
      moTa: "Use Case cho phép Quản lý thêm sách mới vào hệ thống để kinh doanh.",
      dieuKien: loggedIn(QL, "Quản lý đang ở giao diện Quản lý sách."),
      chinh: [
        "Quản lý chọn chức năng Thêm sách.",
        "Hệ thống hiển thị giao diện Thêm sách.",
        "Quản lý nhập thông tin sách: tên sách, loại sách, tác giả, nhà xuất bản, năm xuất bản, số trang, giá bán, ngưỡng cảnh báo tồn, mô tả và ảnh bìa.",
        "Hệ thống kiểm tra thông tin sách được nhập là hợp lệ.",
        "Quản lý chọn Lưu.",
        "Hệ thống kiểm tra thông tin sách đáp ứng các ràng buộc dữ liệu (giá bán lớn hơn 0, loại sách, tác giả, nhà xuất bản tồn tại, ảnh bìa đúng định dạng).",
        "Hệ thống thêm sách vào cơ sở dữ liệu với số lượng tồn bằng 0 và trạng thái Đang kinh doanh.",
        "Hệ thống thông báo thêm sách thành công.",
      ],
      thayThe: [
        { ma: "4.A", ten: "Thông tin sách không hợp lệ", buoc: ["Hệ thống thông báo thông tin sách không hợp lệ.", "Quay lại bước 3 của luồng chính."] },
        { ma: "6.A", ten: "Thông tin sách không đáp ứng ràng buộc dữ liệu", buoc: ["Hệ thống thông báo không thể thêm sách.", "Quay lại bước 3 của luồng chính."] },
      ],
      sau: [
        { ten: "Trạng thái 1 - Thêm sách thành công", buoc: ["Thông tin sách được thêm vào cơ sở dữ liệu thành công.", "Sách được hiển thị trên website khi có số lượng tồn lớn hơn 0."] },
        { ten: "Trạng thái 2 - Thêm sách không thành công", buoc: ["Thông tin sách chưa được thêm vào cơ sở dữ liệu.", "Hệ thống vẫn hiển thị giao diện Thêm sách cùng thông tin đã nhập để Quản lý điều chỉnh."] },
      ],
    },
    {
      ten: "Cập nhật sách", tacNhan: QL,
      moTa: "Use Case cho phép Quản lý thay đổi thông tin của sách khi có sai sót hoặc thay đổi giá bán.",
      dieuKien: loggedIn(QL, "Quản lý đang xem thông tin của sách cần cập nhật."),
      chinh: [
        "Quản lý chọn chức năng Cập nhật sách.",
        "Hệ thống hiển thị giao diện Cập nhật sách với thông tin hiện tại của sách.",
        "Quản lý chỉnh sửa thông tin cần thay đổi.",
        "Hệ thống kiểm tra thông tin sách được nhập là hợp lệ.",
        "Quản lý chọn Lưu.",
        "Hệ thống kiểm tra thông tin sách đáp ứng các ràng buộc dữ liệu.",
        "Hệ thống cập nhật thông tin sách vào cơ sở dữ liệu.",
        "Hệ thống thông báo cập nhật sách thành công.",
      ],
      thayThe: [
        { ma: "4.A", ten: "Thông tin sách không hợp lệ", buoc: ["Hệ thống thông báo thông tin sách không hợp lệ.", "Quay lại bước 3 của luồng chính."] },
        { ma: "6.A", ten: "Thông tin sách không đáp ứng ràng buộc dữ liệu", buoc: ["Hệ thống thông báo không thể cập nhật sách.", "Quay lại bước 3 của luồng chính."] },
      ],
      sau: [
        { ten: "Trạng thái 1 - Cập nhật sách thành công", buoc: ["Thông tin sách được cập nhật trong cơ sở dữ liệu.", "Giá bán mới chỉ áp dụng cho các đơn hàng được tạo sau thời điểm cập nhật."] },
        { ten: "Trạng thái 2 - Cập nhật sách không thành công", buoc: ["Thông tin sách không thay đổi.", "Hệ thống vẫn hiển thị giao diện Cập nhật sách để Quản lý điều chỉnh."] },
      ],
    },
    {
      ten: "Xóa (ngừng kinh doanh) sách", tacNhan: QL,
      moTa: "Use Case cho phép Quản lý loại bỏ sách không còn kinh doanh khỏi website.",
      dieuKien: loggedIn(QL, "Quản lý đang xem thông tin của sách cần xóa."),
      chinh: [
        "Quản lý chọn chức năng Xóa sách.",
        "Hệ thống yêu cầu Quản lý xác nhận xóa sách.",
        "Quản lý xác nhận xóa.",
        "Hệ thống kiểm tra sách đã phát sinh đơn hàng hoặc phiếu nhập hay chưa.",
        "Hệ thống xóa sách khỏi cơ sở dữ liệu.",
        "Hệ thống thông báo xóa sách thành công.",
      ],
      thayThe: [
        { ma: "3.A", ten: "Quản lý không xác nhận xóa", buoc: ["Hệ thống hủy thao tác xóa và quay lại giao diện thông tin sách."] },
        { ma: "4.A", ten: "Sách đã phát sinh đơn hàng hoặc phiếu nhập", buoc: ["Hệ thống không xóa dữ liệu mà chuyển trạng thái sách sang Ngừng kinh doanh để bảo toàn lịch sử.", "Hệ thống thông báo sách đã được ngừng kinh doanh."] },
      ],
      sau: [
        { ten: "Trạng thái 1 - Xóa sách thành công", buoc: ["Sách được xóa hoặc chuyển sang trạng thái Ngừng kinh doanh.", "Sách không còn hiển thị trên website."] },
        { ten: "Trạng thái 2 - Xóa sách không thành công", buoc: ["Thông tin sách không thay đổi."] },
      ],
    },
  ],

  donhang: [
    {
      ten: "Xác nhận đơn hàng", tacNhan: "Nhân viên, Quản lý",
      moTa: "Use Case cho phép Nhân viên kiểm tra và xác nhận đơn hàng mới để chuẩn bị giao.",
      dieuKien: loggedIn(NV, "Đơn hàng đang ở trạng thái Chờ xác nhận."),
      chinh: [
        "Nhân viên chọn đơn hàng ở trạng thái Chờ xác nhận.",
        "Hệ thống hiển thị chi tiết đơn hàng.",
        "Nhân viên kiểm tra thông tin người nhận, địa chỉ và sách trong đơn hàng.",
        "Nhân viên chọn Xác nhận đơn hàng.",
        "Hệ thống chuyển trạng thái đơn hàng sang Đã xác nhận, ghi nhận Nhân viên xử lý và thời điểm xác nhận.",
        "Hệ thống gửi email thông báo cho Khách hàng và thông báo xác nhận thành công.",
      ],
      thayThe: [
        { ma: "4.A", ten: "Thông tin đơn hàng không hợp lệ (không liên lạc được, địa chỉ sai)", buoc: ["Nhân viên chọn Từ chối và nhập lý do.", "Hệ thống chuyển đơn hàng sang Đã hủy, hoàn lại tồn kho và gửi email thông báo cho Khách hàng."] },
        { ma: "5.A", ten: "Đơn hàng đã bị Khách hàng hủy trước đó", buoc: ["Hệ thống thông báo đơn hàng đã bị hủy và hiển thị lại trạng thái hiện tại."] },
      ],
      sau: [
        { ten: "Trạng thái 1 - Xác nhận thành công", buoc: ["Đơn hàng chuyển sang trạng thái Đã xác nhận."] },
        { ten: "Trạng thái 2 - Đơn hàng bị từ chối", buoc: ["Đơn hàng chuyển sang trạng thái Đã hủy và tồn kho được hoàn lại."] },
      ],
    },
    {
      ten: "Cập nhật trạng thái giao hàng", tacNhan: "Nhân viên, Quản lý",
      moTa: "Use Case cho phép Nhân viên cập nhật tiến trình giao hàng của đơn hàng.",
      dieuKien: loggedIn(NV, "Đơn hàng đang ở trạng thái Đã xác nhận hoặc Đang giao."),
      chinh: [
        "Nhân viên chọn đơn hàng cần cập nhật.",
        "Hệ thống hiển thị các trạng thái kế tiếp hợp lệ của đơn hàng.",
        "Nhân viên chọn trạng thái mới: Đang giao (khi bàn giao cho đơn vị vận chuyển) hoặc Hoàn thành (khi giao thành công).",
        "Hệ thống kiểm tra việc chuyển trạng thái phù hợp với quy trình xử lý đơn hàng.",
        "Hệ thống cập nhật trạng thái đơn hàng; nếu đơn hàng COD chuyển sang Hoàn thành, hệ thống ghi nhận đã thu tiền.",
        "Hệ thống gửi email thông báo cho Khách hàng và thông báo cập nhật thành công.",
      ],
      thayThe: [
        { ma: "3.A", ten: "Giao hàng thất bại", buoc: ["Nhân viên chọn Giao thất bại và nhập lý do.", "Hệ thống chuyển đơn hàng sang Đã hủy và hoàn lại số lượng tồn kho."] },
        { ma: "4.A", ten: "Chuyển trạng thái không hợp lệ", buoc: ["Hệ thống thông báo không thể chuyển sang trạng thái đã chọn.", "Quay lại bước 2 của luồng chính."] },
      ],
      sau: [
        { ten: "Trạng thái 1 - Cập nhật thành công", buoc: ["Trạng thái đơn hàng và lịch sử trạng thái được cập nhật."] },
        { ten: "Trạng thái 2 - Cập nhật không thành công", buoc: ["Trạng thái đơn hàng không thay đổi."] },
      ],
    },
  ],

  kho: [
    {
      ten: "Lập phiếu nhập", tacNhan: "Nhân viên, Quản lý",
      moTa: "Use Case cho phép Nhân viên lập phiếu nhập sách từ nhà cung cấp.",
      dieuKien: loggedIn(NV, "Nhân viên đang ở giao diện Quản lý nhập hàng."),
      chinh: [
        "Nhân viên chọn chức năng Lập phiếu nhập.",
        "Hệ thống hiển thị giao diện Lập phiếu nhập, gợi ý các sách đang dưới ngưỡng cảnh báo tồn.",
        "Nhân viên chọn nhà cung cấp, chọn sách và nhập số lượng, giá nhập cho từng sách.",
        "Hệ thống kiểm tra thông tin hợp lệ (số lượng và giá nhập lớn hơn 0, không trùng sách) và tính tổng tiền phiếu nhập.",
        "Nhân viên chọn Lưu.",
        "Hệ thống lưu phiếu nhập với trạng thái Chờ nhập, ghi nhận Nhân viên lập phiếu.",
        "Hệ thống thông báo lập phiếu nhập thành công.",
      ],
      thayThe: [
        { ma: "4.A", ten: "Thông tin phiếu nhập không hợp lệ", buoc: ["Hệ thống thông báo dòng thông tin không hợp lệ.", "Quay lại bước 3 của luồng chính."] },
        { ma: "4.B", ten: "Phiếu nhập chưa có sách nào", buoc: ["Hệ thống thông báo phiếu nhập phải có ít nhất một sách.", "Quay lại bước 3 của luồng chính."] },
      ],
      sau: [
        { ten: "Trạng thái 1 - Lập phiếu nhập thành công", buoc: ["Phiếu nhập và chi tiết phiếu nhập được lưu với trạng thái Chờ nhập.", "Số lượng tồn kho chưa thay đổi."] },
        { ten: "Trạng thái 2 - Lập phiếu nhập không thành công", buoc: ["Phiếu nhập chưa được lưu.", "Hệ thống vẫn hiển thị giao diện Lập phiếu nhập cùng thông tin đã nhập."] },
      ],
    },
    {
      ten: "Hoàn thành phiếu nhập", tacNhan: "Nhân viên, Quản lý",
      moTa: "Use Case cho phép Nhân viên xác nhận đã nhận đủ hàng để cập nhật tồn kho.",
      dieuKien: loggedIn(NV, "Phiếu nhập đang ở trạng thái Chờ nhập."),
      chinh: [
        "Nhân viên chọn phiếu nhập cần hoàn thành.",
        "Hệ thống hiển thị thông tin phiếu nhập.",
        "Nhân viên đối chiếu hàng thực nhận với phiếu nhập và chọn Hoàn thành phiếu nhập.",
        "Hệ thống yêu cầu xác nhận.",
        "Nhân viên xác nhận.",
        "Hệ thống cộng số lượng của từng sách trong phiếu vào số lượng tồn kho, chuyển phiếu nhập sang trạng thái Đã hoàn thành.",
        "Hệ thống thông báo hoàn thành phiếu nhập thành công.",
      ],
      thayThe: [
        { ma: "3.A", ten: "Hàng thực nhận không khớp phiếu nhập", buoc: ["Nhân viên thực hiện Use Case Sửa phiếu nhập.", "Quay lại bước 1 của luồng chính."] },
        { ma: "5.A", ten: "Nhân viên không xác nhận", buoc: ["Hệ thống giữ nguyên phiếu nhập ở trạng thái Chờ nhập."] },
      ],
      sau: [
        { ten: "Trạng thái 1 - Hoàn thành phiếu nhập thành công", buoc: ["Số lượng tồn kho của các sách được cập nhật.", "Phiếu nhập chuyển sang Đã hoàn thành và không thể sửa hoặc xóa."] },
        { ten: "Trạng thái 2 - Hoàn thành phiếu nhập không thành công", buoc: ["Phiếu nhập và tồn kho không thay đổi."] },
      ],
    },
  ],

  nguoidung: [
    {
      ten: "Khóa / mở khóa tài khoản khách hàng", tacNhan: QL,
      moTa: "Use Case cho phép Quản lý khóa tài khoản khách hàng vi phạm (ví dụ: nhiều lần đặt hàng COD rồi từ chối nhận) hoặc mở khóa lại.",
      dieuKien: loggedIn(QL, "Quản lý đang xem thông tin của khách hàng."),
      chinh: [
        "Quản lý chọn Khóa tài khoản (hoặc Mở khóa tài khoản nếu tài khoản đang bị khóa).",
        "Hệ thống yêu cầu Quản lý nhập lý do và xác nhận.",
        "Quản lý nhập lý do và xác nhận.",
        "Hệ thống cập nhật trạng thái tài khoản và kết thúc các phiên đăng nhập hiện có của tài khoản bị khóa.",
        "Hệ thống thông báo cập nhật trạng thái tài khoản thành công.",
      ],
      thayThe: [{ ma: "3.A", ten: "Quản lý không xác nhận", buoc: ["Hệ thống giữ nguyên trạng thái tài khoản."] }],
      sau: [
        { ten: "Trạng thái 1 - Cập nhật thành công", buoc: ["Tài khoản bị khóa không thể đăng nhập; tài khoản được mở khóa có thể đăng nhập lại."] },
        { ten: "Trạng thái 2 - Cập nhật không thành công", buoc: ["Trạng thái tài khoản không thay đổi."] },
      ],
    },
  ],

  baocao: [
    {
      ten: "Xem báo cáo doanh thu", tacNhan: QL,
      moTa: "Use Case cho phép Quản lý xem doanh thu của nhà sách theo khoảng thời gian.",
      dieuKien: loggedIn(QL, "Quản lý đang ở giao diện Báo cáo và thống kê."),
      chinh: [
        "Quản lý chọn chức năng Xem báo cáo doanh thu.",
        "Quản lý chọn khoảng thời gian và cách nhóm số liệu (theo ngày, tháng hoặc năm).",
        "Hệ thống kiểm tra khoảng thời gian hợp lệ.",
        "Hệ thống tổng hợp doanh thu từ các đơn hàng ở trạng thái Hoàn thành trong khoảng thời gian đã chọn.",
        "Hệ thống hiển thị tổng doanh thu, số đơn hàng, số sách bán ra, giá trị trung bình mỗi đơn và biểu đồ doanh thu.",
      ],
      thayThe: [
        { ma: "3.A", ten: "Khoảng thời gian không hợp lệ", buoc: ["Hệ thống thông báo ngày bắt đầu phải trước ngày kết thúc.", "Quay lại bước 2 của luồng chính."] },
        { ma: "4.A", ten: "Không có dữ liệu", buoc: ["Hệ thống thông báo không có doanh thu trong khoảng thời gian đã chọn."] },
      ],
      sau: [{ ten: "Trạng thái 1 - Hiển thị báo cáo thành công", buoc: ["Hệ thống hiển thị báo cáo doanh thu; Quản lý có thể xuất báo cáo ra tệp Excel."] }],
    },
    {
      ten: "Xem thống kê sách bán chạy", tacNhan: QL,
      moTa: "Use Case cho phép Quản lý xem danh sách sách bán chạy nhất trong một khoảng thời gian.",
      dieuKien: loggedIn(QL, "Quản lý đang ở giao diện Báo cáo và thống kê."),
      chinh: [
        "Quản lý chọn chức năng Xem thống kê sách bán chạy.",
        "Quản lý chọn khoảng thời gian, loại sách (tùy chọn) và số lượng sách cần hiển thị (Top N).",
        "Hệ thống tổng hợp số lượng bán của từng sách từ các đơn hàng Hoàn thành.",
        "Hệ thống hiển thị danh sách sách sắp xếp giảm dần theo số lượng bán kèm doanh thu của từng sách.",
      ],
      thayThe: [{ ma: "3.A", ten: "Không có dữ liệu", buoc: ["Hệ thống thông báo không có sách được bán trong khoảng thời gian đã chọn."] }],
      sau: [{ ten: "Trạng thái 1 - Hiển thị thống kê thành công", buoc: ["Hệ thống hiển thị danh sách sách bán chạy."] }],
    },
  ],
};
