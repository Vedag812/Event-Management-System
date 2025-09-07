"use client"

import type React from "react"

import { useEffect, useRef, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Camera, CameraOff, Flashlight, FlashlightOff } from "lucide-react"
import jsQR from "jsqr"

interface QRScannerProps {
  onScan: (result: string) => void
  onError?: (error: string) => void
}

export function QRScanner({ onScan, onError }: QRScannerProps) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [isScanning, setIsScanning] = useState(false)
  const [hasCamera, setHasCamera] = useState(false)
  const [stream, setStream] = useState<MediaStream | null>(null)
  const [torchEnabled, setTorchEnabled] = useState(false)
  const [manualInput, setManualInput] = useState("")

  useEffect(() => {
    checkCameraAvailability()
    return () => {
      stopCamera()
    }
  }, [])

  const checkCameraAvailability = async () => {
    try {
      const devices = await navigator.mediaDevices.enumerateDevices()
      const videoDevices = devices.filter((device) => device.kind === "videoinput")
      setHasCamera(videoDevices.length > 0)
    } catch (error) {
      console.error("Error checking camera availability:", error)
      setHasCamera(false)
    }
  }

  const startCamera = async () => {
    try {
      // Check if getUserMedia is supported
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error("Camera not supported on this device")
      }

      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: "environment", // Use back camera if available
          width: { ideal: 1280, min: 640 },
          height: { ideal: 720, min: 480 },
        },
      })

      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream
        await videoRef.current.play()
      }

      setStream(mediaStream)
      setIsScanning(true)
      startScanning()
    } catch (error: any) {
      console.error("Error starting camera:", error)
      
      let errorMessage = "Failed to access camera. "
      if (error.name === "NotAllowedError") {
        errorMessage += "Please allow camera permissions and try again."
      } else if (error.name === "NotFoundError") {
        errorMessage += "No camera found on this device."
      } else if (error.name === "NotSupportedError") {
        errorMessage += "Camera not supported on this device."
      } else {
        errorMessage += "Please check permissions and try again."
      }
      
      onError?.(errorMessage)
    }
  }

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach((track) => track.stop())
      setStream(null)
    }
    setIsScanning(false)
    setTorchEnabled(false)
  }

  const toggleTorch = async () => {
    if (!stream) return

    try {
      const videoTrack = stream.getVideoTracks()[0]
      const capabilities = videoTrack.getCapabilities()

      if ((capabilities as any).torch) {
        await videoTrack.applyConstraints({
          advanced: [{ torch: !torchEnabled } as any],
        })
        setTorchEnabled(!torchEnabled)
      }
    } catch (error) {
      console.error("Error toggling torch:", error)
    }
  }

  const startScanning = () => {
    const scanInterval = setInterval(() => {
      if (videoRef.current && canvasRef.current && isScanning) {
        const video = videoRef.current
        const canvas = canvasRef.current
        const context = canvas.getContext("2d")

        if (context && video.readyState === video.HAVE_ENOUGH_DATA) {
          canvas.width = video.videoWidth
          canvas.height = video.videoHeight
          context.drawImage(video, 0, 0, canvas.width, canvas.height)

          // Get image data for QR code detection
          const imageData = context.getImageData(0, 0, canvas.width, canvas.height)
          
          // Detect QR code using jsQR
          const code = jsQR(imageData.data, imageData.width, imageData.height)
          
          if (code) {
            // QR code detected!
            onScan(code.data)
            stopCamera() // Stop scanning after successful detection
          }
        }
      }
    }, 100)

    // Clean up interval when component unmounts or scanning stops
    setTimeout(() => {
      if (!isScanning) {
        clearInterval(scanInterval)
      }
    }, 100)
  }

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (manualInput.trim()) {
      onScan(manualInput.trim())
      setManualInput("")
    }
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>QR Code Scanner</CardTitle>
          <CardDescription>Scan attendee QR codes to check them in</CardDescription>
        </CardHeader>
        <CardContent>
          {hasCamera ? (
            <div className="space-y-4">
              <div className="relative aspect-video bg-black rounded-lg overflow-hidden">
                {isScanning ? (
                  <>
                    <video ref={videoRef} className="w-full h-full object-cover" playsInline muted />
                    <canvas ref={canvasRef} className="hidden" />
                    <div className="absolute inset-0 border-2 border-white/50 rounded-lg">
                      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-48 h-48 border-2 border-blue-500 rounded-lg">
                        <div className="absolute top-0 left-0 w-6 h-6 border-t-4 border-l-4 border-blue-500 rounded-tl-lg"></div>
                        <div className="absolute top-0 right-0 w-6 h-6 border-t-4 border-r-4 border-blue-500 rounded-tr-lg"></div>
                        <div className="absolute bottom-0 left-0 w-6 h-6 border-b-4 border-l-4 border-blue-500 rounded-bl-lg"></div>
                        <div className="absolute bottom-0 right-0 w-6 h-6 border-b-4 border-r-4 border-blue-500 rounded-br-lg"></div>
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="flex items-center justify-center h-full text-white">
                    <div className="text-center">
                      <Camera className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <p>Camera not started</p>
                    </div>
                  </div>
                )}
              </div>

              <div className="flex gap-2 justify-center">
                {!isScanning ? (
                  <Button onClick={startCamera} className="flex-1">
                    <Camera className="h-4 w-4 mr-2" />
                    Start Camera
                  </Button>
                ) : (
                  <>
                    <Button onClick={stopCamera} variant="outline" className="flex-1 bg-transparent">
                      <CameraOff className="h-4 w-4 mr-2" />
                      Stop Camera
                    </Button>
                    <Button onClick={toggleTorch} variant="outline">
                      {torchEnabled ? <FlashlightOff className="h-4 w-4" /> : <Flashlight className="h-4 w-4" />}
                    </Button>
                  </>
                )}
              </div>
            </div>
          ) : (
            <div className="text-center py-8">
              <Camera className="h-12 w-12 mx-auto mb-4 text-gray-400" />
              <p className="text-gray-600 mb-4">Camera not available</p>
              <p className="text-sm text-gray-500">Please use manual input below</p>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Manual Input</CardTitle>
          <CardDescription>Enter QR code manually if camera scanning is not available</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleManualSubmit} className="flex gap-2">
            <input
              type="text"
              placeholder="Enter QR code..."
              value={manualInput}
              onChange={(e) => setManualInput(e.target.value)}
              className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <Button type="submit" disabled={!manualInput.trim()}>
              Check In
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
