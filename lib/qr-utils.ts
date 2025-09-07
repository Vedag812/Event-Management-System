import QRCode from "qrcode"

export async function generateQRCodeDataURL(text: string, size = 200): Promise<string> {
  try {
    const dataURL = await QRCode.toDataURL(text, {
      width: size,
      margin: 2,
      color: {
        dark: "#000000",
        light: "#FFFFFF",
      },
    })
    return dataURL
  } catch (error) {
    console.error("Error generating QR code:", error)
    throw new Error("Failed to generate QR code")
  }
}

export async function downloadQRCode(qrCode: string, filename = "qr-code.png") {
  try {
    const dataURL = await generateQRCodeDataURL(qrCode, 400)

    // Create download link
    const link = document.createElement("a")
    link.href = dataURL
    link.download = filename
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  } catch (error) {
    console.error("Error downloading QR code:", error)
    throw new Error("Failed to download QR code")
  }
}
