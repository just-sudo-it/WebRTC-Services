export interface WebRtcData {
  target: string
  sdp: string
  type : string

  offer:any
  sender:string
  answer:RTCSessionDescriptionInit
}
