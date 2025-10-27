import { useEffect } from "react";

export default function ConfirmDialog({ open, title, message, onConfirm, onClose }) {
  useEffect(() => {
    const onEsc = (e) => e.key === "Escape" && onClose();
    if (open) window.addEventListener("keydown", onEsc);
    return () => window.removeEventListener("keydown", onEsc);
  }, [open, onClose]);

  if (!open) return null;
  return (
    <div className="dialog-backdrop">
      <div className="dialog">
        <h3>{title || "Xác nhận"}</h3>
        <p>{message}</p>
        <div className="dialog-actions">
          <button className="btn" onClick={onClose}>Huỷ</button>
          <button className="btn btn-danger" onClick={onConfirm}>Xoá</button>
        </div>
      </div>
    </div>
  );
}
