import React, { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Button, Container, Paper, Typography, Box } from "@mui/material";
import bookingService from "../../services/bookingService";
import paymentService from "../../services/paymentService";
import CasualMatchDialog from "../../components/CasualMatchDialog";

export default function ZaloReturn() {
  const location = useLocation();
  const navigate = useNavigate();
  const [processing, setProcessing] = useState(false);
  const [message, setMessage] = useState("");
  const [booking, setBooking] = useState(null);
  const [openMatchDialog, setOpenMatchDialog] = useState(false);

  const { status, paymentId } = useMemo(() => {
    const params = new URLSearchParams(location.search);
    return {
      status: params.get("status") || "failed",
      paymentId: params.get("payment_id") || "",
    };
  }, [location.search]);

  const isSuccess = status === "success";

  useEffect(() => {
    const checkPaymentStatus = async () => {
      if (!isSuccess) return;
      if (!paymentId) return;

      const lockKey = `zalo_booking_done_${paymentId}`;
      
      try {
        setProcessing(true);
        const paymentRes = await paymentService.getById(paymentId);
        const payment = paymentRes.data?.data || paymentRes.data || {};
        
        if ((payment.payment_status || "").toLowerCase() !== "paid") {
          setMessage("Thanh toán chưa được xác nhận hoặc đã thất bại.");
          return;
        }

        // Fetch the bookings associated with this payment
        const bookingsRes = await bookingService.getMyBookings({ payment_id: paymentId });
        const items = bookingsRes.data?.items || bookingsRes.data?.data || bookingsRes.data || [];
        const bookingObj = Array.isArray(items) ? items[0] : items;
        
        if (bookingObj) {
          setBooking(bookingObj);
        }

        sessionStorage.setItem(lockKey, "1");
        localStorage.removeItem("pending_zalopay_booking");
        setMessage("Thanh toán và đặt sân thành công.");
      } catch (error) {
        console.error("Lỗi xác minh thanh toán", error);
        setMessage("Có lỗi xảy ra khi xác minh giao dịch.");
      } finally {
        setProcessing(false);
      }
    };

    checkPaymentStatus();
  }, [isSuccess, paymentId]);

  return (
    <Container maxWidth="sm" sx={{ py: 8 }}>
      <Paper
        sx={{
          p: 4,
          textAlign: "center",
          bgcolor: "#111",
          border: "1px solid #2a2a2a",
        }}
      >
        <Typography
          variant="h5"
          fontWeight={700}
          mb={2}
          color={isSuccess ? "#22c55e" : "#ef4444"}
        >
          {isSuccess
            ? "Thanh toán ZaloPay thành công"
            : "Thanh toán ZaloPay thất bại"}
        </Typography>

        <Typography color="text.secondary" mb={3}>
          {isSuccess
            ? processing
              ? "Đang xác nhận giao dịch..."
              : message || "Giao dịch thành công."
            : "Giao dịch chưa hoàn tất hoặc đã bị hủy. Chưa tạo booking."}
        </Typography>

        {paymentId ? (
          <Typography variant="body2" color="text.secondary" mb={3}>
            Mã thanh toán: #{paymentId}
          </Typography>
        ) : null}

        <Box sx={{ display: "flex", justifyContent: "center", gap: 2 }}>
          {isSuccess && booking && (
            <Button
              variant="outlined"
              onClick={() => setOpenMatchDialog(true)}
              sx={{
                borderColor: "#FFD600",
                color: "#FFD600",
                fontWeight: 600,
                "&:hover": { borderColor: "#FFC000", background: "rgba(255,214,0,0.05)" },
              }}
            >
              Tìm người chơi cùng
            </Button>
          )}

          <Button
            variant="contained"
            onClick={() => navigate("/my-bookings")}
            sx={{
              bgcolor: "#FFD600",
              color: "#000",
              fontWeight: 700,
              "&:hover": { bgcolor: "#FFC000" },
            }}
            disabled={processing}
          >
            Đơn đặt sân của tôi
          </Button>
        </Box>
      </Paper>

      {booking && (
        <CasualMatchDialog
          open={openMatchDialog}
          onClose={() => {
            setOpenMatchDialog(false);
            navigate("/my-bookings");
          }}
          booking={booking}
        />
      )}
    </Container>
  );
}
