/**
 * Downloads a high-resolution, beautifully formatted QR pass image (PNG).
 * Works across desktop and mobile devices.
 */
export function downloadQRCodePass({
  canvasId,
  title = "Event Pass",
  qrToken = "",
  studentName = "",
  studentId = "",
  date = "",
  venue = ""
}) {
  try {
    const sourceCanvas = document.getElementById(canvasId);
    if (!sourceCanvas) {
      console.warn("QR canvas not found for export:", canvasId);
      return false;
    }

    // High resolution card canvas (600 x 780 px)
    const exportCanvas = document.createElement("canvas");
    const width = 600;
    const height = 780;
    exportCanvas.width = width;
    exportCanvas.height = height;
    const ctx = exportCanvas.getContext("2d");

    if (!ctx) return false;

    // 1. Background (Pure White with subtle outer border)
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, width, height);

    // 2. Signature Navy & Orange Header Bar
    ctx.fillStyle = "#102a43";
    ctx.fillRect(0, 0, width, 140);

    // Orange brand strip at top
    ctx.fillStyle = "#f97316";
    ctx.fillRect(0, 0, width, 8);

    // University Title
    ctx.fillStyle = "#f97316";
    ctx.font = "bold 13px sans-serif";
    ctx.textAlign = "center";
    ctx.fillText("UNIVERSITY OF MINDANAO · TAGUM COLLEGE", width / 2, 38);

    // Event Title (Max 32 chars)
    ctx.fillStyle = "#ffffff";
    ctx.font = "bold 24px sans-serif";
    const displayTitle = title.length > 34 ? title.slice(0, 32) + "..." : title;
    ctx.fillText(displayTitle, width / 2, 74);

    // Subtitle / Pass Type
    ctx.fillStyle = "rgba(255, 255, 255, 0.85)";
    ctx.font = "14px sans-serif";
    ctx.fillText("OFFICIAL STUDENT ADMISSION PASS", width / 2, 104);

    // 3. Metadata strip (Date & Venue)
    ctx.fillStyle = "#FBFBFA";
    ctx.fillRect(0, 140, width, 60);
    ctx.strokeStyle = "#EAEAEA";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(0, 200);
    ctx.lineTo(width, 200);
    ctx.stroke();

    ctx.fillStyle = "#102a43";
    ctx.font = "bold 14px sans-serif";
    ctx.textAlign = "left";
    const metaDate = date ? `Date: ${date}` : "University Campus Event";
    ctx.fillText(metaDate, 36, 175);

    ctx.textAlign = "right";
    const metaVenue = venue ? `Venue: ${venue.length > 24 ? venue.slice(0, 22) + "..." : venue}` : "Tagum Campus";
    ctx.fillText(metaVenue, width - 36, 175);

    // 4. Center QR Code Container (White card with border)
    const qrBoxSize = 380;
    const qrBoxX = (width - qrBoxSize) / 2;
    const qrBoxY = 225;

    ctx.fillStyle = "#ffffff";
    ctx.strokeStyle = "#EAEAEA";
    ctx.lineWidth = 2;
    ctx.strokeRect(qrBoxX, qrBoxY, qrBoxSize, qrBoxSize);

    // Draw the QR Code scaled crisp in center
    const qrInnerSize = 340;
    const qrInnerX = (width - qrInnerSize) / 2;
    const qrInnerY = qrBoxY + (qrBoxSize - qrInnerSize) / 2;
    ctx.drawImage(sourceCanvas, qrInnerX, qrInnerY, qrInnerSize, qrInnerSize);

    // 5. Student Details & Pass ID
    ctx.fillStyle = "#111111";
    ctx.font = "bold 15px sans-serif";
    ctx.textAlign = "center";
    const attendeeText = studentName ? `Pass Holder: ${studentName}${studentId ? ` (${studentId})` : ""}` : "Verified Student Pass";
    ctx.fillText(attendeeText, width / 2, 640);

    // Token code in monospace
    ctx.fillStyle = "#787774";
    ctx.font = "12px monospace";
    ctx.fillText(`TOKEN ID: ${qrToken || "AUTHENTICATED"}`, width / 2, 670);

    // Security Footer Notice
    ctx.fillStyle = "#102a43";
    ctx.font = "bold 11px sans-serif";
    ctx.fillText("PRESENT THIS QR CODE AT ENTRANCE GATE FOR CHECK-IN", width / 2, 715);

    // Subtle bottom accent
    ctx.fillStyle = "#f97316";
    ctx.fillRect(0, height - 6, width, 6);

    // 6. Trigger Download
    const pngDataUrl = exportCanvas.toDataURL("image/png");
    const downloadLink = document.createElement("a");
    const sanitizedTitle = (title || "UM_Pass").replace(/[^a-zA-Z0-9]/g, "_");
    downloadLink.download = `${sanitizedTitle}_QR_Pass.png`;
    downloadLink.href = pngDataUrl;
    document.body.appendChild(downloadLink);
    downloadLink.click();
    document.body.removeChild(downloadLink);

    return true;
  } catch (error) {
    console.error("Failed to export QR code pass:", error);
    return false;
  }
}
