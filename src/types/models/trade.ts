export interface Trade {
  data: Datum[]
  type: string
}

export interface Datum {
  c: null
  p: number
  s: string
  t: number
  v: number
}
