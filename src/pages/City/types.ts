interface infoTemp {
    dt: string,
    maxTemp: number,
    minTemp: number,
}

interface tableType {
  max: infoTemp,
  min: infoTemp,
}

export type {
  tableType,
}
