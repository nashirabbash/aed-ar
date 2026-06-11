interface XRImageTrackingResult {
  imageSpace: XRSpace
  trackingState: 'tracked' | 'emulated' | 'untracked'
}

interface XRFrame {
  getImageTrackingResults(): XRImageTrackingResult[]
}

interface XRSessionInit {
  trackedImages?: Array<{ image: ImageBitmap; widthInMeters: number }>
}
