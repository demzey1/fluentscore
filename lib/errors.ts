export class ExplorerError extends Error {
  code = "EXPLORER_UNAVAILABLE" as const;
}

export class DataUnavailableError extends Error {
  code = "DATA_UNAVAILABLE" as const;
}

export class InvalidAddressError extends Error {
  code = "INVALID_ADDRESS" as const;
}
